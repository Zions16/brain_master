import Fastify from 'fastify'
import { pluginCors } from './plugins/cors'
import { pluginHelmet } from './plugins/helmet'
import { pluginRateLimit } from './plugins/rateLimit'
import { authRoutes } from './modules/auth/auth.routes'
import { obrasRoutes } from './modules/obras/obras.routes'
import { funcionariosRoutes } from './modules/funcionarios/funcionarios.routes'

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  await pluginHelmet(app)
  await pluginCors(app)
  await pluginRateLimit(app)

  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(obrasRoutes, { prefix: '/api/v1/obras' })
  app.register(funcionariosRoutes, { prefix: '/api/v1/funcionarios' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
