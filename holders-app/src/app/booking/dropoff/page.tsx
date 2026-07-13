'use client'
import { useState } from 'react'
import { ArrowLeft, Wrench, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const REPAIR_TYPES = [
  'Trigger work', 'Sight installation', 'Barrel replacement',
  'Extractor/ejector repair', 'Feed ramp polishing', 'Slide/frame work',
  'Optic mounting', 'Suppressor work', 'General malfunction', 'Other'
]

export default function DropoffPage() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    firearm_info: '', repair_description: '',
    preferred_date: '', notes: ''
  })

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/booking/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        service_type: 'Drop-off Repair',
        appointment_date: form.preferred_date,
      }),
    })

    const data = await res.json()
    if (data.success) {
      setSuccess(true)
    } else {
      toast.error(data.error || 'Something went wrong')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Drop-Off Request Submitted!</h2>
          <p className="text-slate-400 mb-4">We've received your repair request. A confirmation has been sent to {form.email}.</p>
          <p className="text-slate-400 text-sm mb-6">We'll contact you with a timeline and cost estimate before any work begins.</p>
          <Link href="/booking" className="btn-secondary block">Book Another Service</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/booking" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Drop-Off Repair</h1>
            <p className="text-slate-400 text-sm">Tuesday - Saturday · 11AM - 7PM</p>
          </div>
        </div>

        <div className="card mb-4 border-brand-500/20 bg-brand-500/5">
          <div className="flex gap-3">
            <Wrench className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-white mb-1">How drop-offs work</p>
              <p>Bring your firearm in during shop hours. We'll assess the repair and contact you with a timeline and cost estimate before any work begins. All repairs performed by a certified gunsmith.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-semibold text-white">Your Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>

          <div className="border-t border-surface-border pt-4">
            <h2 className="font-semibold text-white mb-4">Firearm & Repair Details</h2>
            <div>
              <label className="label">Firearm (Make, Model, Caliber, Serial #) *</label>
              <input className="input" placeholder="e.g. Glock 19 Gen 5, 9mm, Serial: ABC123" value={form.firearm_info} onChange={e => setForm(p => ({ ...p, firearm_info: e.target.value }))} required />
            </div>
          </div>

          <div>
            <label className="label">Type of Repair Needed *</label>
            <select className="input" value={form.repair_description} onChange={e => setForm(p => ({ ...p, repair_description: e.target.value }))} required>
              <option value="">Select repair type…</option>
              {REPAIR_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Describe the Issue</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Describe the problem in detail — what's happening, when it started, any relevant history…"
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Preferred Drop-Off Date</label>
            <input
              type="date"
              className="input"
              min={minDate.toISOString().split('T')[0]}
              value={form.preferred_date}
              onChange={e => setForm(p => ({ ...p, preferred_date: e.target.value }))}
            />
            <p className="text-slate-500 text-xs mt-1">Walk-ins welcome during shop hours. Date is preferred, not required.</p>
          </div>

          <button type="submit" disabled={submitting || !form.name || !form.email || !form.phone || !form.firearm_info || !form.repair_description} className="btn-primary w-full mt-2">
            {submitting ? 'Submitting…' : 'Submit Drop-Off Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
