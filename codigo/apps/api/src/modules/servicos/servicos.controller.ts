import { FastifyRequest, FastifyReply } from 'fastify'
import { criarServicoSchema, editarServicoSchema } from '@brain-master/validators'
import * as servicosService from './servicos.service'
import { responderErro } from '../../lib/erros'

type ObraParams = { obraId: string }
type ServicoParams = { obraId: string; id: string }

export async function handleListarServicos(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  try {
    const servicos = await servicosService.listarServicos(request.params.obraId, request.usuario.empresa_id)
    return reply.send({ data: servicos })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleCriarServico(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  const body = criarServicoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const servico = await servicosService.criarServico(body.data, request.params.obraId, request.usuario.empresa_id)
    return reply.status(201).send({ data: servico })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleEditarServico(request: FastifyRequest<{ Params: ServicoParams }>, reply: FastifyReply) {
  const body = editarServicoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const servico = await servicosService.editarServico(request.params.id, body.data, request.params.obraId, request.usuario.empresa_id)
    return reply.send({ data: servico })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleDesativarServico(request: FastifyRequest<{ Params: ServicoParams }>, reply: FastifyReply) {
  try {
    await servicosService.desativarServico(request.params.id, request.params.obraId, request.usuario.empresa_id)
    return reply.status(204).send()
  } catch (err) {
    return responderErro(reply, err)
  }
}
