import { z } from 'zod'

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value.trim() === '') {
        return 3333
      }

      return Number(value)
    })
    .pipe(z.number().int().positive()),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .url()
    .startsWith('postgresql://'),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source)
}

export const env = loadEnv(process.env)
