import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getPlanFromPriceId } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  async function updateMembership(customerId: string, membership: string, subId?: string) {
    await supabaseAdmin.from('profiles')
      .update({ membership, stripe_subscription_id: subId || null, updated_at: new Date().toISOString() })
      .eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      if (session.mode === 'subscription' && session.customer) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const plan = getPlanFromPriceId(sub.items.data[0]?.price.id)
        await updateMembership(session.customer as string, plan, sub.id)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const plan = sub.status === 'active' ? getPlanFromPriceId(sub.items.data[0]?.price.id) : 'free'
      await updateMembership(sub.customer as string, plan, sub.id)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await updateMembership(sub.customer as string, 'free')
      break
    }
  }
  return NextResponse.json({ received: true })
}
