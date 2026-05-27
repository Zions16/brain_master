import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarFuncionarios,
  handleBuscarFuncionario,
  handleCriarFuncionario,
  handleEditarFuncionario,
  handleCalcularProducao,
  handleListarMedicoesDoFuncionario,
  handleBuscarMeuPerfil,
} from './funcionarios.controller'

export async function funcionariosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleListarFuncionarios })
  app.post('/', { preHandler: [autorizar('GESTOR')], handler: handleCriarFuncionario })
  // rota estática /me antes de /:id para evitar conflito de params
  app.get('/me', { preHandler: [autorizar('FUNCIONARIO', 'ENGENHEIRO', 'GESTOR')], handler: handleBuscarMeuPerfil })
  // rotas estáticas /:id/* registradas antes de /:id
  app.get('/:id/producao', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO', 'FUNCIONARIO')], handler: handleCalcularProducao })
  app.get('/:id/medicoes', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO', 'FUNCIONARIO')], handler: handleListarMedicoesDoFuncionario })
  app.get('/:id', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleBuscarFuncionario })
  app.patch('/:id', { preHandler: [autorizar('GESTOR')], handler: handleEditarFuncionario })
}
