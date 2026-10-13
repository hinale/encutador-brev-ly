import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { InvalidDescriptionError } from './errors/invalid-description-error'
import { InvalidOriginalUrlError } from './errors/invalid-original-url-error'
import { InvalidPreviewImageUrlError } from './errors/invalid-preview-image-url-error'
import { InvalidShortUrlError } from './errors/invalid-short-url-error'
import { ShortUrlAlreadyExistsError } from './errors/short-url-already-exists-error'

const SHORT_URL_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DESCRIPTION_MAX_LENGTH = 500

export const shortUrlSchema = z.string().regex(SHORT_URL_PATTERN)

export const originalUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
})

function toOptionalNullableText(value: unknown): unknown {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export const descriptionSchema = z.preprocess(
  toOptionalNullableText,
  z.union([z.string().max(DESCRIPTION_MAX_LENGTH), z.null()]),
)

export const previewImageUrlSchema = z.preprocess(
  toOptionalNullableText,
  z.union([
    z.null(),
    z.string().refine((value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }),
  ]),
)

const createLinkInput = z.object({
  originalUrl: originalUrlSchema,
  shortUrl: shortUrlSchema,
  description: descriptionSchema.optional(),
  previewImageUrl: previewImageUrlSchema.optional(),
})

type CreateLinkInput = z.input<typeof createLinkInput>

export type CreatedLink = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  description: string | null
  previewImageUrl: string | null
  createdAt: Date
}

type CreateLinkError =
  | InvalidShortUrlError
  | InvalidOriginalUrlError
  | InvalidDescriptionError
  | InvalidPreviewImageUrlError
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
    const issuePaths = new Set(
      parsed.error.issues.map((issue) => issue.path[0]),
    )

    if (issuePaths.has('shortUrl')) {
      return makeLeft(new InvalidShortUrlError())
    }

    if (issuePaths.has('description')) {
      return makeLeft(new InvalidDescriptionError())
    }

    if (issuePaths.has('previewImageUrl')) {
      return makeLeft(new InvalidPreviewImageUrlError())
    }

    return makeLeft(new InvalidOriginalUrlError())
  }

  const originalUrl = parsed.data.originalUrl
  const shortUrl = parsed.data.shortUrl
  const description = parsed.data.description ?? null
  const previewImageUrl = parsed.data.previewImageUrl ?? null

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
      .values({
        originalUrl,
        shortUrl,
        description,
        previewImageUrl,
      })
      .returning()

    return makeRight(link)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return makeLeft(new ShortUrlAlreadyExistsError())
    }

    throw error
  }
}
