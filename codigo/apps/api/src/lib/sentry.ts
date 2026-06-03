import * as Sentry from '@sentry/node'

export function initSentry() {
  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    console.warn('[Sentry] SENTRY_DSN não definido — monitoramento de erros desativado')
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    enabled: process.env.NODE_ENV !== 'test',
  })
}

export { Sentry }
