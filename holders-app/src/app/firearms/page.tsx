import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, CrosshairIcon } from 'lucide-react'
import { Firearm } from '@/types'

function statusBadge(status: string) {
  if (status === 'Good') return <span className="badge-good">Good</span>
  if (status === 'Due Soon') return <span className="badge-due">Due Soon</span>
  return <span className="badge-over">Overdue</span>
}

export default async function FirearmsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: firearms } = await supabase
    .from('firearms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Firearms</h1>
          <p className="page-subheader">{firearms?.length || 0} firearm{firearms?.length !== 1 ? 's' : ''} in your collection</p>
        </div>
        <Link href="/firearms/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Firearm
        </Link>
      </div>

      {firearms && firearms.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {firearms.map((firearm: Firearm) => (
            <div key={firearm.id} className="card hover:border-brand-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{firearm.category || 'Firearm'}</div>
                  <h3 className="font-semibold text-white">{firearm.manufacturer}</h3>
                  <p className="text-slate-400 text-sm">{firearm.model}</p>
                </div>
                {statusBadge(firearm.maintenance_status)}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="bg-surface-muted rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Caliber</div>
                  <div className="text-white font-medium">{firearm.caliber || '—'}</div>
                </div>
                <div className="bg-surface-muted rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Round Count</div>
                  <div className="text-white font-medium">{firearm.round_count?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-surface-muted rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Last Cleaned</div>
                  <div className="text-white font-medium text-xs">
                    {firearm.last_cleaning_date ? new Date(firearm.last_cleaning_date).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                <div className="bg-surface-muted rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Last Inspected</div>
                  <div className="text-white font-medium text-xs">
                    {firearm.last_inspection_date ? new Date(firearm.last_inspection_date).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              {firearm.tags && firearm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {firearm.tags.map((tag: string) => (
                    <span key={tag} className="badge bg-surface-muted text-slate-400 border border-surface-border">{tag}</span>
                  ))}
                </div>
              )}

              <Link
                href={`/firearms/${firearm.id}`}
                className="btn-secondary w-full text-center text-sm block"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <CrosshairIcon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No firearms yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add your first firearm to start tracking maintenance and range sessions.</p>
          <Link href="/firearms/add" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Your First Firearm
          </Link>
        </div>
      )}
    </div>
  )
}
