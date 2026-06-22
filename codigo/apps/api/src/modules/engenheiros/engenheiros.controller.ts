import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import * as svc from './engenheiros.service'
import { responderErro } from '../../lib/erros'

const criarSchema = z.object({
  nome: z.string({ required_error: 'Nome é obrigatório' }).min(2).max(100),
})

export async function handleListarEngenheiros(request: FastifyRequest, reply: FastifyReply) {
  const data = await svc.listarEngenheiros(request.usuario.empresa_id)
  return reply.status(200).send({ data })
}

export async function handleCriarEngenheiro(request: FastifyRequest, reply: FastifyReply) {
  const body = criarSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: body.error.errors[0]?.message ?? 'Dados inválidos',
    })
  }

  try {
    const data = await svc.criarEngenheiro(body.data.nome, request.usuario.empresa_id)
    return reply.status(201).send({ data })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleRegenerarToken(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }

  try {
    const data = await svc.regenerarToken(id, request.usuario.empresa_id)
    return reply.status(200).send({ data })
  } catch (err) {
    return responderErro(reply, err)
  }
}
