import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import { handleCheckout, handlePortal, handleStatus, handleWebhook } from './billing.controller'

export async function billingRoutes(app: FastifyInstance) {
  // Webhook — raw body obrigatório para verificação de assinatura do Stripe
  app.register(async (webhookApp) => {
    webhookApp.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
      done(null, body)
    })
    webhookApp.post('/webhook', handleWebhook)
  })

  // Rotas autenticadas — autenticar por rota (NÃO via addHook no escopo, senão
  // o hook vaza para o sub-escopo do webhook acima e o Stripe leva 401).
  app.post('/checkout', { preHandler: [autenticar, autorizar('GESTOR')] }, handleCheckout)
  app.post('/portal', { preHandler: [autenticar, autorizar('GESTOR')] }, handlePortal)
  app.get('/status', { preHandler: [autenticar, autorizar('GESTOR', 'FINANCEIRO')] }, handleStatus)
}
