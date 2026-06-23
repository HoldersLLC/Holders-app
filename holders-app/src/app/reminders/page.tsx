'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Bell, Trash2 } from 'lucide-react'
import { Firearm, ReminderType } from '@/types'

const REMINDER_TYPES: ReminderType[] = ['Cleaning Due', 'Inspection Due', 'Optic Battery Due', 'Carry Gun Inspection', 'Parts Replacement']

export default function RemindersPage() {
  const supabase = createClient()
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firearm_id: '', reminder_type: 'Cleaning Due' as ReminderType, due_date: '', due_rounds: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: fa }, { data: rm }] = await Promise.all([
      supabase.from('firearms').select('id, manufacturer, model').eq('user_id', user.id),
      supabase.from('reminders').select('*, firearms(manufacturer, model)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    if (fa) setFirearms(fa as Firearm[])
    if (rm) setReminders(rm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firearm_id) { toast.error('Select a firearm'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      firearm_id: form.firearm_id,
      reminder_type: form.reminder_type,
      due_date: form.due_date || null,
      due_rounds: form.due_rounds ? parseInt(form.due_rounds) : null,
    })
    if (error) { toast.error(error.message) } else {
      toast.success('Reminder set!')
      setShowForm(false)
      setForm({ firearm_id: '', reminder_type: 'Cleaning Due', due_date: '', due_rounds: '' })
      fetchData()
    }
    setLoading(false)
  }

  async function deleteReminder(id: string) {
    await supabase.from('reminders').delete().eq('id', id)
    toast.success('Reminder removed')
    fetchData()
  }

  async function toggleReminder(id: string, current: boolean) {
    await supabase.from('reminders').update({ is_active: !current }).eq('id', id)
    fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Reminders</h1>
          <p className="page-subheader">Set due-date and round-count reminders for your firearms</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-brand-500/30">
          <h2 className="font-semibold text-white mb-4">New Reminder</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Firearm *</label>
              <select className="input" value={form.firearm_id} onChange={e => setForm(p => ({ ...p, firearm_id: e.target.value }))} required>
                <option value="">Select firearm</option>
                {firearms.map(f => <option key={f.id} value={f.id}>{f.manufacturer} {f.model}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Reminder Type</label>
              <select className="input" value={form.reminder_type} onChange={e => setForm(p => ({ ...p, reminder_type: e.target.value as ReminderType }))}>
                {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Due at Round Count</label>
              <input type="number" className="input" placeholder="5000" value={form.due_rounds} onChange={e => setForm(p => ({ ...p, due_rounds: e.target.value }))} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Set Reminder'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-white mb-4">All Reminders</h2>
        {reminders.length > 0 ? (
          <div className="space-y-2">
            {reminders.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 ${r.is_active ? 'text-brand-400' : 'text-slate-600'}`} />
                  <div>
                    <div className={`text-sm font-medium ${r.is_active ? 'text-white' : 'text-slate-500'}`}>{r.reminder_type}</div>
                    <div className="text-xs text-slate-400">{r.firearms?.manufacturer} {r.firearms?.model}</div>
                    <div className="text-xs text-slate-500">
                      {r.due_date && `Due: ${new Date(r.due_date).toLocaleDateString()}`}
                      {r.due_rounds && ` · At ${r.due_rounds.toLocaleString()} rounds`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleReminder(r.id, r.is_active)} className={`text-xs px-2 py-1 rounded border transition-colors ${r.is_active ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/30' : 'border-surface-border text-slate-500 hover:text-white'}`}>
                    {r.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No reminders set</p>
          </div>
        )}
      </div>
    </div>
  )
}
