import type { CreatedLink } from '@/app/functions/create-link'
import { z } from 'zod'

export const linkSchema = z.object({
  id: z.string(),
  originalUrl: z.string(),
  shortUrl: z.string(),
  accessCount: z.number(),
  createdAt: z.string(),
})

export const messageSchema = z.object({
  message: z.string(),
})

export const INVALID_LINK_MESSAGE = 'Dados inválidos'
export const LINK_NOT_FOUND_MESSAGE = 'Link não encontrado'

export function presentLink(link: CreatedLink) {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortUrl: link.shortUrl,
    accessCount: link.accessCount,
    createdAt: link.createdAt.toISOString(),
  }
}
