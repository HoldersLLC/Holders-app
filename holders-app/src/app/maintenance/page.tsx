'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Wrench } from 'lucide-react'
import { ServiceType, Firearm, Maintenance } from '@/types'

const SERVICE_TYPES: ServiceType[] = ['Cleaning', 'Lubrication', 'Inspection', 'Parts Replacement', 'Optic Re-Zero', 'Other']

export default function MaintenancePage() {
  const supabase = createClient()
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firearm_id: '', service_type: 'Cleaning' as ServiceType, date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: fa }, { data: ml }] = await Promise.all([
      supabase.from('firearms').select('id, manufacturer, model').eq('user_id', user.id),
      supabase.from('maintenance').select('*, firearms(manufacturer, model)').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
    ])
    if (fa) setFirearms(fa as Firearm[])
    if (ml) setLogs(ml)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firearm_id) { toast.error('Select a firearm'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('maintenance').insert({
      user_id: user.id,
      firearm_id: form.firearm_id,
      service_type: form.service_type,
      date: form.date,
      notes: form.notes || null,
    })

    // Update last cleaning/inspection date on firearm
    if (!error) {
      const updates: any = {}
      if (form.service_type === 'Cleaning') updates.last_cleaning_date = form.date
      if (form.service_type === 'Inspection') updates.last_inspection_date = form.date
      if (Object.keys(updates).length) {
        await supabase.from('firearms').update({ ...updates, maintenance_status: 'Good', updated_at: new Date().toISOString() }).eq('id', form.firearm_id)
      }
      toast.success('Maintenance logged!')
      setShowForm(false)
      setForm({ firearm_id: '', service_type: 'Cleaning', date: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    } else {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Maintenance</h1>
          <p className="page-subheader">Track cleaning, lubrication, inspections, and parts</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Log Service
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-brand-500/30">
          <h2 className="font-semibold text-white mb-4">Log Maintenance</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Firearm *</label>
              <select className="input" value={form.firearm_id} onChange={e => setForm(p => ({ ...p, firearm_id: e.target.value }))} required>
                <option value="">Select firearm</option>
                {firearms.map(f => <option key={f.id} value={f.id}>{f.manufacturer} {f.model}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Service Type *</label>
              <select className="input" value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value as ServiceType }))}>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Optional notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Log Maintenance'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-4">Maintenance History</h2>
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center border border-brand-500/20">
                    <Wrench className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{log.service_type}</div>
                    <div className="text-xs text-slate-400">{log.firearms?.manufacturer} {log.firearms?.model}</div>
                    {log.notes && <div className="text-xs text-slate-500 mt-0.5">{log.notes}</div>}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{new Date(log.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No maintenance logged yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
