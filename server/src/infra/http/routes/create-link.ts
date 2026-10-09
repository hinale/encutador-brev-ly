import {
  createLink,
  originalUrlSchema,
  shortUrlSchema,
} from '@/app/functions/create-link'
import { ShortUrlAlreadyExistsError } from '@/app/functions/errors/short-url-already-exists-error'
import { isLeft, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const INVALID_LINK_MESSAGE = 'Dados inválidos'
const DUPLICATE_LINK_MESSAGE = 'Link encurtado já existe'

const linkResponseSchema = z.object({
  link: z.object({
    id: z.string(),
    originalUrl: z.string(),
    shortUrl: z.string(),
    accessCount: z.number(),
    createdAt: z.string(),
  }),
})

export const createLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/links',
    {
      schema: {
        body: z.object({
          originalUrl: originalUrlSchema,
          shortUrl: shortUrlSchema,
        }),
        response: {
          201: linkResponseSchema,
          400: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await createLink(request.body)

      if (isLeft(result)) {
        const error = unwrapEither(result)

        if (error instanceof ShortUrlAlreadyExistsError) {
          return reply.status(409).send({ message: DUPLICATE_LINK_MESSAGE })
        }

        return reply.status(400).send({ message: INVALID_LINK_MESSAGE })
      }

      const link = unwrapEither(result)

      return reply.status(201).send({
        link: {
          id: link.id,
          originalUrl: link.originalUrl,
          shortUrl: link.shortUrl,
          accessCount: link.accessCount,
          createdAt: link.createdAt.toISOString(),
        },
      })
    },
  )
}
