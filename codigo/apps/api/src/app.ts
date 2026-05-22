import Fastify from 'fastify'
import { pluginCors } from './plugins/cors'
import { pluginHelmet } from './plugins/helmet'
import { pluginRateLimit } from './plugins/rateLimit'
import { authRoutes } from './modules/auth/auth.routes'

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  await pluginHelmet(app)
  await pluginCors(app)
  await pluginRateLimit(app)

  app.register(authRoutes, { prefix: '/api/v1/auth' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
