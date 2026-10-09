import { createLink } from '@/app/functions/create-link'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { getLink } from '@/app/functions/get-link'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('getLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('returns the link when the slug exists', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const result = await getLink({ shortUrl: 'rocketseat' })

    expect(isRight(result)).toBe(true)

    if (!isRight(result)) {
      return
    }

    const link = unwrapEither(result)
    expect(link.shortUrl).toBe('rocketseat')
    expect(link.originalUrl).toBe('https://rocketseat.com.br')
    expect(link.accessCount).toBe(0)
  })

  it('returns not found when the slug does not exist', async () => {
    const result = await getLink({ shortUrl: 'missing' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(LinkNotFoundError)
  })

  it('rejects a malformed slug', async () => {
    const result = await getLink({ shortUrl: 'Meu Link' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(InvalidShortUrlError)
  })

  it('does not change the access count', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    await getLink({ shortUrl: 'rocketseat' })

    const [row] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, 'rocketseat'))

    expect(row?.accessCount).toBe(0)
  })
})

describe('GET /links/:shortUrl', () => {
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

  it('returns 200 without incrementing access', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const response = await app.inject({
      method: 'GET',
      url: '/links/rocketseat',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      link: {
        shortUrl: 'rocketseat',
        originalUrl: 'https://rocketseat.com.br',
        accessCount: 0,
      },
    })

    const [row] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, 'rocketseat'))

    expect(row?.accessCount).toBe(0)
  })

  it('returns 404 when the slug is valid but missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/links/missing',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ message: 'Link não encontrado' })
  })

  it('returns 400 when the slug is invalid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/links/Link',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ message: 'Dados inválidos' })
  })
})
