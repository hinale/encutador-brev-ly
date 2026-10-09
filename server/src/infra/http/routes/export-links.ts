import { z } from 'zod'
import { exportLinks } from '@/app/functions/export-links'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const exportLinksRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/links/exports',
    {
      schema: {
        response: {
          201: z.object({
            reportUrl: z.string().url(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const result = await exportLinks()
      const { reportUrl } = unwrapEither(result)

      return reply.status(201).send({ reportUrl })
    },
  )
}
