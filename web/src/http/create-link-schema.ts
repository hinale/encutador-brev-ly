import { z } from 'zod'
import { SHORT_URL_PATTERN } from './short-url-pattern'

export const ORIGINAL_URL_ERROR_MESSAGE = 'Informe uma url válida.'
export const SHORT_URL_ERROR_MESSAGE =
  'Informe uma url minúscula e sem espaço/caracter especial.'

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const createLinkFormSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, ORIGINAL_URL_ERROR_MESSAGE)
    .refine(isHttpUrl, ORIGINAL_URL_ERROR_MESSAGE),
  shortUrl: z
    .string()
    .trim()
    .min(1, SHORT_URL_ERROR_MESSAGE)
    .regex(SHORT_URL_PATTERN, SHORT_URL_ERROR_MESSAGE),
})

export type CreateLinkFormValues = z.infer<typeof createLinkFormSchema>
