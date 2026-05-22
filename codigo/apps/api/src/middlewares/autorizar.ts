import { FastifyRequest, FastifyReply } from 'fastify'
import { Perfil } from '@brain-master/shared/tipos'

export function autorizar(...perfisPermitidos: Perfil[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!perfisPermitidos.includes(request.usuario.perfil)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Você não tem permissão para esta ação',
      })
    }
  }
}
