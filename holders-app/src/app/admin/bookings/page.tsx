'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, Wrench, Search, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  confirmed: 'badge bg-blue-900/50 text-blue-400 border border-blue-800',
  completed: 'badge bg-emerald-900/50 text-emerald-400 border border-emerald-800',
  cancelled: 'badge bg-red-900/50 text-red-400 border border-red-800',
}

const SERVICE_ICONS: Record<string, any> = {
  'Inspection': Search,
  'Drop-off Repair': Wrench,
  'Concealed Carry Class': BookOpen,
}

export default function AdminBookingsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'appointments' | 'classes'>('appointments')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewClass, setShowNewClass] = useState(false)
  const [newClass, setNewClass] = useState({ title: 'Concealed Carry Class', class_date: '', start_time: '9:00 AM', end_time: '5:00 PM', max_students: 10, price: 0, description: '', location: 'Holders LLC' })
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [apptRes, classRes] = await Promise.all([
      fetch('/api/booking/appointments'),
      fetch('/api/booking/classes'),
    ])
    const apptData = await apptRes.json()
    const classData = await classRes.json()
    setAppointments(apptData.appointments || [])
    setClasses(classData.classes || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    await supabase.from('appointments').update({ status }).eq('id', id)
    toast.success(`Marked as ${status}`)
    fetchData()
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/booking/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    })
    const data = await res.json()
    if (data.class) {
      toast.success('Class created!')
      setShowNewClass(false)
      setNewClass({ title: 'Concealed Carry Class', class_date: '', start_time: '9:00 AM', end_time: '5:00 PM', max_students: 10, price: 0, description: '', location: 'Holders LLC' })
      fetchData()
    } else {
      toast.error(data.error || 'Failed to create class')
    }
  }

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400">Loading…</div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Bookings</h1>
          <p className="page-subheader">{appointments.filter(a => a.status === 'pending').length} pending · {appointments.length} total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('appointments')} className={activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}>
          Appointments ({appointments.length})
        </button>
        <button onClick={() => setActiveTab('classes')} className={activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}>
          Classes ({classes.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-brand-500 text-white' : 'bg-surface-muted text-slate-400 border border-surface-border hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredAppointments.map(appt => {
              const Icon = SERVICE_ICONS[appt.service_type] || Calendar
              return (
                <div key={appt.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-surface-muted rounded-lg flex items-center justify-center border border-surface-border flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-white">{appt.name}</span>
                          <span className={STATUS_COLORS[appt.status]}>{appt.status}</span>
                        </div>
                        <div className="text-sm text-slate-400">{appt.service_type}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(appt.appointment_date).toLocaleDateString()}</span>
                          {appt.appointment_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.appointment_time}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)} className="btn-ghost p-1">
                      {expandedId === appt.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedId === appt.id && (
                    <div className="mt-4 pt-4 border-t border-surface-border space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300"><Mail className="w-3 h-3 text-slate-500" />{appt.email}</div>
                        {appt.phone && <div className="flex items-center gap-2 text-slate-300"><Phone className="w-3 h-3 text-slate-500" />{appt.phone}</div>}
                        {appt.firearm_info && <div className="col-span-2 flex items-center gap-2 text-slate-300"><Search className="w-3 h-3 text-slate-500" />{appt.firearm_info}</div>}
                        {appt.repair_description && <div className="col-span-2 flex items-center gap-2 text-slate-300"><Wrench className="w-3 h-3 text-slate-500" />{appt.repair_description}</div>}
                        {appt.notes && <div className="col-span-2 text-slate-400 text-xs">{appt.notes}</div>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        {appt.status === 'pending' && (
                          <button onClick={() => updateStatus(appt.id, 'confirmed')} className="btn-primary text-xs py-1.5 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Confirm
                          </button>
                        )}
                        {appt.status === 'confirmed' && (
                          <button onClick={() => updateStatus(appt.id, 'completed')} className="btn-primary text-xs py-1.5 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Mark Complete
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(appt.id, 'cancelled')} className="btn-secondary text-xs py-1.5 flex items-center gap-1 text-red-400 hover:text-red-300">
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        )}
                        <a href={`mailto:${appt.email}`} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email Customer
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredAppointments.length === 0 && (
              <div className="card text-center py-10 text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No {filter === 'all' ? '' : filter} appointments</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <>
          <button onClick={() => setShowNewClass(!showNewClass)} className="btn-primary flex items-center gap-2 mb-6">
            <Plus className="w-4 h-4" /> Schedule New Class
          </button>

          {showNewClass && (
            <form onSubmit={createClass} className="card mb-6 border-brand-500/30">
              <h2 className="font-semibold text-white mb-4">New Concealed Carry Class</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Title</label>
                  <input className="input" value={newClass.title} onChange={e => setNewClass(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input" value={newClass.class_date} onChange={e => setNewClass(p => ({ ...p, class_date: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={newClass.location} onChange={e => setNewClass(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Start Time</label>
                  <input className="input" value={newClass.start_time} onChange={e => setNewClass(p => ({ ...p, start_time: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input className="input" value={newClass.end_time} onChange={e => setNewClass(p => ({ ...p, end_time: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Max Students</label>
                  <input type="number" className="input" value={newClass.max_students} onChange={e => setNewClass(p => ({ ...p, max_students: parseInt(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Price ($)</label>
                  <input type="number" step="0.01" className="input" value={newClass.price} onChange={e => setNewClass(p => ({ ...p, price: parseFloat(e.target.value) }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input h-20 resize-none" value={newClass.description} onChange={e => setNewClass(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">Create Class</button>
                <button type="button" onClick={() => setShowNewClass(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {classes.map(cls => (
              <div key={cls.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{cls.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(cls.class_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.start_time} - {cls.end_time}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{cls.current_students}/{cls.max_students}</span>
                    </div>
                  </div>
                  {cls.price > 0 && <span className="text-brand-400 font-bold">${cls.price}</span>}
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="card text-center py-10 text-slate-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No classes scheduled yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
