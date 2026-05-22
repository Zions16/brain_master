import { FastifyInstance } from 'fastify'
import { autenticar } from '../../middlewares/autenticar'
import { autorizar } from '../../middlewares/autorizar'
import {
  handleListarMedicoes,
  handleBuscarMedicao,
  handleRegistrarMedicao,
  handleCorrigirMedicao,
  handleAprovarMedicao,
  handleCancelarMedicao,
  handleBuscarHistorico,
} from './medicoes.controller'

const VINCULADOS = ['GESTOR', 'ENGENHEIRO', 'FINANCEIRO', 'COMPRAS', 'FUNCIONARIO'] as const

export async function medicoesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/:obraId/medicoes', { preHandler: [autorizar(...VINCULADOS)], handler: handleListarMedicoes })
  app.post('/:obraId/medicoes', { preHandler: [autorizar('ENGENHEIRO', 'GESTOR')], handler: handleRegistrarMedicao })

  // rotas estáticas de sub-ação antes de /:id para evitar conflito
  app.patch('/:obraId/medicoes/:id/corrigir', { preHandler: [autorizar('ENGENHEIRO', 'GESTOR')], handler: handleCorrigirMedicao })
  app.patch('/:obraId/medicoes/:id/aprovar', { preHandler: [autorizar('GESTOR')], handler: handleAprovarMedicao })
  app.patch('/:obraId/medicoes/:id/cancelar', { preHandler: [autorizar('GESTOR')], handler: handleCancelarMedicao })
  app.get('/:obraId/medicoes/:id/historico', { preHandler: [autorizar('GESTOR', 'ENGENHEIRO')], handler: handleBuscarHistorico })

  app.get('/:obraId/medicoes/:id', { preHandler: [autorizar(...VINCULADOS)], handler: handleBuscarMedicao })
}
