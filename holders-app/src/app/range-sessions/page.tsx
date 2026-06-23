'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Target } from 'lucide-react'
import { Firearm } from '@/types'

export default function RangeSessionsPage() {
  const supabase = createClient()
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firearm_id: '', date: new Date().toISOString().split('T')[0],
    range_name: '', weather: '', distance: '', ammo_brand: '',
    ammo_grain: '', rounds_fired: '', group_size: '', notes: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: fa }, { data: rs }] = await Promise.all([
      supabase.from('firearms').select('id, manufacturer, model').eq('user_id', user.id),
      supabase.from('range_sessions').select('*, firearms(manufacturer, model)').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
    ])
    if (fa) setFirearms(fa as Firearm[])
    if (rs) setSessions(rs)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firearm_id) { toast.error('Select a firearm'); return }
    if (!form.rounds_fired || parseInt(form.rounds_fired) <= 0) { toast.error('Enter rounds fired'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('range_sessions').insert({
      user_id: user.id,
      firearm_id: form.firearm_id,
      date: form.date,
      range_name: form.range_name || null,
      weather: form.weather || null,
      distance: form.distance || null,
      ammo_brand: form.ammo_brand || null,
      ammo_grain: form.ammo_grain || null,
      rounds_fired: parseInt(form.rounds_fired),
      group_size: form.group_size || null,
      notes: form.notes || null,
    })

    if (error) { toast.error(error.message) } else {
      toast.success('Range session logged! Round count updated.')
      setShowForm(false)
      setForm({ firearm_id: '', date: new Date().toISOString().split('T')[0], range_name: '', weather: '', distance: '', ammo_brand: '', ammo_grain: '', rounds_fired: '', group_size: '', notes: '' })
      fetchData()
    }
    setLoading(false)
  }

  const totalRounds = sessions.reduce((sum, s) => sum + (s.rounds_fired || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Range Log</h1>
          <p className="page-subheader">{sessions.length} sessions · {totalRounds.toLocaleString()} total rounds logged</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Log Session
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-brand-500/30">
          <h2 className="font-semibold text-white mb-4">Log Range Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Firearm *</label>
              <select className="input" value={form.firearm_id} onChange={e => setForm(p => ({ ...p, firearm_id: e.target.value }))} required>
                <option value="">Select firearm</option>
                {firearms.map(f => <option key={f.id} value={f.id}>{f.manufacturer} {f.model}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Rounds Fired *</label>
              <input type="number" className="input" placeholder="50" value={form.rounds_fired} onChange={e => setForm(p => ({ ...p, rounds_fired: e.target.value }))} required min="1" />
            </div>
            <div>
              <label className="label">Range Name</label>
              <input className="input" placeholder="Local Gun Club" value={form.range_name} onChange={e => setForm(p => ({ ...p, range_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Distance</label>
              <input className="input" placeholder="25 yards" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} />
            </div>
            <div>
              <label className="label">Weather</label>
              <input className="input" placeholder="Clear, 72°F" value={form.weather} onChange={e => setForm(p => ({ ...p, weather: e.target.value }))} />
            </div>
            <div>
              <label className="label">Ammo Brand</label>
              <input className="input" placeholder="Federal" value={form.ammo_brand} onChange={e => setForm(p => ({ ...p, ammo_brand: e.target.value }))} />
            </div>
            <div>
              <label className="label">Ammo Grain</label>
              <input className="input" placeholder="115gr" value={form.ammo_grain} onChange={e => setForm(p => ({ ...p, ammo_grain: e.target.value }))} />
            </div>
            <div>
              <label className="label">Group Size</label>
              <input className="input" placeholder='1.5"' value={form.group_size} onChange={e => setForm(p => ({ ...p, group_size: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Optional notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Log Session'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-4">Session History</h2>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{s.rounds_fired} rounds · {s.firearms?.manufacturer} {s.firearms?.model}</div>
                    <div className="text-xs text-slate-400">
                      {[s.range_name, s.distance, s.ammo_brand && `${s.ammo_brand} ${s.ammo_grain || ''}`.trim()].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No range sessions logged yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
