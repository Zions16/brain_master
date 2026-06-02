import { FastifyRequest, FastifyReply } from 'fastify'
import { criarObraSchema, editarObraSchema, mudarStatusObraSchema, adicionarMembroSchema } from '@brain-master/validators'
import * as obrasService from './obras.service'

export async function handleListarObras(request: FastifyRequest, reply: FastifyReply) {
  try {
    const obras = await obrasService.listarObras(request.usuario.empresa_id)
    return reply.send({ data: obras })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleListarMinhasObras(request: FastifyRequest, reply: FastifyReply) {
  try {
    const obras = await obrasService.listarMinhasObras(request.usuario.id, request.usuario.empresa_id)
    return reply.send({ data: obras })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleBuscarObra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const obra = await obrasService.buscarObra(request.params.id, request.usuario.empresa_id)
    return reply.send({ data: obra })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCriarObra(request: FastifyRequest, reply: FastifyReply) {
  const body = criarObraSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const obra = await obrasService.criarObra(body.data, request.usuario.empresa_id)
    return reply.status(201).send({ data: obra })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleEditarObra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const body = editarObraSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const obra = await obrasService.editarObra(request.params.id, body.data, request.usuario.empresa_id)
    return reply.send({ data: obra })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleMudarStatusObra(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const body = mudarStatusObraSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const obra = await obrasService.mudarStatusObra(request.params.id, body.data, request.usuario.empresa_id)
    return reply.send({ data: obra })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleResumoObras(request: FastifyRequest, reply: FastifyReply) {
  try {
    const resumo = await obrasService.resumoTodasObras(request.usuario.empresa_id)
    return reply.send({ data: resumo })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleResumoFuncionariosObra(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const resumo = await obrasService.resumoFuncionariosObra(request.params.id, request.usuario.empresa_id)
    return reply.send({ data: resumo })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleListarMembros(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const membros = await obrasService.listarMembros(request.params.id, request.usuario.empresa_id)
    return reply.send({ data: membros })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleAdicionarMembro(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const body = adicionarMembroSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    await obrasService.adicionarMembro(request.params.id, body.data.usuario_id, request.usuario.empresa_id)
    return reply.status(201).send({ data: null, message: 'Engenheiro vinculado com sucesso' })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleRemoverMembro(
  request: FastifyRequest<{ Params: { id: string; userId: string } }>,
  reply: FastifyReply,
) {
  try {
    await obrasService.removerMembro(request.params.id, request.params.userId, request.usuario.empresa_id)
    return reply.status(204).send()
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}
