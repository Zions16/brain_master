import { FastifyRequest, FastifyReply } from 'fastify'
import { criarFuncionarioSchema, editarFuncionarioSchema, producaoQuerySchema } from '@brain-master/validators'
import * as funcionariosService from './funcionarios.service'
import { responderErro } from '../../lib/erros'

export async function handleListarFuncionarios(
  request: FastifyRequest<{ Querystring: { obra_id?: string } }>,
  reply: FastifyReply,
) {
  try {
    const funcionarios = await funcionariosService.listarFuncionarios(
      request.usuario.empresa_id,
      request.query.obra_id,
    )
    return reply.send({ data: funcionarios })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleBuscarFuncionario(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const funcionario = await funcionariosService.buscarFuncionario(request.params.id, request.usuario.empresa_id)
    return reply.send({ data: funcionario })
  } catch (err) {
    return responderErro(reply, err)
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
  } catch (err) {
    return responderErro(reply, err)
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
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleBuscarMeuPerfil(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Fix DT-001: usa ID do JWT (sub = funcionario.id para perfil FUNCIONARIO).
    // Não usa nome para evitar colisão entre funcionários com mesmo nome.
    const funcionario = await funcionariosService.buscarMeuPerfil(
      request.usuario.id,
      request.usuario.empresa_id,
    )
    return reply.send({ data: funcionario })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleListarMedicoesDoFuncionario(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const medicoes = await funcionariosService.listarMedicoesDoFuncionario(
      request.params.id,
      request.usuario.empresa_id,
      request.usuario.id,
      request.usuario.perfil,
    )
    return reply.send({ data: medicoes })
  } catch (err) {
    return responderErro(reply, err)
  }
}

export async function handleListarPagamentosDoFuncionario(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const pagamentos = await funcionariosService.listarPagamentosDoFuncionario(
      request.params.id,
      request.usuario.empresa_id,
      request.usuario.id,
      request.usuario.perfil,
    )
    return reply.send({ data: pagamentos })
  } catch (err) {
    return responderErro(reply, err)
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
      request.usuario.id,
      request.usuario.perfil,
    )
    return reply.send({ data: producao })
  } catch (err) {
    return responderErro(reply, err)
  }
}
