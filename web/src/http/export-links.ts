import { ExportLinksRequestError } from '../errors/export-links-request-error'
import { api } from './api'

type ExportLinksResponse = {
  reportUrl: string
}

function readReportUrl(data: unknown): string | null {
  if (
    typeof data === 'object' &&
    data !== null &&
    'reportUrl' in data &&
    typeof data.reportUrl === 'string' &&
    data.reportUrl.trim().length > 0
  ) {
    return data.reportUrl
  }

  return null
}

export async function exportLinks(): Promise<ExportLinksResponse> {
  try {
    const response = await api.post<ExportLinksResponse>('/links/exports')
    const reportUrl = readReportUrl(response.data)

    if (!reportUrl) {
      throw new ExportLinksRequestError()
    }

    return { reportUrl }
  } catch (error: unknown) {
    if (error instanceof ExportLinksRequestError) {
      throw error
    }

    throw new ExportLinksRequestError()
  }
}
