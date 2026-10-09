import { createLink } from '@/app/functions/create-link'
import { deleteLink } from '@/app/functions/delete-link'
import { InvalidShortUrlError } from '@/app/functions/errors/invalid-short-url-error'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('deleteLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('deletes the link that matches the slug', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })
    await createLink({
      originalUrl: 'https://example.com',
      shortUrl: 'example',
    })

    const result = await deleteLink({ shortUrl: 'rocketseat' })

    expect(isRight(result)).toBe(true)

    const remaining = await db.select().from(schema.links)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.shortUrl).toBe('example')
  })

  it('returns not found when deleting the same slug again', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const first = await deleteLink({ shortUrl: 'rocketseat' })
    const second = await deleteLink({ shortUrl: 'rocketseat' })

    expect(isRight(first)).toBe(true)
    expect(isLeft(second)).toBe(true)
    expect(unwrapEither(second)).toBeInstanceOf(LinkNotFoundError)
  })

  it('rejects a malformed slug and keeps existing rows', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const result = await deleteLink({ shortUrl: 'Meu Link' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(InvalidShortUrlError)

    const rows = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, 'rocketseat'))

    expect(rows).toHaveLength(1)
  })
})

describe('DELETE /links/:shortUrl', () => {
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

  it('returns 204 with an empty body', async () => {
    await createLink({
      originalUrl: 'https://rocketseat.com.br',
      shortUrl: 'rocketseat',
    })

    const response = await app.inject({
      method: 'DELETE',
      url: '/links/rocketseat',
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')

    const rows = await db.select().from(schema.links)
    expect(rows).toHaveLength(0)
  })

  it('returns 404 when the slug is already gone', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/links/missing',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({ message: 'Link não encontrado' })
  })

  it('returns 400 when the slug is invalid', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/links/Link',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ message: 'Dados inválidos' })
  })
})
