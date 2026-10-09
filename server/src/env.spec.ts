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

const cloudflare = {
  CLOUDFLARE_ACCOUNT_ID: 'account-id',
  CLOUDFLARE_ACCESS_KEY_ID: 'access-key-id',
  CLOUDFLARE_SECRET_ACCESS_KEY: 'secret-access-key',
  CLOUDFLARE_BUCKET: 'brevly',
  CLOUDFLARE_PUBLIC_URL: 'https://cdn.example',
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
      ...cloudflare,
    })

    const { env } = await importEnv()

    expect(env.PORT).toBe(3333)
  })

  it('rejects a missing DATABASE_URL', async () => {
    replaceEnv({
      PORT: '3333',
      ...cloudflare,
    })

    await expect(importEnv()).rejects.toThrow(/DATABASE_URL/)
  })

  it('rejects a DATABASE_URL without the postgresql prefix', async () => {
    replaceEnv({
      PORT: '3333',
      DATABASE_URL: 'https://example.com',
      ...cloudflare,
    })

    await expect(importEnv()).rejects.toThrow()
  })

  it('rejects an empty Cloudflare credential', async () => {
    replaceEnv({
      PORT: '3333',
      DATABASE_URL: databaseUrl,
      ...cloudflare,
      CLOUDFLARE_ACCOUNT_ID: '',
    })

    await expect(importEnv()).rejects.toThrow(/CLOUDFLARE_ACCOUNT_ID/)
  })

  it('rejects a Cloudflare public URL that is not a URL', async () => {
    replaceEnv({
      PORT: '3333',
      DATABASE_URL: databaseUrl,
      ...cloudflare,
      CLOUDFLARE_PUBLIC_URL: 'not-a-url',
    })

    await expect(importEnv()).rejects.toThrow(/CLOUDFLARE_PUBLIC_URL/)
  })
})
