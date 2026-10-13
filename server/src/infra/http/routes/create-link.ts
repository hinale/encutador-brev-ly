import {
  createLink,
  descriptionSchema,
  originalUrlSchema,
  previewImageUrlSchema,
  shortUrlSchema,
} from '@/app/functions/create-link'
import { ShortUrlAlreadyExistsError } from '@/app/functions/errors/short-url-already-exists-error'
import { isLeft, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { linkSchema, presentLink } from '../presenters/link-presenter'

const INVALID_LINK_MESSAGE = 'Dados inválidos'
const DUPLICATE_LINK_MESSAGE = 'Link encurtado já existe'

const linkResponseSchema = z.object({
  link: linkSchema,
})

export const createLinkRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/links',
    {
      schema: {
        body: z.object({
          originalUrl: originalUrlSchema,
          shortUrl: shortUrlSchema,
          description: descriptionSchema.optional(),
          previewImageUrl: previewImageUrlSchema.optional(),
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

      return reply.status(201).send({
        link: presentLink(unwrapEither(result)),
      })
    },
  )
}
