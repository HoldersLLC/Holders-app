import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
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

    const { customer } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    const prompt = `You are an AI assistant for Holders LLC, a gun shop. Analyze this customer's data and provide a SHORT actionable summary (3-5 bullet points) for the shop owner.

Customer: ${customer.name || customer.email}
Membership: ${customer.membership}
Firearms: ${customer.firearms?.length || 0} total

Firearms Details:
${customer.firearms?.map((f: any) => `
- ${f.manufacturer} ${f.model} (${f.caliber})
  Round Count: ${f.round_count || 0}
  Last Cleaned: ${f.last_cleaning_date || 'Never'}
  Last Inspected: ${f.last_inspection_date || 'Never'}
  Status: ${f.maintenance_status}
  Tags: ${f.tags?.join(', ') || 'None'}
`).join('') || 'No firearms registered'}

Recent Maintenance (last 3):
${customer.maintenance?.slice(0, 3).map((m: any) => `- ${m.service_type} on ${m.date}`).join('\n') || 'No maintenance logged'}

Today: ${today}

Provide a concise summary covering:
1. Firearms overdue for cleaning or inspection
2. Sales opportunities (ammo, parts, gunsmithing)
3. Annual inspection status
4. Carry gun concerns
5. Customer engagement level

Keep it SHORT and actionable. Plain text only, no markdown. Start each point with an emoji.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ summary })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
