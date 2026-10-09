import { eq } from 'drizzle-orm'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, isLeft, makeLeft, makeRight, unwrapEither } from '@/shared/either'
import type { CreatedLink } from './create-link'
import { parseShortUrl } from './parse-short-url'

type GetLinkError = InvalidShortUrlError | LinkNotFoundError

export async function getLink(input: {
  shortUrl: string
}): Promise<Either<GetLinkError, CreatedLink>> {
  const parsed = parseShortUrl(input.shortUrl)

  if (isLeft(parsed)) {
    return parsed
  }

  const shortUrl = unwrapEither(parsed)
  const [link] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(link)
}
