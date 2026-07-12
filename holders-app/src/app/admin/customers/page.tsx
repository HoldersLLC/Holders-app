'use client'
import { useState, useEffect } from 'react'
import { Users, Crosshair, Wrench, Mail, Zap, Send, Eye, ChevronDown, ChevronUp, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

const CAMPAIGN_TYPES = [
  { key: 'hunting_season', label: '🦌 Hunting Season', auto: false },
  { key: 'quarterly_newsletter', label: '📰 Quarterly Newsletter', auto: true },
  { key: 'inspection_reminder', label: '🔍 Inspection Reminder', auto: false },
  { key: 'training_options', label: '🎯 Training Options', auto: false },
  { key: 'loyal_customer_discount', label: '⭐ Loyal Customer 5% Discount', auto: true },
]

export default function AdminCRMPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({})
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null)
  const [emailPreview, setEmailPreview] = useState<{ html: string; customer: any; type: string } | null>(null)
  const [generatingEmail, setGeneratingEmail] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [bulkCampaign, setBulkCampaign] = useState('')

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/admin/customers')
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch { toast.error('Failed to load customers') }
    setLoading(false)
  }

  async function getAISummary(customer: any) {
    setLoadingSummary(customer.id)
    try {
      const res = await fetch('/api/admin/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer }),
      })
      const data = await res.json()
      setAiSummaries(prev => ({ ...prev, [customer.id]: data.summary }))
    } catch { toast.error('Failed to generate summary') }
    setLoadingSummary(null)
  }

  async function generateEmail(customer: any, campaignType: string) {
    setGeneratingEmail(`${customer.id}-${campaignType}`)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, customerName: customer.name }),
      })
      const data = await res.json()
      setEmailPreview({ html: data.html, customer, type: campaignType })
    } catch { toast.error('Failed to generate email') }
    setGeneratingEmail(null)
  }

  async function sendEmail() {
    if (!emailPreview) return
    setSendingEmail(true)
    const campaignLabel = CAMPAIGN_TYPES.find(c => c.key === emailPreview.type)?.label || 'Email'
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailPreview.customer.email,
          subject: `${campaignLabel.replace(/^\S+\s/, '')} — Holders LLC`,
          html: emailPreview.html,
          campaignType: emailPreview.type,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Email sent to ${emailPreview.customer.email}!`)
        setEmailPreview(null)
      } else {
        toast.error(data.error || 'Failed to send')
      }
    } catch { toast.error('Failed to send email') }
    setSendingEmail(false)
  }

  async function sendBulkCampaign() {
    if (!bulkCampaign || selectedCustomers.length === 0) {
      toast.error('Select customers and a campaign type')
      return
    }
    const targets = customers.filter(c => selectedCustomers.includes(c.id))
    let sent = 0
    for (const customer of targets) {
      try {
        const res = await fetch('/api/admin/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignType: bulkCampaign, customerName: customer.name }),
        })
        const data = await res.json()
        const campaignLabel = CAMPAIGN_TYPES.find(c => c.key === bulkCampaign)?.label || 'Email'
        await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customer.email,
            subject: `${campaignLabel.replace(/^\S+\s/, '')} — Holders LLC`,
            html: data.html,
          }),
        })
        sent++
      } catch {}
    }
    toast.success(`Sent ${sent} emails!`)
    setSelectedCustomers([])
    setBulkCampaign('')
  }

  function statusColor(status: string) {
    if (status === 'Good') return 'text-emerald-400'
    if (status === 'Due Soon') return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400">Loading customers…</div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-header">Customer CRM</h1>
        <p className="page-subheader">{customers.length} customers · AI-powered maintenance insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-brand-400' },
          { label: 'Total Firearms', value: customers.reduce((s, c) => s + c.firearmsCount, 0), icon: Crosshair, color: 'text-blue-400' },
          { label: 'Maintenance Due', value: customers.filter(c => c.firearms?.some((f: any) => f.maintenance_status !== 'Good')).length, icon: Wrench, color: 'text-yellow-400' },
          { label: 'Pro Members', value: customers.filter(c => c.membership === 'pro').length, icon: Zap, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Bulk Campaign */}
      <div className="card mb-6 border-brand-500/20">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-400" /> Bulk Email Campaign
        </h2>
        <div className="flex items-center gap-3">
          <select
            className="input flex-1"
            value={bulkCampaign}
            onChange={e => setBulkCampaign(e.target.value)}
          >
            <option value="">Select campaign type…</option>
            {CAMPAIGN_TYPES.map(c => (
              <option key={c.key} value={c.key}>{c.label} {c.auto ? '(Auto)' : '(Review)'}</option>
            ))}
          </select>
          <div className="text-slate-400 text-sm whitespace-nowrap">
            {selectedCustomers.length} selected
          </div>
          <button
            onClick={sendBulkCampaign}
            disabled={!bulkCampaign || selectedCustomers.length === 0}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Send className="w-4 h-4" /> Send to Selected
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setSelectedCustomers(customers.map(c => c.id))}
            className="text-brand-400 text-sm hover:underline"
          >
            Select all
          </button>
          <button
            onClick={() => setSelectedCustomers([])}
            className="text-slate-500 text-sm hover:underline"
          >
            Clear
          </button>
          <span className="text-slate-600 text-xs">Auto campaigns send immediately · Review campaigns show preview first</span>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="space-y-4">
        {customers.map(customer => (
          <div key={customer.id} className="card">
            {/* Customer Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={e => setSelectedCustomers(prev =>
                    e.target.checked ? [...prev, customer.id] : prev.filter(id => id !== customer.id)
                  )}
                  className="w-4 h-4 accent-brand-500"
                />
                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold border border-brand-500/30">
                  {customer.name?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{customer.name || 'No name'}</div>
                  <div className="text-sm text-slate-400">{customer.email}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="capitalize">{customer.membership} plan</span>
                    <span>·</span>
                    <span>{customer.firearmsCount} firearms</span>
                    <span>·</span>
                    <span>{customer.totalRounds.toLocaleString()} rounds total</span>
                    {customer.lastActivity && (
                      <>
                        <span>·</span>
                        <span>Last active {new Date(customer.lastActivity).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                className="btn-ghost p-2"
              >
                {expandedCustomer === customer.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expanded Details */}
            {expandedCustomer === customer.id && (
              <div className="mt-6 space-y-6 border-t border-surface-border pt-6">

                {/* Firearms */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Firearms</h3>
                  {customer.firearms?.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {customer.firearms.map((firearm: any) => (
                        <div key={firearm.id} className="bg-surface-muted rounded-lg p-3 border border-surface-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-white text-sm">{firearm.manufacturer} {firearm.model}</div>
                            <span className={`text-xs font-medium ${statusColor(firearm.maintenance_status)}`}>
                              {firearm.maintenance_status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            <span>Caliber: {firearm.caliber || '—'}</span>
                            <span>Rounds: {(firearm.round_count || 0).toLocaleString()}</span>
                            <span>Last cleaned: {firearm.last_cleaning_date ? new Date(firearm.last_cleaning_date).toLocaleDateString() : 'Never'}</span>
                            <span>Last inspected: {firearm.last_inspection_date ? new Date(firearm.last_inspection_date).toLocaleDateString() : 'Never'}</span>
                          </div>
                          {firearm.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {firearm.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-surface-border text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No firearms registered</p>
                  )}
                </div>

                {/* Maintenance History */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Maintenance</h3>
                  {customer.maintenance?.length > 0 ? (
                    <div className="space-y-2">
                      {customer.maintenance.slice(0, 5).map((m: any) => (
                        <div key={m.id} className="flex justify-between text-sm py-1.5 border-b border-surface-border last:border-0">
                          <span className="text-white">{m.service_type}</span>
                          {m.notes && <span className="text-slate-500 truncate max-w-[200px] mx-4">{m.notes}</span>}
                          <span className="text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No maintenance logged</p>
                  )}
                </div>

                {/* AI Summary */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Summary</h3>
                    <button
                      onClick={() => getAISummary(customer)}
                      disabled={loadingSummary === customer.id}
                      className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      {loadingSummary === customer.id ? 'Analyzing…' : 'Generate'}
                    </button>
                  </div>
                  {aiSummaries[customer.id] ? (
                    <div className="bg-surface-muted rounded-lg p-4 border border-surface-border">
                      <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">{aiSummaries[customer.id]}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Click Generate to get AI insights for this customer</p>
                  )}
                </div>

                {/* Email Campaigns */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Send Email</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CAMPAIGN_TYPES.map(campaign => (
                      <button
                        key={campaign.key}
                        onClick={() => generateEmail(customer, campaign.key)}
                        disabled={generatingEmail === `${customer.id}-${campaign.key}`}
                        className="btn-secondary text-xs py-2 px-3 text-left flex items-center gap-2"
                      >
                        {generatingEmail === `${customer.id}-${campaign.key}` ? (
                          <span className="text-slate-400">Generating…</span>
                        ) : (
                          <>
                            <span>{campaign.label}</span>
                            {campaign.auto && <span className="text-emerald-400 text-xs ml-auto">Auto</span>}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email Preview Modal */}
      {emailPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <div>
                <h3 className="font-semibold text-white">Email Preview</h3>
                <p className="text-slate-400 text-sm">To: {emailPreview.customer.email}</p>
              </div>
              <button onClick={() => setEmailPreview(null)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="bg-white rounded-lg p-4 text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: emailPreview.html }} />
            </div>
            <div className="p-5 border-t border-surface-border flex gap-3">
              <button onClick={sendEmail} disabled={sendingEmail} className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" />
                {sendingEmail ? 'Sending…' : 'Send Email'}
              </button>
              <button onClick={() => setEmailPreview(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
