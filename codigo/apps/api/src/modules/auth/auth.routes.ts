import { FastifyInstance } from 'fastify'
import { handleLogin, handleRefresh, handleLogout, handleTokenLogin, handleCadastro } from './auth.controller'
import { autenticar } from '../../middlewares/autenticar'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
        errorResponseBuilder: () => ({
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        }),
      },
    },
    handler: handleLogin,
  })

  app.post('/cadastro', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour',
        errorResponseBuilder: () => ({
          statusCode: 429,
          error: 'Too Many Requests',
          message: 'Muitos cadastros. Tente novamente em 1 hora.',
        }),
      },
    },
    handler: handleCadastro,
  })

  app.post('/token-login', { handler: handleTokenLogin })
  app.post('/refresh', { handler: handleRefresh })

  app.post('/logout', {
    preHandler: [autenticar],
    handler: handleLogout,
  })
}
