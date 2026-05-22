import { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'

export async function pluginCors(app: FastifyInstance) {
  const origins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())

  await app.register(fastifyCors, {
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
