import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('membership')
      .eq('id', user.id)
      .single()

    if (adminProfile?.membership !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .neq('membership', 'admin')
      .order('created_at', { ascending: false })

    if (!profiles) return NextResponse.json({ customers: [] })

    const customerIds = profiles.map(p => p.id)

    const [
      { data: firearms },
      { data: maintenance },
      { data: rangeSessions },
    ] = await Promise.all([
      supabaseAdmin.from('firearms').select('*').in('user_id', customerIds),
      supabaseAdmin.from('maintenance').select('*').in('user_id', customerIds).order('date', { ascending: false }),
      supabaseAdmin.from('range_sessions').select('*').in('user_id', customerIds),
    ])

    const customers = profiles.map(profile => {
      const customerFirearms = firearms?.filter(f => f.user_id === profile.id) || []
      const customerMaintenance = maintenance?.filter(m => m.user_id === profile.id) || []
      const customerSessions = rangeSessions?.filter(r => r.user_id === profile.id) || []

      return {
        ...profile,
        firearms: customerFirearms,
        maintenance: customerMaintenance,
        rangeSessions: customerSessions,
        totalRounds: customerFirearms.reduce((sum, f) => sum + (f.round_count || 0), 0),
        firearmsCount: customerFirearms.length,
        lastActivity: customerMaintenance[0]?.date || customerSessions[0]?.date || null,
      }
    })

    return NextResponse.json({ customers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
