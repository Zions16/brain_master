import { FastifyRequest, FastifyReply } from 'fastify'
import '@fastify/jwt'
import { loginSchema, tokenLoginSchema, cadastroSchema } from '@brain-master/validators'
import * as authService from './auth.service'
import { responderErro } from '../../lib/erros'

export async function handleLogin(request: FastifyRequest, reply: FastifyReply) {
  const body = loginSchema.safeParse(request.body)

  if (!body.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: body.error.errors[0]?.message ?? 'Dados inválidos',
    })
  }

  try {
    const result = await authService.login(body.data)
    return reply.status(200).send({ data: result })
  } catch (err) {
    return responderErro(reply, err, 'Unauthorized')
  }
}

export async function handleRefresh(request: FastifyRequest, reply: FastifyReply) {
  const { refresh_token } = request.body as { refresh_token?: string }

  if (!refresh_token) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'refresh_token é obrigatório',
    })
  }

  try {
    const result = await authService.refresh(refresh_token)
    return reply.status(200).send({ data: result })
  } catch (err) {
    return responderErro(reply, err, 'Unauthorized')
  }
}

export async function handleTokenLogin(request: FastifyRequest, reply: FastifyReply) {
  const body = tokenLoginSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Token inválido' })
  }

  const { token } = body.data

  try {
    if (token.startsWith('FUN-')) {
      const funcionario = await authService.buscarFuncionarioPorToken(token)
      const access_token = await reply.jwtSign(
        { sub: funcionario.id, empresa_id: funcionario.empresa_id, nome: funcionario.nome, perfil: 'FUNCIONARIO' },
        { expiresIn: '7d' },
      )
      return reply.status(200).send({
        data: {
          access_token,
          usuario: { id: funcionario.id, empresa_id: funcionario.empresa_id, nome: funcionario.nome, perfil: 'FUNCIONARIO' },
        },
      })
    } else {
      const engenheiro = await authService.buscarEngenheiroPorToken(token)
      const access_token = await reply.jwtSign(
        { sub: engenheiro.id, empresa_id: engenheiro.empresa_id, nome: engenheiro.nome, perfil: 'ENGENHEIRO' },
        { expiresIn: '7d' },
      )
      return reply.status(200).send({
        data: {
          access_token,
          usuario: { id: engenheiro.id, empresa_id: engenheiro.empresa_id, nome: engenheiro.nome, perfil: 'ENGENHEIRO' },
        },
      })
    }
  } catch (err) {
    return responderErro(reply, err, 'Unauthorized')
  }
}

export async function handleCadastro(request: FastifyRequest, reply: FastifyReply) {
  const body = cadastroSchema.safeParse(request.body)

  if (!body.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: body.error.errors[0]?.message ?? 'Dados inválidos',
    })
  }

  try {
    const result = await authService.cadastrar(body.data)
    return reply.status(201).send({ data: result })
  } catch (err) {
    return responderErro(reply, err, 'Bad Request')
  }
}

export async function handleLogout(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.slice(7) ?? ''

  try {
    await authService.logout(token)
    return reply.status(204).send()
  } catch {
    return reply.status(204).send()
  }
}
