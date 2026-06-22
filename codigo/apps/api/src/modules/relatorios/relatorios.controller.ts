import { FastifyRequest, FastifyReply } from 'fastify'
import { fechamentoPeriodo } from './relatorios.service'
import { responderErro } from '../../lib/erros'

export async function handleFechamentoPeriodo(request: FastifyRequest<{ Querystring: { inicio: string; fim: string } }>, reply: FastifyReply) {
  const { inicio, fim } = request.query

  if (!inicio || !fim) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Parâmetros inicio e fim são obrigatórios' })
  }

  const reIso = /^\d{4}-\d{2}-\d{2}$/
  if (!reIso.test(inicio) || !reIso.test(fim)) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Datas devem estar no formato YYYY-MM-DD' })
  }

  try {
    const relatorio = await fechamentoPeriodo(request.usuario.empresa_id, inicio, fim)
    return reply.send({ data: relatorio })
  } catch (err) {
    return responderErro(reply, err)
  }
}
