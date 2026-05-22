import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarFuncionarios,
  handleBuscarFuncionario,
  handleCriarFuncionario,
  handleEditarFuncionario,
  handleCalcularProducao,
} from './funcionarios.controller'

export async function funcionariosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleListarFuncionarios })
  app.post('/', { preHandler: [autorizar('GESTOR')], handler: handleCriarFuncionario })
  // rota estática /:id/producao registrada antes de /:id para evitar conflito de params
  app.get('/:id/producao', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleCalcularProducao })
  app.get('/:id', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleBuscarFuncionario })
  app.patch('/:id', { preHandler: [autorizar('GESTOR')], handler: handleEditarFuncionario })
}
