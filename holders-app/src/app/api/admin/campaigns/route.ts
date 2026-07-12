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

const CAMPAIGN_PROMPTS: Record<string, string> = {
  hunting_season: `Write a friendly email from Holders LLC to a customer about upcoming hunting season. Include gear check reminder, ammo availability, firearm inspection offer, and warm closing. Under 200 words. Return HTML email body only.`,
  quarterly_newsletter: `Write a quarterly newsletter from Holders LLC. Include safety tip, maintenance reminder, store update, invitation to visit. Under 250 words. Return HTML email body only.`,
  inspection_reminder: `Write an email from Holders LLC reminding a customer their annual firearm inspection is due. Include why inspections matter, what's checked, how to schedule. Under 200 words. Return HTML email body only.`,
  training_options: `Write an email from Holders LLC about available training options. Include safety courses, concealed carry training, range tips, how to sign up. Under 200 words. Return HTML email body only.`,
  loyal_customer_discount: `Write an email from Holders LLC thanking a loyal customer and offering 5% discount code LOYAL5 (expires 30 days). Warm and personal. Under 200 words. Return HTML email body only.`,
}

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

    const { campaignType, customerName } = await request.json()

    const basePrompt = CAMPAIGN_PROMPTS[campaignType]
    if (!basePrompt) return NextResponse.json({ error: 'Invalid campaign type' }, { status: 400 })

    const prompt = `${basePrompt}\n\nCustomer name: ${customerName || 'Valued Customer'}\nShop: Holders LLC\nEmail: Sales@holders.llc\nWebsite: portal.holders.llc`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const html = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ html })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
