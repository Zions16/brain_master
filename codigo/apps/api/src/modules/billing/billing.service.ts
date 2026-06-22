import { stripe } from '../../lib/stripe'
import { supabase } from '../../lib/supabase'

const PRICE_ID = process.env.STRIPE_PRICE_ID!
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'
const TRIAL_DAYS = 7

export async function criarCheckout(empresaId: string, userId: string) {
  const { data: empresa } = await supabase
    .from('empresa')
    .select('id, nome, stripe_customer_id, stripe_status')
    .eq('id', empresaId)
    .single()

  if (!empresa) throw { statusCode: 404, message: 'Empresa não encontrada' }

  if (empresa.stripe_status === 'active') {
    throw { statusCode: 400, message: 'Empresa já possui assinatura ativa' }
  }

  let customerId = empresa.stripe_customer_id

  if (!customerId) {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    const customer = await stripe.customers.create({
      name: empresa.nome,
      email: authUser.user?.email,
      metadata: { empresa_id: empresaId },
    })
    customerId = customer.id
    await supabase.from('empresa').update({ stripe_customer_id: customerId }).eq('id', empresaId)
  }

  const { data: obras } = await supabase
    .from('obra')
    .select('id', { count: 'exact' })
    .eq('empresa_id', empresaId)
    .eq('status', 'ativa')

  const quantidade = Math.max(obras?.length ?? 1, 1)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: quantidade }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { empresa_id: empresaId },
    },
    success_url: `${APP_URL}/billing/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/billing/cancelado`,
  })

  return { url: session.url }
}

export async function criarPortal(empresaId: string) {
  const { data: empresa } = await supabase
    .from('empresa')
    .select('stripe_customer_id')
    .eq('id', empresaId)
    .single()

  if (!empresa?.stripe_customer_id) {
    throw { statusCode: 400, message: 'Empresa não possui assinatura' }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: empresa.stripe_customer_id,
    return_url: `${APP_URL}/billing`,
  })

  return { url: session.url }
}

export async function buscarStatus(empresaId: string) {
  const { data: empresa } = await supabase
    .from('empresa')
    .select('stripe_status, trial_ends_at, current_period_end, stripe_subscription_id')
    .eq('id', empresaId)
    .single()

  if (!empresa) throw { statusCode: 404, message: 'Empresa não encontrada' }

  return empresa
}

export async function processarWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw { statusCode: 500, message: 'STRIPE_WEBHOOK_SECRET não configurado' }
  }

  let event: Awaited<ReturnType<typeof stripe.webhooks.constructEventAsync>>

  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret)
  } catch {
    throw { statusCode: 400, message: 'Webhook signature inválida' }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as { mode: string; subscription: string | null }
      if (session.mode !== 'subscription' || !session.subscription) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      const empresaId = (subscription.metadata as Record<string, string>).empresa_id
      if (!empresaId) break

      await supabase.from('empresa').update({
        stripe_subscription_id: subscription.id,
        stripe_status: subscription.status === 'trialing' ? 'trial' : subscription.status,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      }).eq('id', empresaId)
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any
      const empresaId = subscription.metadata?.empresa_id as string | undefined
      if (!empresaId) break

      await supabase.from('empresa').update({
        stripe_status: event.type === 'customer.subscription.deleted'
          ? 'canceled'
          : (subscription.status === 'trialing' ? 'trial' : subscription.status),
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      }).eq('id', empresaId)
      break
    }
  }

  return { received: true }
}
