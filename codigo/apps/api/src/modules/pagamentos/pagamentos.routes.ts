import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleCalcularPagamento,
  handleListarPagamentos,
  handleCriarPagamento,
  handleRealizarPagamento,
} from './pagamentos.controller'

export async function pagamentosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // rota estática /calcular registrada antes de /:id para evitar conflito
  app.get('/:obraId/pagamentos/calcular', {
    preHandler: [autorizar('GESTOR', 'FINANCEIRO')],
    handler: handleCalcularPagamento,
  })
  app.get('/:obraId/pagamentos', {
    preHandler: [autorizar('GESTOR', 'FINANCEIRO')],
    handler: handleListarPagamentos,
  })
  app.post('/:obraId/pagamentos', {
    preHandler: [autorizar('GESTOR', 'FINANCEIRO')],
    handler: handleCriarPagamento,
  })
  app.patch('/:obraId/pagamentos/:id/realizar', {
    preHandler: [autorizar('GESTOR', 'FINANCEIRO')],
    handler: handleRealizarPagamento,
  })
}
