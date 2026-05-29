import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarObras,
  handleListarMinhasObras,
  handleBuscarObra,
  handleCriarObra,
  handleEditarObra,
  handleMudarStatusObra,
  handleResumoObras,
  handleListarMembros,
  handleAdicionarMembro,
  handleRemoverMembro,
} from './obras.controller'

export async function obrasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/', { preHandler: [autorizar('GESTOR', 'FINANCEIRO')], handler: handleListarObras })
  app.get('/minhas', { preHandler: [autorizar('ENGENHEIRO', 'COMPRAS')], handler: handleListarMinhasObras })
  app.get('/resumo', { preHandler: [autorizar('GESTOR', 'FINANCEIRO')], handler: handleResumoObras })
  app.post('/', { preHandler: [autorizar('GESTOR')], handler: handleCriarObra })
  app.get('/:id', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO', 'FINANCEIRO', 'COMPRAS', 'FUNCIONARIO')], handler: handleBuscarObra })
  app.patch('/:id', { preHandler: [autorizar('GESTOR')], handler: handleEditarObra })
  app.patch('/:id/status', { preHandler: [autorizar('GESTOR')], handler: handleMudarStatusObra })

  // Membros da obra (vínculo engenheiro ↔ obra via obra_usuario)
  app.get('/:id/membros', { preHandler: [autorizar('GESTOR')], handler: handleListarMembros })
  app.post('/:id/membros', { preHandler: [autorizar('GESTOR')], handler: handleAdicionarMembro })
  app.delete('/:id/membros/:userId', { preHandler: [autorizar('GESTOR')], handler: handleRemoverMembro })
}
