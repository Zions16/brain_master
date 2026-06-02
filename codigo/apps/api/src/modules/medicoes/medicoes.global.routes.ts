import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import { handleListarPendentesAprovacao } from './medicoes.controller'

export async function medicoesGlobalRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/pendentes', { preHandler: [autorizar('GESTOR')], handler: handleListarPendentesAprovacao })
}
