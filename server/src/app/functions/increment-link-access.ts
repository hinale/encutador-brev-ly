import { eq, sql } from 'drizzle-orm'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, isLeft, makeLeft, makeRight, unwrapEither } from '@/shared/either'
import type { CreatedLink } from './create-link'
import { parseShortUrl } from './parse-short-url'

type IncrementLinkAccessError = InvalidShortUrlError | LinkNotFoundError

export async function incrementLinkAccess(input: {
  shortUrl: string
}): Promise<Either<IncrementLinkAccessError, CreatedLink>> {
  const parsed = parseShortUrl(input.shortUrl)

  if (isLeft(parsed)) {
    return parsed
  }

  const shortUrl = unwrapEither(parsed)
  const updated = await db
    .update(schema.links)
    .set({
      accessCount: sql`${schema.links.accessCount} + 1`,
    })
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning()

  const link = updated[0]

  if (!link) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(link)
}
