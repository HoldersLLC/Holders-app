'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function InspectionBookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [closed, setClosed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', firearm_info: '', notes: ''
  })

  // Get min date (tomorrow) and max date (3 months out)
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 1)
  const maxDate = new Date(today)
  maxDate.setMonth(today.getMonth() + 3)

  async function handleDateChange(date: string) {
    setSelectedDate(date)
    setSelectedTime('')
    setLoadingSlots(true)
    setClosed(false)

    const res = await fetch(`/api/booking/slots?date=${date}`)
    const data = await res.json()

    if (data.closed) {
      setClosed(true)
      setAvailableSlots([])
    } else {
      setAvailableSlots(data.slots || [])
    }
    setLoadingSlots(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/booking/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        service_type: 'Inspection',
        appointment_date: selectedDate,
        appointment_time: selectedTime,
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
          <h2 className="text-xl font-bold text-white mb-2">Request Submitted!</h2>
          <p className="text-slate-400 mb-2">We've received your inspection request for:</p>
          <p className="text-white font-medium mb-1">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <p className="text-brand-400 font-medium mb-6">{selectedTime}</p>
          <p className="text-slate-400 text-sm mb-6">A confirmation email has been sent to {form.email}. We'll confirm your appointment shortly.</p>
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
            <h1 className="text-2xl font-bold text-white">Firearm Inspection</h1>
            <p className="text-slate-400 text-sm">Tue-Fri: 5-7PM · Saturday: 11AM-7PM</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-brand-500 text-white' : 'bg-surface-muted text-slate-500 border border-surface-border'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${step > s ? 'bg-brand-500' : 'bg-surface-border'}`} />}
            </div>
          ))}
          <span className="text-slate-400 text-sm ml-2">
            {step === 1 ? 'Select Date & Time' : step === 2 ? 'Your Details' : 'Confirm'}
          </span>
        </div>

        {/* Step 1 — Date & Time */}
        {step === 1 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" /> Select a Date
            </h2>
            <input
              type="date"
              className="input mb-6"
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
            />

            {loadingSlots && <p className="text-slate-400 text-sm">Checking availability…</p>}

            {closed && (
              <div className="bg-surface-muted rounded-lg p-4 border border-surface-border">
                <p className="text-slate-400 text-sm">We're closed on this day. Please select a Tuesday through Saturday.</p>
              </div>
            )}

            {availableSlots.length > 0 && (
              <>
                <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" /> Available Times
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        selectedTime === slot
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-surface-muted text-slate-300 border-surface-border hover:border-brand-500/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}

            {availableSlots.length === 0 && selectedDate && !loadingSlots && !closed && (
              <div className="bg-surface-muted rounded-lg p-4 border border-surface-border">
                <p className="text-slate-400 text-sm">No available slots for this date. Please try another day.</p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="btn-primary w-full mt-6"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — Contact Info */}
        {step === 2 && (
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Your Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Firearm (Make, Model, Caliber)</label>
                <input className="input" placeholder="e.g. Glock 19, 9mm" value={form.firearm_info} onChange={e => setForm(p => ({ ...p, firearm_info: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input h-20 resize-none" placeholder="Any concerns or specific areas to check…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(3)} disabled={!form.name || !form.email} className="btn-primary flex-1">Review Booking</button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="font-semibold text-white mb-4">Confirm Your Appointment</h2>
            <div className="bg-surface-muted rounded-lg p-4 border border-surface-border mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service</span>
                <span className="text-white font-medium">Firearm Inspection</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="text-white">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Name</span>
                <span className="text-white">{form.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Email</span>
                <span className="text-white">{form.email}</span>
              </div>
              {form.firearm_info && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Firearm</span>
                  <span className="text-white">{form.firearm_info}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-surface-border">
                <span className="text-slate-400">Cost</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
