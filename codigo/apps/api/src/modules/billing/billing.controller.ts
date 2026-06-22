import { FastifyRequest, FastifyReply } from 'fastify'
import * as billingService from './billing.service'

export async function handleCheckout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await billingService.criarCheckout(request.usuario.empresa_id, request.usuario.id)
    return reply.send(result)
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handlePortal(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await billingService.criarPortal(request.usuario.empresa_id)
    return reply.send(result)
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await billingService.buscarStatus(request.usuario.empresa_id)
    return reply.send(result)
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}

export async function handleWebhook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const signature = request.headers['stripe-signature'] as string
    if (!signature) return reply.status(400).send({ message: 'stripe-signature ausente' })

    const result = await billingService.processarWebhook(request.body as Buffer, signature)
    return reply.send(result)
  } catch (err: any) {
    return reply.status(err.statusCode ?? 500).send({ statusCode: err.statusCode ?? 500, error: 'Error', message: err.message })
  }
}
