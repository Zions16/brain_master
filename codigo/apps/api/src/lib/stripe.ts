import Stripe from 'stripe'

type StripeClient = InstanceType<typeof Stripe>

let instancia: StripeClient | null = null

function getStripe(): StripeClient {
  if (!instancia) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw { statusCode: 503, message: 'Billing indisponível: STRIPE_SECRET_KEY não configurado' }
    }
    instancia = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return instancia
}

// Proxy lazy: o cliente Stripe só é criado no primeiro uso real (não no import),
// para que a ausência de STRIPE_SECRET_KEY não derrube a API inteira no boot.
export const stripe = new Proxy({} as StripeClient, {
  get(_alvo, prop: string | symbol) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- acesso dinâmico ao cliente Stripe lazy
    return (getStripe() as any)[prop]
  },
})
