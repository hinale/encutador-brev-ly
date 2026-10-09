import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { InvalidOriginalUrlError } from './errors/invalid-original-url-error'
import { InvalidShortUrlError } from './errors/invalid-short-url-error'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists-error'

const SHORT_URL_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const shortUrlSchema = z.string().regex(SHORT_URL_PATTERN)

export const originalUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
})

const createLinkInput = z.object({
  originalUrl: originalUrlSchema,
  shortUrl: shortUrlSchema,
})

type CreateLinkInput = z.input<typeof createLinkInput>

export type CreatedLink = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: Date
}

type CreateLinkError =
  | InvalidShortUrlError
  | InvalidOriginalUrlError
  | ShortUrlAlreadyExistsError

const UNIQUE_VIOLATION_CODE = '23505'

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  if ('code' in error && error.code === UNIQUE_VIOLATION_CODE) {
    return true
  }

  if ('cause' in error) {
    return isUniqueViolation(error.cause)
  }

  return false
}

export async function createLink(
  input: CreateLinkInput,
): Promise<Either<CreateLinkError, CreatedLink>> {
  const parsed = createLinkInput.safeParse(input)

  if (!parsed.success) {
    const invalidShortUrl = parsed.error.issues.some(
      (issue) => issue.path[0] === 'shortUrl',
    )

    if (invalidShortUrl) {
      return makeLeft(new InvalidShortUrlError())
    }

    return makeLeft(new InvalidOriginalUrlError())
  }

  const { originalUrl, shortUrl } = parsed.data

  const existing = await db
    .select({ id: schema.links.id })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (existing.length > 0) {
    return makeLeft(new ShortUrlAlreadyExistsError())
  }

  try {
    const [link] = await db
      .insert(schema.links)
      .values({ originalUrl, shortUrl })
      .returning()

    return makeRight(link)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return makeLeft(new ShortUrlAlreadyExistsError())
    }

    throw error
  }
}
