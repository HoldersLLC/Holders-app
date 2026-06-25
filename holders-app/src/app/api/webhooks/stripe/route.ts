import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook (bypasses RLS)
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
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  async function updateUserMembership(customerId: string, membership: string, subscriptionId?: string) {
    await supabaseAdmin
      .from('profiles')
      .update({
        membership,
        stripe_subscription_id: subscriptionId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      if (session.mode === 'subscription' && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)
        await updateUserMembership(session.customer as string, plan, subscription.id)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price.id
      const plan = subscription.status === 'active' ? getPlanFromPriceId(priceId) : 'free'
      await updateUserMembership(subscription.customer as string, plan, subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await updateUserMembership(subscription.customer as string, 'free')
      break
    }
  }

  return NextResponse.json({ received: true })
}
