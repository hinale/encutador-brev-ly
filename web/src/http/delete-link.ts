import axios from 'axios'
import { DeleteLinkNotFoundError } from '../errors/delete-link-not-found-error'
import { DeleteLinkRequestError } from '../errors/delete-link-request-error'
import { api } from './api'

const NOT_FOUND_STATUS = 404

export async function deleteLink(shortUrl: string): Promise<void> {
  try {
    await api.delete(`/links/${encodeURIComponent(shortUrl)}`)
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === NOT_FOUND_STATUS) {
      throw new DeleteLinkNotFoundError()
    }

    throw new DeleteLinkRequestError()
  }
}
