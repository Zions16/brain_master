import { FastifyInstance } from 'fastify'
import fastifyRateLimit from '@fastify/rate-limit'

export async function pluginRateLimit(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    global: false,
  })
}
