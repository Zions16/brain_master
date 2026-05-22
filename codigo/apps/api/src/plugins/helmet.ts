import { FastifyInstance } from 'fastify'
import fastifyHelmet from '@fastify/helmet'

export async function pluginHelmet(app: FastifyInstance) {
  await app.register(fastifyHelmet)
}
