import { FastifyRequest, FastifyReply } from 'fastify'
import { calculoPagamentoQuerySchema, criarPagamentoSchema, realizarPagamentoSchema, cancelarPagamentoSchema } from '@brain-master/validators'
import * as pagamentosService from './pagamentos.service'
import { notificarPagamentoRealizado } from '../../lib/notifications'

type ObraParams = { obraId: string }
type PagamentoParams = { obraId: string; id: string }

export async function handleCalcularPagamento(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  const query = calculoPagamentoQuerySchema.safeParse(request.query)
  if (!query.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: query.error.errors[0]?.message ?? 'Parâmetros inválidos' })
  }
  try {
    const calculos = await pagamentosService.calcularTodosPagamentos(
      request.params.obraId,
      request.usuario.empresa_id,
      query.data.inicio,
      query.data.fim,
    )
    return reply.send({ data: calculos })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleListarPagamentos(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  try {
    const pagamentos = await pagamentosService.listarPagamentos(request.params.obraId, request.usuario.empresa_id)
    return reply.send({ data: pagamentos })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCriarPagamento(request: FastifyRequest<{ Params: ObraParams }>, reply: FastifyReply) {
  const body = criarPagamentoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const pagamento = await pagamentosService.criarPagamento(body.data, request.params.obraId, request.usuario.empresa_id)
    return reply.status(201).send({ data: pagamento })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleRealizarPagamento(request: FastifyRequest<{ Params: PagamentoParams }>, reply: FastifyReply) {
  const body = realizarPagamentoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const pagamento = await pagamentosService.realizarPagamento(
      request.params.id,
      body.data,
      request.params.obraId,
      request.usuario.empresa_id,
      request.usuario.id,
    )

    void notificarPagamentoRealizado({
      pagamentoId: pagamento.id,
      obraId: request.params.obraId,
      empresaId: request.usuario.empresa_id,
      gestorId: request.usuario.id,
      valorTotal: (pagamento as any).valor_total ?? 0,
      periodoInicio: (pagamento as any).periodo_inicio ?? '',
      periodoFim: (pagamento as any).periodo_fim ?? '',
    })

    return reply.send({ data: pagamento })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleCancelarPagamento(request: FastifyRequest<{ Params: PagamentoParams }>, reply: FastifyReply) {
  const body = cancelarPagamentoSchema.safeParse(request.body)
  if (!body.success) {
    return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: body.error.errors[0]?.message ?? 'Dados inválidos' })
  }
  try {
    const pagamento = await pagamentosService.cancelarPagamento(
      request.params.id,
      body.data,
      request.params.obraId,
      request.usuario.empresa_id,
    )
    return reply.send({ data: pagamento })
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}
