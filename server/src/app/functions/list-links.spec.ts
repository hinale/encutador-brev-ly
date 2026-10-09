import { listLinks } from '@/app/functions/list-links'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('listLinks', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('returns an empty list when there are no links', async () => {
    const result = await listLinks()

    expect(isRight(result)).toBe(true)

    if (!isRight(result)) {
      return
    }

    expect(unwrapEither(result).links).toEqual([])
  })

  it('returns every link with the newest createdAt first', async () => {
    await db.insert(schema.links).values([
      {
        originalUrl: 'https://older.example',
        shortUrl: 'older',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        originalUrl: 'https://newer.example',
        shortUrl: 'newer',
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
      },
    ])

    const result = await listLinks()

    expect(isRight(result)).toBe(true)

    if (!isRight(result)) {
      return
    }

    const { links } = unwrapEither(result)
    expect(links.map((link) => link.shortUrl)).toEqual(['newer', 'older'])
  })
})

describe('GET /links', () => {
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

  it('returns 200 and an empty list', async () => {
    const response = await app.inject({ method: 'GET', url: '/links' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ links: [] })
  })

  it('returns 200 with links ordered by createdAt descending', async () => {
    await db.insert(schema.links).values([
      {
        originalUrl: 'https://older.example',
        shortUrl: 'older',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        originalUrl: 'https://newer.example',
        shortUrl: 'newer',
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
      },
    ])

    const response = await app.inject({ method: 'GET', url: '/links' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      links: [{ shortUrl: 'newer' }, { shortUrl: 'older' }],
    })
  })
})
