import { FastifyRequest, FastifyReply } from 'fastify'
import { criarFuncionarioSchema, editarFuncionarioSchema, producaoQuerySchema } from '@brain-master/validators'
import * as funcionariosService from './funcionarios.service'

export async function handleListarFuncionarios(request: FastifyRequest, reply: FastifyReply) {
  try {
    const funcionarios = await funcionariosService.listarFuncionarios(request.usuario.empresa_id)
    return reply.send({ data: funcionarios })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleBuscarFuncionario(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const funcionario = await funcionariosService.buscarFuncionario(request.params.id, request.usuario.empresa_id)
    return reply.send({ data: funcionario })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCriarFuncionario(request: FastifyRequest, reply: FastifyReply) {
  const body = criarFuncionarioSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const funcionario = await funcionariosService.criarFuncionario(body.data, request.usuario.empresa_id)
    return reply.status(201).send({ data: funcionario })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleEditarFuncionario(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const body = editarFuncionarioSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const funcionario = await funcionariosService.editarFuncionario(request.params.id, body.data, request.usuario.empresa_id)
    return reply.send({ data: funcionario })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCalcularProducao(
  request: FastifyRequest<{ Params: { id: string }; Querystring: { inicio?: string; fim?: string } }>,
  reply: FastifyReply,
) {
  const query = producaoQuerySchema.safeParse(request.query)
  if (!query.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: query.error.errors[0]?.message ?? 'Parâmetros inválidos' })
  }
  try {
    const producao = await funcionariosService.calcularProducao(
      request.params.id,
      request.usuario.empresa_id,
      query.data.inicio,
      query.data.fim,
    )
    return reply.send({ data: producao })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}
