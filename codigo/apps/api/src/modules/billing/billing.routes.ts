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

  // Rotas autenticadas
  app.addHook('preHandler', autenticar)
  app.post('/checkout', { preHandler: [autorizar('GESTOR')] }, handleCheckout)
  app.post('/portal', { preHandler: [autorizar('GESTOR')] }, handlePortal)
  app.get('/status', { preHandler: [autorizar('GESTOR', 'FINANCEIRO')] }, handleStatus)
}
