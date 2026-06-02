import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import { handleFechamentoPeriodo } from './relatorios.controller'

export async function relatoriosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/fechamento', { preHandler: [autorizar('GESTOR', 'FINANCEIRO')], handler: handleFechamentoPeriodo })
}
