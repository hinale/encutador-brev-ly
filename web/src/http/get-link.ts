import axios from 'axios'
import { GetLinkRequestError } from '../errors/get-link-request-error'
import { LinkNotFoundError } from '../errors/link-not-found-error'
import { api } from './api'
import type { Link } from './list-links'

const CLIENT_ERROR_STATUSES = new Set([400, 404])

export type GetLinkResponse = {
  link: Link
}

export async function getLink(shortUrl: string): Promise<GetLinkResponse> {
  try {
    const response = await api.get<GetLinkResponse>(
      `/links/${encodeURIComponent(shortUrl)}`,
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

    throw new GetLinkRequestError()
  }
}
