import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/env'
import { r2 } from './client'
import { StorageUploadError } from './storage-upload-error'

const EXPORTS_FOLDER = 'exports'
const CSV_CONTENT_TYPE = 'text/csv'
const EXPORT_FILE_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.csv$/

const uploadFileToStorageInput = z.object({
  folder: z.literal(EXPORTS_FOLDER),
  fileName: z.string().regex(EXPORT_FILE_NAME_PATTERN),
  contentType: z.literal(CSV_CONTENT_TYPE),
  contentStream: z.instanceof(Readable),
})

export type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export type StoredFile = {
  key: string
  url: string
}

export function toPublicObjectUrl(publicUrl: string, objectKey: string): string {
  const base = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`

  return new URL(objectKey, base).toString()
}

export async function uploadFileToStorage(
  input: UploadFileToStorageInput,
): Promise<StoredFile> {
  const parsed = uploadFileToStorageInput.safeParse(input)

  if (!parsed.success) {
    throw new StorageUploadError()
  }

  const { folder, fileName, contentType, contentStream } = parsed.data
  const key = `${folder}/${fileName}`

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: key,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  try {
    await upload.done()
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'Unknown storage error'
    console.error(`Storage upload failed: ${detail}`)
    throw new StorageUploadError()
  }

  return {
    key,
    url: toPublicObjectUrl(env.CLOUDFLARE_PUBLIC_URL, key),
  }
}
