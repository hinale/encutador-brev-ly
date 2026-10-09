import { createLink } from '@/app/functions/create-link'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { incrementLinkAccess } from '@/app/functions/increment-link-access'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

async function accessCountOf(shortUrl: string): Promise<number | undefined> {
  const [row] = await db
    .select({ accessCount: schema.links.accessCount })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))

  return row?.accessCount
}

describe('incrementLinkAccess', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('increments from 0 to 1 and then from 1 to 2', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const first = await incrementLinkAccess({ shortUrl: 'rocketseat' })
    const second = await incrementLinkAccess({ shortUrl: 'rocketseat' })

    expect(isRight(first)).toBe(true)
    expect(isRight(second)).toBe(true)

    if (!isRight(first) || !isRight(second)) {
      return
    }

    expect(unwrapEither(first).accessCount).toBe(1)
    expect(unwrapEither(second).accessCount).toBe(2)
    expect(await accessCountOf('rocketseat')).toBe(2)
  })

  it('keeps both increments when they run together', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    await Promise.all([
      incrementLinkAccess({ shortUrl: 'rocketseat' }),
      incrementLinkAccess({ shortUrl: 'rocketseat' }),
    ])

    expect(await accessCountOf('rocketseat')).toBe(2)
  })

  it('returns not found when the slug does not exist', async () => {
    const result = await incrementLinkAccess({ shortUrl: 'missing' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(LinkNotFoundError)
  })

  it('rejects a malformed slug', async () => {
    const result = await incrementLinkAccess({ shortUrl: 'Meu Link' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(InvalidShortUrlError)
  })
})

describe('PATCH /links/:shortUrl/access', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildServer()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('returns 200 and the incremented link', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const response = await app.inject({
      method: 'PATCH',
      url: '/links/rocketseat/access',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      link: {
        shortUrl: 'rocketseat',
        accessCount: 1,
      },
    })
    expect(await accessCountOf('rocketseat')).toBe(1)
  })

  it('returns 404 when the slug is valid but missing', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/links/missing/access',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ message: 'Link não encontrado' })
  })

  it('returns 400 when the slug is invalid', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/links/Link/access',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ message: 'Dados inválidos' })
  })
})
