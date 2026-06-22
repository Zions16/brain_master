import { FastifyReply } from 'fastify'

interface ErroApp {
  statusCode?: number
  message?: string
}

/**
 * Resposta de erro padrão dos controllers.
 * Mantém o contrato anterior (statusCode/error/message) sem `any`.
 */
export function responderErro(reply: FastifyReply, err: unknown, error = 'Error') {
  const e = err as ErroApp
  const statusCode = e.statusCode ?? 500
  return reply.status(statusCode).send({ statusCode, error, message: e.message ?? 'Erro interno' })
}
