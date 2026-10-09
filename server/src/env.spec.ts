import { afterEach, describe, expect, it, vi } from 'vitest'

const ENV_KEYS = [
  'PORT',
  'DATABASE_URL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'CLOUDFLARE_BUCKET',
  'CLOUDFLARE_PUBLIC_URL',
] as const

const emptyCloudflare = {
  CLOUDFLARE_ACCOUNT_ID: '',
  CLOUDFLARE_ACCESS_KEY_ID: '',
  CLOUDFLARE_SECRET_ACCESS_KEY: '',
  CLOUDFLARE_BUCKET: '',
  CLOUDFLARE_PUBLIC_URL: '',
}

const databaseUrl = 'postgresql://docker:docker@localhost:5432/brevly'

function replaceEnv(values: Record<string, string | undefined>): void {
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      process.env[key] = value
    }
  }
}

async function importEnv() {
  vi.resetModules()
  return import('./env')
}

const envSnapshot = { ...process.env }

describe('loadEnv', () => {
  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }

    Object.assign(process.env, envSnapshot)
    vi.resetModules()
  })

  it('uses 3333 when PORT is empty', async () => {
    replaceEnv({
      PORT: '',
      DATABASE_URL: databaseUrl,
      ...emptyCloudflare,
    })

    const { env } = await importEnv()

    expect(env.PORT).toBe(3333)
  })

  it('rejects a missing DATABASE_URL', async () => {
    replaceEnv({
      PORT: '3333',
      ...emptyCloudflare,
    })

    await expect(importEnv()).rejects.toThrow(/DATABASE_URL/)
  })

  it('rejects a DATABASE_URL without the postgresql prefix', async () => {
    replaceEnv({
      PORT: '3333',
      DATABASE_URL: 'https://example.com',
      ...emptyCloudflare,
    })

    await expect(importEnv()).rejects.toThrow()
  })
})
