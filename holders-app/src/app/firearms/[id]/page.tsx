import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wrench, Target, FileText, StickyNote, Info } from 'lucide-react'

export default async function FirearmDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: firearm } = await supabase
    .from('firearms')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!firearm) notFound()

  const [
    { data: maintenance },
    { data: rangeSessions },
    { data: parts },
    { data: documents },
  ] = await Promise.all([
    supabase.from('maintenance').select('*').eq('firearm_id', params.id).order('date', { ascending: false }),
    supabase.from('range_sessions').select('*').eq('firearm_id', params.id).order('date', { ascending: false }),
    supabase.from('parts').select('*').eq('firearm_id', params.id),
    supabase.from('documents').select('*').eq('firearm_id', params.id).order('created_at', { ascending: false }),
  ])

  function statusBadge(status: string) {
    if (status === 'Good') return <span className="badge-good">Good</span>
    if (status === 'Due Soon') return <span className="badge-due">Due Soon</span>
    return <span className="badge-over">Overdue</span>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/firearms" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="page-header mb-0">{firearm.manufacturer} {firearm.model}</h1>
          <p className="text-slate-400 text-sm">{firearm.category} · {firearm.caliber || 'Unknown caliber'}</p>
        </div>
        {statusBadge(firearm.maintenance_status)}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Round Count', value: (firearm.round_count || 0).toLocaleString() },
          { label: 'Last Cleaned', value: firearm.last_cleaning_date ? new Date(firearm.last_cleaning_date).toLocaleDateString() : 'Never' },
          { label: 'Last Inspected', value: firearm.last_inspection_date ? new Date(firearm.last_inspection_date).toLocaleDateString() : 'Never' },
          { label: 'Serial Number', value: firearm.serial_number || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card">
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className="text-sm font-semibold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Maintenance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-brand-400" /> Maintenance</h2>
            <Link href="/maintenance" className="text-brand-400 text-sm hover:text-brand-300">Log service</Link>
          </div>
          {maintenance && maintenance.length > 0 ? (
            <div className="space-y-2">
              {maintenance.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                  <div>
                    <div className="text-sm text-white">{m.service_type}</div>
                    {m.notes && <div className="text-xs text-slate-500 truncate max-w-[180px]">{m.notes}</div>}
                  </div>
                  <div className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No maintenance logged</p>
          )}
        </div>

        {/* Range Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> Range Sessions</h2>
            <Link href="/range-sessions" className="text-brand-400 text-sm hover:text-brand-300">Log session</Link>
          </div>
          {rangeSessions && rangeSessions.length > 0 ? (
            <div className="space-y-2">
              {rangeSessions.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                  <div>
                    <div className="text-sm text-white">{r.rounds_fired} rounds</div>
                    <div className="text-xs text-slate-500">{r.range_name || 'Range session'} · {r.ammo_brand || ''}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No range sessions logged</p>
          )}
        </div>

        {/* Parts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Info className="w-4 h-4 text-purple-400" /> Parts Tracking</h2>
          </div>
          {parts && parts.length > 0 ? (
            <div className="space-y-2">
              {parts.map((p: any) => {
                const pct = p.replacement_interval ? Math.min(100, Math.round((p.current_rounds / p.replacement_interval) * 100)) : null
                return (
                  <div key={p.id} className="py-2 border-b border-surface-border last:border-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{p.part_name}</span>
                      {pct !== null && <span className={pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-yellow-400' : 'text-emerald-400'}>{pct}%</span>}
                    </div>
                    {pct !== null && (
                      <div className="w-full bg-surface-border rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No parts tracked</p>
          )}
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><StickyNote className="w-4 h-4 text-yellow-400" /> Notes</h2>
          {firearm.notes ? (
            <p className="text-slate-300 text-sm leading-relaxed">{firearm.notes}</p>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No notes added</p>
          )}

          {firearm.tags && firearm.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-border">
              {firearm.tags.map((tag: string) => (
                <span key={tag} className="badge bg-surface-muted text-slate-400 border border-surface-border">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
