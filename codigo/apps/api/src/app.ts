import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { pluginCors } from './plugins/cors'
import { pluginHelmet } from './plugins/helmet'
import { pluginRateLimit } from './plugins/rateLimit'
import { authRoutes } from './modules/auth/auth.routes'
import { obrasRoutes } from './modules/obras/obras.routes'
import { funcionariosRoutes } from './modules/funcionarios/funcionarios.routes'
import { engenheirosRoutes } from './modules/engenheiros/engenheiros.routes'
import { servicosRoutes } from './modules/servicos/servicos.routes'
import { medicoesRoutes } from './modules/medicoes/medicoes.routes'
import { medicoesGlobalRoutes } from './modules/medicoes/medicoes.global.routes'
import { relatoriosRoutes } from './modules/relatorios/relatorios.routes'
import { pagamentosRoutes } from './modules/pagamentos/pagamentos.routes'

export async function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  await pluginHelmet(app)
  await pluginCors(app)
  await pluginRateLimit(app)
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET ?? 'brain-master-dev-secret',
  })

  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(obrasRoutes, { prefix: '/api/v1/obras' })
  app.register(funcionariosRoutes, { prefix: '/api/v1/funcionarios' })
  app.register(engenheirosRoutes, { prefix: '/api/v1/engenheiros' })
  app.register(servicosRoutes, { prefix: '/api/v1/obras' })
  app.register(medicoesRoutes, { prefix: '/api/v1/obras' })
  app.register(medicoesGlobalRoutes, { prefix: '/api/v1/medicoes' })
  app.register(relatoriosRoutes, { prefix: '/api/v1/relatorios' })
  app.register(pagamentosRoutes, { prefix: '/api/v1/obras' })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
