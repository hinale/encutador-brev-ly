import { eq } from 'drizzle-orm'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, isLeft, makeLeft, makeRight, unwrapEither } from '@/shared/either'
import { parseShortUrl } from './parse-short-url'

type DeleteLinkError = InvalidShortUrlError | LinkNotFoundError

export async function deleteLink(input: {
  shortUrl: string
}): Promise<Either<DeleteLinkError, { shortUrl: string }>> {
  const parsed = parseShortUrl(input.shortUrl)

  if (isLeft(parsed)) {
    return parsed
  }

  const shortUrl = unwrapEither(parsed)
  const deleted = await db
    .delete(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning({ shortUrl: schema.links.shortUrl })

  const removed = deleted[0]

  if (!removed) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight(removed)
}
