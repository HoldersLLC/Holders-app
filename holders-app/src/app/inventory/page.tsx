import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DollarSign } from 'lucide-react'

export default async function InventoryPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: firearms } = await supabase
    .from('firearms')
    .select('id, manufacturer, model, caliber, category, purchase_price, current_value, insurance_value')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totals = (firearms || []).reduce((acc, f) => ({
    purchase: acc.purchase + (f.purchase_price || 0),
    current: acc.current + (f.current_value || 0),
    insurance: acc.insurance + (f.insurance_value || 0),
  }), { purchase: 0, current: 0, insurance: 0 })

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Inventory Value</h1>
        <p className="page-subheader">Collection valuation and insurance overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Purchase Price', value: totals.purchase, color: 'text-slate-400' },
          { label: 'Estimated Current Value', value: totals.current, color: 'text-emerald-400' },
          { label: 'Total Insurance Value', value: totals.insurance, color: 'text-brand-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-4 h-4 ${color}`} />
              <span className="text-slate-400 text-sm">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>
              ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-4">Firearms by Value</h2>
        {firearms && firearms.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-surface-border">
                <th className="pb-3 font-medium">Firearm</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Purchase</th>
                <th className="pb-3 font-medium text-right">Current</th>
                <th className="pb-3 font-medium text-right">Insurance</th>
              </tr>
            </thead>
            <tbody>
              {firearms.map((f: any) => (
                <tr key={f.id} className="border-b border-surface-border last:border-0">
                  <td className="py-3">
                    <div className="font-medium text-white">{f.manufacturer} {f.model}</div>
                    <div className="text-xs text-slate-500">{f.caliber}</div>
                  </td>
                  <td className="py-3 text-slate-400">{f.category || '—'}</td>
                  <td className="py-3 text-right text-slate-300">{f.purchase_price ? `$${f.purchase_price.toLocaleString()}` : '—'}</td>
                  <td className="py-3 text-right text-emerald-400">{f.current_value ? `$${f.current_value.toLocaleString()}` : '—'}</td>
                  <td className="py-3 text-right text-brand-400">{f.insurance_value ? `$${f.insurance_value.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No firearms added yet</p>
        )}
      </div>
    </div>
  )
}
