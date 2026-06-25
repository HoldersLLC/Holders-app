'use client'
import { useState } from 'react'
import { CreditCard, Zap } from 'lucide-react'
import Link from 'next/link'

export default function BillingCard({ membership }: { membership: string }) {
  const [loading, setLoading] = useState(false)

  async function openBillingPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Something went wrong')
    }
    setLoading(false)
  }

  const planLabels: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    admin: 'Admin',
  }

  const planColors: Record<string, string> = {
    free: 'text-slate-400',
    basic: 'text-blue-400',
    pro: 'text-brand-400',
    admin: 'text-purple-400',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-400" /> Subscription
        </h2>
        <span className={`font-bold text-sm ${planColors[membership] || 'text-slate-400'}`}>
          {planLabels[membership] || 'Free'} Plan
        </span>
      </div>

      {membership === 'free' ? (
        <div>
          <p className="text-slate-400 text-sm mb-4">
            Upgrade to unlock unlimited firearms, range logging, documents, and more.
          </p>
          <Link href="/pricing" className="btn-primary flex items-center gap-2 w-full justify-center">
            <Zap className="w-4 h-4" /> Upgrade Plan
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm mb-4">
            Manage your subscription, update payment method, or cancel anytime.
          </p>
          <button onClick={openBillingPortal} disabled={loading} className="btn-secondary w-full">
            {loading ? 'Loading…' : 'Manage Billing'}
          </button>
        </div>
      )}
    </div>
  )
}
