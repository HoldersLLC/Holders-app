'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Check, Zap } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const required = searchParams.get('required')

  async function handleCheckout(priceId: string, planKey: string) {
    setLoading(planKey)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
    } catch {
      alert('Something went wrong')
    }
    setLoading(null)
  }

  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started tracking your collection',
      features: ['Up to 3 firearms', 'Basic maintenance logging', 'Dashboard overview'],
      missing: ['Range session logging', 'Document storage', 'PDF reports', 'AI Assistant'],
      cta: 'Get Started',
      priceId: null,
      highlight: false,
    },
    {
      key: 'basic',
      name: 'Basic',
      price: billing === 'monthly' ? '$4.99' : '$49.99',
      period: billing === 'monthly' ? '/month' : '/year',
      savings: billing === 'annual' ? 'Save $9.89' : null,
      description: 'For serious collectors',
      features: ['Unlimited firearms', 'Maintenance logging', 'Range session logging', 'Document storage', 'Reminders', 'Inventory valuation'],
      missing: ['PDF reports', 'AI Assistant'],
      cta: 'Start Basic',
      priceId: billing === 'monthly' ? PLANS.basic.monthlyPriceId : PLANS.basic.annualPriceId,
      highlight: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      price: billing === 'monthly' ? '$9.99' : '$99.99',
      period: billing === 'monthly' ? '/month' : '/year',
      savings: billing === 'annual' ? 'Save $19.89' : null,
      description: 'The complete toolkit',
      features: ['Everything in Basic', 'PDF report generation', 'AI Maintenance Assistant', 'Priority support', 'Early access to new features'],
      missing: [],
      cta: 'Start Pro',
      priceId: billing === 'monthly' ? PLANS.pro.monthlyPriceId : PLANS.pro.annualPriceId,
      highlight: true,
    },
  ]

  return (
    <div className="min-h-screen bg-surface px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-brand-400" />
            <span className="font-bold text-white text-xl">Holders</span>
          </div>
          {required && (
            <div className="inline-block bg-yellow-900/30 border border-yellow-700 text-yellow-400 text-sm px-4 py-2 rounded-lg mb-4">
              You need a {required === 'pro' ? 'Pro' : 'Basic'} plan to access this feature
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h1>
          <p className="text-slate-400">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'annual' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Annual <span className="text-emerald-400 text-xs ml-1">Save ~17%</span>
          </button>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`card relative flex flex-col ${plan.highlight ? 'border-brand-500/50 bg-brand-500/5' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                </div>
                {plan.savings && <div className="text-emerald-400 text-xs mt-1">{plan.savings}</div>}
              </div>

              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm opacity-40">
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                      <div className="w-3 h-px bg-slate-600" />
                    </div>
                    <span className="text-slate-500">{f}</span>
                  </div>
                ))}
              </div>

              {plan.priceId ? (
                <button
                  onClick={() => handleCheckout(plan.priceId!, plan.key)}
                  disabled={loading === plan.key}
                  className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  {loading === plan.key ? 'Loading…' : plan.cta}
                </button>
              ) : (
                <button onClick={() => router.push('/auth/signup')} className="btn-secondary w-full">
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Cancel anytime. No contracts. Questions? Contact us at support@holders.llc
        </p>
      </div>
    </div>
  )
}
