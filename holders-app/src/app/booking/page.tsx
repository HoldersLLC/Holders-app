'use client'
import Link from 'next/link'
import { Shield, Search, Wrench, BookOpen, ChevronRight, Clock, Calendar } from 'lucide-react'

const SERVICES = [
  {
    href: '/booking/inspection',
    icon: Search,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20',
    title: 'Firearm Inspection',
    description: 'Annual safety inspections and function checks by a certified gunsmith.',
    details: ['Tuesday - Friday: 5:00 PM - 7:00 PM', 'Saturday: 11:00 AM - 7:00 PM', '1 hour appointments', 'Free to book'],
  },
  {
    href: '/booking/dropoff',
    icon: Wrench,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Drop-Off Repair',
    description: 'Leave your firearm with us for repairs. Timeline depends on the service needed.',
    details: ['Tuesday - Saturday: 11:00 AM - 7:00 PM', 'We will contact you with timeline', 'All repairs by certified gunsmith', 'Free to drop off'],
  },
  {
    href: '/booking/concealed-carry',
    icon: BookOpen,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Concealed Carry Class',
    description: 'Full-day concealed carry certification course. Apply by email to reserve your spot.',
    details: ['Full day — 8 hours', 'Scheduled as needed', 'Certification included', 'Apply via email'],
  },
]

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-brand-400" />
            <span className="font-bold text-white text-xl">Holders LLC</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Book an Appointment</h1>
          <p className="text-slate-400">Select a service below to get started</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Tue-Sat: 11AM-7PM</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Free to book</span>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="space-y-4">
          {SERVICES.map(service => (
            <Link
              key={service.href}
              href={service.href}
              className="card hover:border-brand-500/30 transition-all group flex items-start gap-5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${service.bg}`}>
                <service.icon className={`w-6 h-6 ${service.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-white text-lg mb-1 group-hover:text-brand-400 transition-colors">
                  {service.title}
                </h2>
                <p className="text-slate-400 text-sm mb-3">{service.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {service.details.map(detail => (
                    <span key={detail} className="text-xs text-slate-500">· {detail}</span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Questions? Email us at{' '}
            <a href="mailto:Sales@holders.llc" className="text-brand-400 hover:underline">Sales@holders.llc</a>
          </p>
          <Link href="/dashboard" className="text-slate-600 text-sm hover:text-slate-400 mt-2 inline-block">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
