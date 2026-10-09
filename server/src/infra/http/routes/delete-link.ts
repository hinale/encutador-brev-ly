import { shortUrlSchema } from '@/app/functions/create-link'
import { deleteLink } from '@/app/functions/delete-link'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { isLeft, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  INVALID_LINK_MESSAGE,
  LINK_NOT_FOUND_MESSAGE,
  messageSchema,
} from '../presenters/link-presenter'

export const deleteLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    '/links/:shortUrl',
    {
      schema: {
        params: z.object({
          shortUrl: shortUrlSchema,
        }),
        response: {
          204: z.null(),
          400: messageSchema,
          404: messageSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await deleteLink({ shortUrl: request.params.shortUrl })

      if (isLeft(result)) {
        const error = unwrapEither(result)

        if (error instanceof LinkNotFoundError) {
          return reply.status(404).send({ message: LINK_NOT_FOUND_MESSAGE })
        }

        return reply.status(400).send({ message: INVALID_LINK_MESSAGE })
      }

      return reply.status(204).send(null)
    },
  )
}
