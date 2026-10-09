import { listLinks } from '@/app/functions/list-links'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { linkSchema, presentLink } from '../presenters/link-presenter'

export const listLinksRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/links',
    {
      schema: {
        response: {
          200: z.object({
            links: z.array(linkSchema),
          }),
        },
      },
    },
    async (_request, reply) => {
      const result = await listLinks()
      const { links } = unwrapEither(result)

      return reply.status(200).send({
        links: links.map(presentLink),
      })
    },
  )
}
