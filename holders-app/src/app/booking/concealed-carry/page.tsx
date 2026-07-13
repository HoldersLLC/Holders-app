'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Calendar, Clock, Users, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConcealedCarryPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { fetchClasses() }, [])

  async function fetchClasses() {
    const res = await fetch('/api/booking/classes')
    const data = await res.json()
    setClasses(data.classes || [])
    setLoading(false)
  }

  function handleApply(cls: any) {
    setSelectedClass(cls)
    setShowApplyForm(true)
  }

  function handleEmailApply() {
    if (!selectedClass) return
    const subject = encodeURIComponent(`Concealed Carry Class Application — ${new Date(selectedClass.class_date).toLocaleDateString()}`)
    const body = encodeURIComponent(`Hi,\n\nI'd like to apply for the Concealed Carry Class on ${new Date(selectedClass.class_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message ? `Additional Info: ${form.message}` : ''}\n\nThank you!`)
    window.location.href = `mailto:Sales@holders.llc?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Application Sent!</h2>
          <p className="text-slate-400 mb-6">Your email application has been opened. Send the email to complete your application for the class on {new Date(selectedClass?.class_date).toLocaleDateString()}.</p>
          <Link href="/booking" className="btn-secondary block">Back to Services</Link>
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
            <h1 className="text-2xl font-bold text-white">Concealed Carry Classes</h1>
            <p className="text-slate-400 text-sm">Full-day certification course · 8 hours</p>
          </div>
        </div>

        {/* What's included */}
        <div className="card mb-6 border-purple-500/20 bg-purple-500/5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> What's Included
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            {[
              '✅ State-required curriculum',
              '✅ Firearm safety fundamentals',
              '✅ Live fire qualification',
              '✅ Legal carry requirements',
              '✅ Situational awareness training',
              '✅ Certification upon completion',
            ].map(item => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <h2 className="font-semibold text-white mb-4">Upcoming Classes</h2>

        {loading && <p className="text-slate-400 text-sm">Loading classes…</p>}

        {!loading && classes.length === 0 && (
          <div className="card text-center py-10">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">No Classes Scheduled</h3>
            <p className="text-slate-400 text-sm mb-4">Classes are scheduled as needed. Email us to get on the waitlist or request a class date.</p>
            <a
              href="mailto:Sales@holders.llc?subject=Concealed Carry Class Interest&body=Hi, I'm interested in attending a Concealed Carry Class. Please let me know when the next class is scheduled."
              className="btn-primary inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Email to Get on Waitlist
            </a>
          </div>
        )}

        {classes.map(cls => (
          <div key={cls.id} className="card mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{cls.title}</h3>
                {cls.description && <p className="text-slate-400 text-sm mt-1">{cls.description}</p>}
              </div>
              {cls.price > 0 && (
                <span className="text-brand-400 font-bold text-lg">${cls.price}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-brand-400" />
                {new Date(cls.class_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-brand-400" />
                {cls.start_time} — {cls.end_time}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-brand-400" />
                {cls.current_students}/{cls.max_students} students enrolled
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="w-4 h-4 text-brand-400" />
                {cls.location}
              </div>
            </div>

            {/* Availability bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Availability</span>
                <span>{cls.max_students - cls.current_students} spots left</span>
              </div>
              <div className="w-full bg-surface-border rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${(cls.current_students / cls.max_students) * 100}%` }}
                />
              </div>
            </div>

            {cls.current_students >= cls.max_students ? (
              <div className="btn-secondary w-full text-center opacity-50 cursor-not-allowed">Class Full</div>
            ) : (
              <button onClick={() => handleApply(cls)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Apply for This Class
              </button>
            )}
          </div>
        ))}

        {/* Apply Form Modal */}
        {showApplyForm && selectedClass && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card border border-surface-border rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-surface-border">
                <div>
                  <h3 className="font-semibold text-white">Apply for Class</h3>
                  <p className="text-slate-400 text-sm">{new Date(selectedClass.class_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button onClick={() => setShowApplyForm(false)} className="text-slate-400 hover:text-white text-xl">×</button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-slate-400 text-sm">Fill in your details and we'll open your email to send your application to Sales@holders.llc</p>
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="(555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Additional Info</label>
                  <textarea className="input h-20 resize-none" placeholder="Any questions or special requirements…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowApplyForm(false)} className="btn-secondary">Cancel</button>
                  <button onClick={handleEmailApply} disabled={!form.name || !form.email} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Open Email to Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
