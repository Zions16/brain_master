import { FastifyRequest, FastifyReply } from 'fastify'
import { criarMedicaoSchema, corrigirMedicaoSchema, cancelarMedicaoSchema, aprovarMedicaoSchema } from '@brain-master/validators'
import * as medicoesService from './medicoes.service'

export async function handleListarPendentesAprovacao(request: FastifyRequest, reply: FastifyReply) {
  try {
    const pendentes = await medicoesService.listarPendentesAprovacao(request.usuario.empresa_id)
    return reply.send({ data: pendentes })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

type ObraParams = { obraId: string }
type MedicaoParams = { obraId: string; id: string }

export async function handleListarMedicoes(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  try {
    const medicoes = await medicoesService.listarMedicoes(request.params.obraId, request.usuario.empresa_id)
    return reply.send({ data: medicoes })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleBuscarMedicao(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  try {
    const medicao = await medicoesService.buscarMedicao(request.params.id, request.params.obraId, request.usuario.empresa_id)
    return reply.send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleRegistrarMedicao(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  const body = criarMedicaoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const medicao = await medicoesService.registrarMedicao(
      body.data,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
      request.usuario.perfil,
    )
    return reply.status(201).send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCorrigirMedicao(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  const body = corrigirMedicaoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const medicao = await medicoesService.corrigirMedicao(
      request.params.id,
      body.data,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
    )
    return reply.send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleAprovarMedicao(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  const body = aprovarMedicaoSchema.safeParse(request.body ?? {})
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const medicao = await medicoesService.aprovarMedicao(
      request.params.id,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
      body.data.observacao_gestor,
    )
    return reply.send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCancelarMedicao(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  const body = cancelarMedicaoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const medicao = await medicoesService.cancelarMedicao(
      request.params.id,
      body.data,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
    )
    return reply.send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleRejeitarMedicao(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  const body = cancelarMedicaoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const medicao = await medicoesService.rejeitarMedicao(
      request.params.id,
      body.data.motivo,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
    )
    return reply.send({ data: medicao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleBuscarHistorico(request: FastifyRequest<{ Params: MedicaoParams }>, reply: FastifyReply) {
  try {
    const historico = await medicoesService.buscarHistorico(
      request.params.id,
      request.params.obraId,
      request.usuario.empresa_id,
    )
    return reply.send({ data: historico })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}
