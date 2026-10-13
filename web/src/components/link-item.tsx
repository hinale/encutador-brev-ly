import { Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { env } from '../env'
import { buildFrontendShortUrl } from '../http/build-frontend-short-url'
import type { Link } from '../http/list-links'
import { IconButton } from './ui/icon-button'

const COPY_ERROR_MESSAGE = 'Não foi possível copiar o link.'
const SINGULAR_ACCESS_COUNT = 1

type LinkItemProps = {
  link: Link
  isDeleting: boolean
  deleteErrorMessage: string | null
  onDelete: (shortUrl: string) => void
}

function formatAccessCount(accessCount: number): string {
  if (accessCount === SINGULAR_ACCESS_COUNT) {
    return '1 acesso'
  }

  return `${accessCount} acessos`
}

export function LinkItem({
  link,
  isDeleting,
  deleteErrorMessage,
  onDelete,
}: LinkItemProps) {
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null)
  const fullShortUrl = buildFrontendShortUrl(env.VITE_FRONTEND_URL, link.shortUrl)

  async function handleCopy() {
    setCopyErrorMessage(null)

    try {
      await navigator.clipboard.writeText(fullShortUrl)
    } catch {
      setCopyErrorMessage(COPY_ERROR_MESSAGE)
    }
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-md font-semibold text-blue-base">{fullShortUrl}</p>
          <p className="mt-1 truncate text-sm text-gray-500">{link.originalUrl}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-sm whitespace-nowrap text-gray-500">
            {formatAccessCount(link.accessCount)}
          </span>
          <IconButton aria-label={`Copiar ${fullShortUrl}`} onClick={() => void handleCopy()}>
            <Copy className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            aria-label={`Excluir ${link.shortUrl}`}
            disabled={isDeleting}
            aria-busy={isDeleting}
            onClick={() => onDelete(link.shortUrl)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {copyErrorMessage ? (
        <p className="text-sm text-danger" role="alert">
          {copyErrorMessage}
        </p>
      ) : null}

      {deleteErrorMessage ? (
        <p className="text-sm text-danger" role="alert">
          {deleteErrorMessage}
        </p>
      ) : null}
    </div>
  )
}
