import { toPublicObjectUrl } from '@/infra/storage/upload-file-to-storage'
import { describe, expect, it } from 'vitest'

const objectKey = 'exports/6ba7b810-9dad-11d1-80b4-00c04fd430c8.csv'

describe('toPublicObjectUrl', () => {
  it('joins a public url that has no trailing slash', () => {
    expect(toPublicObjectUrl('https://cdn.example', objectKey)).toBe(
      `https://cdn.example/${objectKey}`,
    )
  })

  it('does not duplicate the slash when the public url already ends with one', () => {
    expect(toPublicObjectUrl('https://cdn.example/', objectKey)).toBe(
      `https://cdn.example/${objectKey}`,
    )
  })
})
