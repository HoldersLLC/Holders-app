import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, membership')
    .eq('id', user.id)
    .single()

  // Only admin can access
  if (profile?.membership !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={profile?.name || user.email || 'Admin'} />
      <main className="flex-1 ml-60 p-8 max-w-7xl">{children}</main>
    </div>
  )
}
