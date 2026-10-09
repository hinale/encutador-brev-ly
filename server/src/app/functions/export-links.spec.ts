import * as upload from '@/infra/storage/upload-file-to-storage'
import { StorageUploadError } from '@/infra/storage/storage-upload-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { buildServer } from '@/infra/http/app'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportLinks } from './export-links'

const EXPORT_KEY_PATTERN = /^exports\/[0-9a-f-]{36}\.csv$/

function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'))
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}

describe('exportLinks', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    await db.delete(schema.links)
  })

  it('writes one csv row per link with the four columns', async () => {
    await db.insert(schema.links).values([
      {
        originalUrl: 'https://older.example',
        shortUrl: 'older',
        accessCount: 2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        originalUrl: 'https://newer.example',
        shortUrl: 'newer',
        accessCount: 5,
        createdAt: new Date('2024-06-01T00:00:00.000Z'),
      },
    ])

    const uploadStub = vi
      .spyOn(upload, 'uploadFileToStorage')
      .mockImplementation(async () => {
        return {
          key: 'exports/file.csv',
          url: 'https://cdn.example/exports/file.csv',
        }
      })

    const result = await exportLinks()
    const contentStream = uploadStub.mock.calls[0]?.[0].contentStream
    expect(contentStream).toBeDefined()

    if (!contentStream) {
      return
    }

    const csv = await readStream(contentStream)
    const rows = csv
      .trim()
      .split('\n')
      .map((row) => row.split(','))

    expect(isRight(result)).toBe(true)

    if (!isRight(result)) {
      return
    }

    expect(unwrapEither(result).reportUrl).toBe(
      'https://cdn.example/exports/file.csv',
    )
    expect(rows).toEqual([
      ['URL original', 'URL encurtada', 'Contagem de acessos', 'Data de criação'],
      ['https://newer.example', 'newer', '5', '2024-06-01T00:00:00.000Z'],
      ['https://older.example', 'older', '2', '2024-01-01T00:00:00.000Z'],
    ])

    const sent = uploadStub.mock.calls[0]?.[0]
    expect(`${sent?.folder}/${sent?.fileName}`).toMatch(EXPORT_KEY_PATTERN)
    expect(sent?.contentType).toBe('text/csv')
  })

  it('still uploads a header when there are no links', async () => {
    const uploadStub = vi
      .spyOn(upload, 'uploadFileToStorage')
      .mockImplementation(async () => {
        return {
          key: 'exports/empty.csv',
          url: 'https://cdn.example/exports/empty.csv',
        }
      })

    const result = await exportLinks()
    const contentStream = uploadStub.mock.calls[0]?.[0].contentStream
    expect(contentStream).toBeDefined()

    if (!contentStream) {
      return
    }

    const csv = (await readStream(contentStream)).trim()

    expect(isRight(result)).toBe(true)
    expect(csv).toBe(
      'URL original,URL encurtada,Contagem de acessos,Data de criação',
    )
    expect(uploadStub).toHaveBeenCalledTimes(1)
  })

  it('uses a different object key on each export', async () => {
    vi.spyOn(upload, 'uploadFileToStorage').mockImplementation(async () => {
      return {
        key: 'exports/file.csv',
        url: 'https://cdn.example/exports/file.csv',
      }
    })

    await exportLinks()
    await exportLinks()

    const keys = vi
      .mocked(upload.uploadFileToStorage)
      .mock.calls.map((call) => `${call[0].folder}/${call[0].fileName}`)

    expect(keys).toHaveLength(2)
    expect(keys[0]).toMatch(EXPORT_KEY_PATTERN)
    expect(keys[1]).toMatch(EXPORT_KEY_PATTERN)
    expect(keys[0]).not.toBe(keys[1])
  })
})

describe('POST /links/exports', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildServer()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    vi.restoreAllMocks()
    await db.delete(schema.links)
  })

  it('returns 201 and the public report url', async () => {
    vi.spyOn(upload, 'uploadFileToStorage').mockImplementation(async () => {
      return {
        key: 'exports/file.csv',
        url: 'https://cdn.example/exports/file.csv',
      }
    })

    const response = await app.inject({
      method: 'POST',
      url: '/links/exports',
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      reportUrl: 'https://cdn.example/exports/file.csv',
    })
  })

  it('returns 500 when the upload fails', async () => {
    vi.spyOn(upload, 'uploadFileToStorage').mockRejectedValueOnce(
      new StorageUploadError(),
    )

    const response = await app.inject({
      method: 'POST',
      url: '/links/exports',
    })

    expect(response.statusCode).toBe(500)
    expect(response.json()).toEqual({ message: 'Internal server error' })
    expect(response.body).not.toContain('secret-access-key')
  })
})
