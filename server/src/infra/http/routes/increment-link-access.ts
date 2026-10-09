import { shortUrlSchema } from '@/app/functions/create-link'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { isLeft, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  INVALID_LINK_MESSAGE,
  LINK_NOT_FOUND_MESSAGE,
  linkSchema,
  messageSchema,
  presentLink,
} from '../presenters/link-presenter'

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async (
  server,
) => {
  server.patch(
    '/links/:shortUrl/access',
    {
      schema: {
        params: z.object({
          shortUrl: shortUrlSchema,
        }),
        response: {
          200: z.object({ link: linkSchema }),
          400: messageSchema,
          404: messageSchema,
        },
      },
    },
    async (request, reply) => {
      const result = await incrementLinkAccess({
        shortUrl: request.params.shortUrl,
      })

      if (isLeft(result)) {
        const error = unwrapEither(result)

        if (error instanceof LinkNotFoundError) {
          return reply.status(404).send({ message: LINK_NOT_FOUND_MESSAGE })
        }

        return reply.status(400).send({ message: INVALID_LINK_MESSAGE })
      }

      return reply.status(200).send({
        link: presentLink(unwrapEither(result)),
      })
    },
  )
}
