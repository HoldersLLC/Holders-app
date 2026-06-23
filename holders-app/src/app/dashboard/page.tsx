import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CrosshairIcon, Wrench, Target, Bell, Plus, ClipboardList, FileText } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { count: firearmsCount },
    { data: firearms },
    { data: recentMaintenance },
    { data: upcomingReminders },
  ] = await Promise.all([
    supabase.from('firearms').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('firearms').select('round_count, maintenance_status').eq('user_id', user.id),
    supabase.from('maintenance').select('*, firearms(manufacturer, model)').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    supabase.from('reminders').select('*, firearms(manufacturer, model)').eq('user_id', user.id).eq('is_active', true).limit(5),
  ])

  const totalRounds = firearms?.reduce((sum, f) => sum + (f.round_count || 0), 0) || 0
  const maintenanceDue = firearms?.filter(f => f.maintenance_status !== 'Good').length || 0

  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your collection at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Firearms', value: firearmsCount || 0, icon: CrosshairIcon, color: 'text-brand-400' },
          { label: 'Total Rounds', value: totalRounds.toLocaleString(), icon: Target, color: 'text-blue-400' },
          { label: 'Maintenance Due', value: maintenanceDue, icon: Wrench, color: maintenanceDue > 0 ? 'text-yellow-400' : 'text-emerald-400' },
          { label: 'Active Reminders', value: upcomingReminders?.length || 0, icon: Bell, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/firearms/add', label: 'Add Firearm', icon: Plus },
            { href: '/maintenance', label: 'Log Maintenance', icon: Wrench },
            { href: '/range-sessions', label: 'Log Range Session', icon: Target },
            { href: '/reports', label: 'Generate Report', icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="card hover:border-brand-500/40 hover:bg-surface-muted transition-all flex items-center gap-3 group">
              <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center border border-brand-500/20 group-hover:bg-brand-500/20 transition-colors">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Maintenance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Maintenance</h2>
            <Link href="/maintenance" className="text-brand-400 hover:text-brand-300 text-sm">View all</Link>
          </div>
          {recentMaintenance && recentMaintenance.length > 0 ? (
            <div className="space-y-3">
              {recentMaintenance.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{m.service_type}</div>
                    <div className="text-xs text-slate-400">{m.firearms?.manufacturer} {m.firearms?.model}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(m.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No maintenance logged yet</p>
              <Link href="/maintenance" className="text-brand-400 text-sm hover:underline mt-1 inline-block">Log your first service</Link>
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Active Reminders</h2>
            <Link href="/reminders" className="text-brand-400 hover:text-brand-300 text-sm">View all</Link>
          </div>
          {upcomingReminders && upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{r.reminder_type}</div>
                    <div className="text-xs text-slate-400">{r.firearms?.manufacturer} {r.firearms?.model}</div>
                  </div>
                  {r.due_date && (
                    <div className="text-xs text-slate-500">{new Date(r.due_date).toLocaleDateString()}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active reminders</p>
              <Link href="/reminders" className="text-brand-400 text-sm hover:underline mt-1 inline-block">Set up reminders</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
