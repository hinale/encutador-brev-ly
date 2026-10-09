import { createLink } from '@/app/functions/create-link'
import { InvalidOriginalUrlError } from '@/app/functions/errors/invalid-original-url-error'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { ShortUrlAlreadyExistsError } from '@/app/functions/errors/short-url-already-exists-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

async function countByShortUrl(shortUrl: string): Promise<number> {
  const rows = await db
    .select({ id: schema.links.id })
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))

  return rows.length
}

describe('createLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('creates a link with access count zero', async () => {
    const result = await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    expect(isRight(result)).toBe(true)

    if (!isRight(result)) {
      return
    }

    const link = unwrapEither(result)
    expect(link.accessCount).toBe(0)
    expect(link.shortUrl).toBe('rocketseat')
    expect(link.originalUrl).toBe('https://rocketseat.com.br')
    expect(await countByShortUrl('rocketseat')).toBe(1)
  })

  it.each(['', 'Link', 'meu link', 'meu_link', 'a/b', '-abc', 'abc-'])(
    'rejects malformed short url %j',
    async (shortUrl) => {
      const result = await createLink({
        originalUrl: 'https://rocketseat.com.br',
        shortUrl,
      })

      expect(isLeft(result)).toBe(true)
      expect(unwrapEither(result)).toBeInstanceOf(InvalidShortUrlError)
      expect(await countByShortUrl(shortUrl)).toBe(0)
    },
  )

  it.each(['rocketseat.com', 'ftp://files.example.com/a', 'notaurl'])(
    'rejects an original url that is not http(s): %j',
    async (originalUrl) => {
      const result = await createLink({
        originalUrl,
        shortUrl: 'rocketseat',
      })

      expect(isLeft(result)).toBe(true)
      expect(unwrapEither(result)).toBeInstanceOf(InvalidOriginalUrlError)
      expect(await countByShortUrl('rocketseat')).toBe(0)
    },
  )

  it('rejects a short url that already exists and keeps a single row', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const result = await createLink({
      originalUrl: 'https://example.com',
      shortUrl: 'rocketseat',
    })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(ShortUrlAlreadyExistsError)

    const rows = await db.select().from(schema.links)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.originalUrl).toBe('https://rocketseat.com.br')
  })
})

describe('POST /links', () => {
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

  it('returns 201 and stores the slug without the frontend url', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://rocketseat.com.br',
        shortUrl: 'rocketseat',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      link: {
        originalUrl: 'https://rocketseat.com.br',
        shortUrl: 'rocketseat',
        accessCount: 0,
      },
    })
    expect(await countByShortUrl('rocketseat')).toBe(1)
  })

  it('returns 400 and does not store a malformed short url', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://rocketseat.com.br',
        shortUrl: 'Meu Link',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ message: 'Dados inválidos' })
    expect(await countByShortUrl('Meu Link')).toBe(0)
  })

  it('returns 400 and does not store an invalid original url', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'rocketseat.com',
        shortUrl: 'rocketseat',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ message: 'Dados inválidos' })
    expect(await countByShortUrl('rocketseat')).toBe(0)
  })

  it('returns 409 when the short url already exists', async () => {
    await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://rocketseat.com.br',
        shortUrl: 'rocketseat',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl: 'rocketseat',
      },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toEqual({ message: 'Link encurtado já existe' })

    const rows = await db.select().from(schema.links)
    expect(rows).toHaveLength(1)
  })
})
