import { api } from './api'

export const LINKS_QUERY_KEY = ['links'] as const

export type Link = {
  id: string
  originalUrl: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export type ListLinksResponse = {
  links: Link[]
}

export async function listLinks(): Promise<ListLinksResponse> {
  const response = await api.get<ListLinksResponse>('/links')

  return response.data
}
