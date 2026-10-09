import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createLinkRoute } from './routes/create-link'
import { exportLinksRoute } from './routes/export-links'
import { deleteLinkRoute } from './routes/delete-link'
import { getLinkRoute } from './routes/get-link'
import { incrementLinkAccessRoute } from './routes/increment-link-access'
import { listLinksRoute } from './routes/list-links'

export function buildServer() {
  const server = fastify().withTypeProvider<ZodTypeProvider>()

  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  server.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: 'Dados inválidos',
      })
    }

    console.error(error)

    return reply.status(500).send({ message: 'Internal server error' })
  })

  server.register(fastifyCors, { origin: '*' })
  server.register(createLinkRoute)
  server.register(exportLinksRoute)
  server.register(listLinksRoute)
  server.register(incrementLinkAccessRoute)
  server.register(getLinkRoute)
  server.register(deleteLinkRoute)

  return server
}
