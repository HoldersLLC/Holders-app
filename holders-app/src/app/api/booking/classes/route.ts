import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data: classes } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('is_active', true)
      .gte('class_date', new Date().toISOString().split('T')[0])
      .order('class_date', { ascending: true })

    return NextResponse.json({ classes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('membership')
      .eq('id', user.id)
      .single()

    if (profile?.membership !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { data: newClass, error } = await supabaseAdmin
      .from('classes')
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ class: newClass })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
