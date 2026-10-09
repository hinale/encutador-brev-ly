import { env } from '@/env'
import { buildServer } from './app'

const server = buildServer()

server
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
