import axios from 'axios'
import { CreateLinkConflictError } from '../errors/create-link-conflict-error'
import { CreateLinkRequestError } from '../errors/create-link-request-error'
import { api } from './api'
import type { CreateLinkFormValues } from './create-link-schema'

const CONFLICT_STATUS = 409
const FALLBACK_CONFLICT_MESSAGE = 'Link encurtado já existe'

type CreatedLinkResponse = {
  link: {
    id: string
    originalUrl: string
    shortUrl: string
    accessCount: number
    createdAt: string
  }
}

function readConflictMessage(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message
  }

  return FALLBACK_CONFLICT_MESSAGE
}

export async function createLink(
  input: CreateLinkFormValues,
): Promise<CreatedLinkResponse> {
  try {
    const response = await api.post<CreatedLinkResponse>('/links', {
      originalUrl: input.originalUrl,
      shortUrl: input.shortUrl,
    })

    return response.data
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === CONFLICT_STATUS
    ) {
      throw new CreateLinkConflictError(readConflictMessage(error.response.data))
    }

    throw new CreateLinkRequestError()
  }
}
