import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { Sentry } from './lib/sentry'
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
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definido. Configure a variável de ambiente antes de iniciar em produção.')
  }

  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test'
      ? {
          redact: ['req.headers.authorization', 'body.password', 'body.token'],
          level: 'info',
        }
      : false,
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

  app.setErrorHandler((error, _request, reply) => {
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      })
    }
    Sentry.captureException(error)
    app.log.error(error)
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro interno do servidor',
    })
  })

  return app
}
