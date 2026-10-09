import { shortUrlSchema } from '@/app/functions/create-link'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { type Either, makeLeft, makeRight } from '@/shared/either'

export function parseShortUrl(
  shortUrl: string,
): Either<InvalidShortUrlError, string> {
  const parsed = shortUrlSchema.safeParse(shortUrl)

  if (!parsed.success) {
    return makeLeft(new InvalidShortUrlError())
  }

  return makeRight(parsed.data)
}
