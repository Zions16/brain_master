import 'dotenv/config'
import { initSentry } from './lib/sentry'

// Sentry deve ser inicializado antes de qualquer outro import
initSentry()

import { buildApp } from './app'

const PORT = Number(process.env.PORT ?? 3333)

async function start() {
  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`API rodando em http://localhost:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
