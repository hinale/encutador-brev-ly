import axios from 'axios'
import { IncrementLinkAccessError } from '../errors/increment-link-access-error'
import { LinkNotFoundError } from '../errors/link-not-found-error'
import { api } from './api'
import type { Link } from './list-links'

const CLIENT_ERROR_STATUSES = new Set([400, 404])

export type IncrementLinkAccessResponse = {
  link: Link
}

export async function incrementLinkAccess(
  shortUrl: string,
): Promise<IncrementLinkAccessResponse> {
  try {
    const response = await api.patch<IncrementLinkAccessResponse>(
      `/links/${encodeURIComponent(shortUrl)}/access`,
    )

    return response.data
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response !== undefined &&
      CLIENT_ERROR_STATUSES.has(error.response.status)
    ) {
      throw new LinkNotFoundError()
    }

    throw new IncrementLinkAccessError()
  }
}
