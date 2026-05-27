import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarEngenheiros,
  handleCriarEngenheiro,
  handleRegenerarToken,
} from './engenheiros.controller'

export async function engenheirosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/', { preHandler: [autorizar('GESTOR')], handler: handleListarEngenheiros })
  app.post('/', { preHandler: [autorizar('GESTOR')], handler: handleCriarEngenheiro })
  app.post('/:id/regenerar-token', { preHandler: [autorizar('GESTOR')], handler: handleRegenerarToken })
}
