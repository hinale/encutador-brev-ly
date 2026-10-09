import { randomUUID } from 'node:crypto'
import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { desc } from 'drizzle-orm'
import { InvalidExportRowError } from '@/app/functions/errors/invalid-export-row-error'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { type Either, makeRight } from '@/shared/either'

const CURSOR_CHUNK_SIZE = 50
const EXPORTS_FOLDER = 'exports'
const CSV_CONTENT_TYPE = 'text/csv'

const CSV_COLUMNS = [
  { key: 'original_url', header: 'URL original' },
  { key: 'short_url', header: 'URL encurtada' },
  { key: 'access_count', header: 'Contagem de acessos' },
  { key: 'created_at', header: 'Data de criação' },
] as const

type ExportLinksOutput = {
  reportUrl: string
}

type LinkExportRow = {
  original_url: string
  short_url: string
  access_count: number | string
  created_at: Date | string
}

function toIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date(value).toISOString()
}

function toSqlParameters(params: unknown[]): Array<string | number | boolean | Date | null> {
  return params.map((param) => {
    if (
      param === null ||
      typeof param === 'string' ||
      typeof param === 'number' ||
      typeof param === 'boolean' ||
      param instanceof Date
    ) {
      return param
    }

    throw new InvalidExportRowError()
  })
}
function isLinkExportRow(value: unknown): value is LinkExportRow {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const row = value as Record<string, unknown>

  return (
    typeof row.original_url === 'string' &&
    typeof row.short_url === 'string' &&
    (typeof row.access_count === 'number' || typeof row.access_count === 'string') &&
    (row.created_at instanceof Date || typeof row.created_at === 'string')
  )
}

export async function exportLinks(): Promise<Either<never, ExportLinksOutput>> {
  const { sql, params } = db
    .select({
      original_url: schema.links.originalUrl,
      short_url: schema.links.shortUrl,
      access_count: schema.links.accessCount,
      created_at: schema.links.createdAt,
    })
    .from(schema.links)
    .orderBy(desc(schema.links.createdAt))
    .toSQL()

  const cursor = pg.unsafe(sql, toSqlParameters(params)).cursor(CURSOR_CHUNK_SIZE)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [...CSV_COLUMNS],
  })

  const uploadToStorageStream = new PassThrough()

  const convertToCsvPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _encoding, callback) {
        try {
          for (const chunk of chunks) {
            if (!isLinkExportRow(chunk)) {
              callback(new InvalidExportRowError())
              return
            }

            this.push({
              original_url: chunk.original_url,
              short_url: chunk.short_url,
              access_count: chunk.access_count,
              created_at: toIsoTimestamp(chunk.created_at),
            })
          }

          callback()
        } catch (error: unknown) {
          callback(
            error instanceof Error ? error : new InvalidExportRowError(),
          )
        }
      },
    }),
    csv,
    uploadToStorageStream,
  )

  const uploadToStorage = uploadFileToStorage({
    contentType: CSV_CONTENT_TYPE,
    folder: EXPORTS_FOLDER,
    fileName: `${randomUUID()}.csv`,
    contentStream: uploadToStorageStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline])

  return makeRight({ reportUrl: url })
}
