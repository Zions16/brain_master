import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarServicos,
  handleCriarServico,
  handleEditarServico,
  handleDesativarServico,
} from './servicos.controller'

export async function servicosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/:obraId/servicos', {
    preHandler: [autorizar('GESTOR', 'ENGENHEIRO', 'FINANCEIRO', 'COMPRAS', 'FUNCIONARIO')],
    handler: handleListarServicos,
  })
  app.post('/:obraId/servicos', {
    preHandler: [autorizar('GESTOR')],
    handler: handleCriarServico,
  })
  app.patch('/:obraId/servicos/:id', {
    preHandler: [autorizar('GESTOR')],
    handler: handleEditarServico,
  })
  app.delete('/:obraId/servicos/:id', {
    preHandler: [autorizar('GESTOR')],
    handler: handleDesativarServico,
  })
}
