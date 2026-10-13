import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Link, LoaderCircle } from 'lucide-react'
import { DeleteLinkNotFoundError } from '../errors/delete-link-not-found-error'
import { DeleteLinkRequestError } from '../errors/delete-link-request-error'
import { deleteLink } from '../http/delete-link'
import { LINKS_QUERY_KEY, listLinks, type Link as ListedLink } from '../http/list-links'
import { LinkItem } from './link-item'
import { Button } from './ui/button'
import { Card } from './ui/card'

const EMPTY_LINKS_MESSAGE = 'AINDA NÃO EXISTEM LINKS CADASTRADOS'
const LIST_ERROR_MESSAGE = 'Não foi possível carregar os links.'
const DELETE_ERROR_MESSAGE = 'Não foi possível excluir o link. Tente novamente.'

const DOWNLOAD_BUTTON_CLASS_NAME =
  'inline-flex items-center justify-center gap-2 rounded-sm bg-gray-200 px-2 py-2 text-sm font-semibold text-gray-500 disabled:cursor-not-allowed disabled:opacity-50'

function readDeleteErrorMessage(error: unknown): string {
  if (error instanceof DeleteLinkRequestError) {
    return error.message
  }

  return DELETE_ERROR_MESSAGE
}

type LinkListContentProps = {
  isLoading: boolean
  isError: boolean
  links: ListedLink[] | undefined
  deletingShortUrl: string | undefined
  deleteErrorShortUrl: string | undefined
  deleteErrorMessage: string | null
  onRetry: () => void
  onDelete: (shortUrl: string) => void
}

function LinkListContent({
  isLoading,
  isError,
  links,
  deletingShortUrl,
  deleteErrorShortUrl,
  deleteErrorMessage,
  onRetry,
  onDelete,
}: LinkListContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <LoaderCircle className="size-8 animate-spin text-blue-base" aria-hidden="true" />
        <span className="sr-only">Carregando links</span>
      </div>
    )
  }

  if (isError || !links) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-danger" role="alert">
          {LIST_ERROR_MESSAGE}
        </p>
        <Button type="button" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <Link className="size-8 text-gray-400" aria-hidden="true" />
        <p className="text-xs uppercase text-gray-500">{EMPTY_LINKS_MESSAGE}</p>
      </div>
    )
  }

  return (
    <ul>
      {links.map((link) => (
        <li key={link.id} className="border-t border-gray-200 first:border-t-0">
          <LinkItem
            link={link}
            isDeleting={deletingShortUrl === link.shortUrl}
            deleteErrorMessage={
              deleteErrorShortUrl === link.shortUrl ? deleteErrorMessage : null
            }
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}

export function LinkList() {
  const queryClient = useQueryClient()
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: LINKS_QUERY_KEY,
    queryFn: listLinks,
  })
  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
    },
    onError: async (error) => {
      if (error instanceof DeleteLinkNotFoundError) {
        await queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
      }
    },
  })

  const isLoading = isPending || (isFetching && !data)
  const deleteFailed =
    deleteLinkMutation.isError &&
    !(deleteLinkMutation.error instanceof DeleteLinkNotFoundError)
  const deleteErrorMessage = deleteFailed
    ? readDeleteErrorMessage(deleteLinkMutation.error)
    : null

  return (
    <Card className="flex min-h-48 w-full flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-600">Meus links</h2>
        {/* A task 11 conecta o clique deste botão ao download do CSV. */}
        <button type="button" className={DOWNLOAD_BUTTON_CLASS_NAME} disabled>
          <Download className="size-4" aria-hidden="true" />
          Baixar CSV
        </button>
      </div>

      <div className="my-5 border-t border-gray-200" />

      <LinkListContent
        isLoading={isLoading}
        isError={isError}
        links={data?.links}
        deletingShortUrl={
          deleteLinkMutation.isPending ? deleteLinkMutation.variables : undefined
        }
        deleteErrorShortUrl={deleteFailed ? deleteLinkMutation.variables : undefined}
        deleteErrorMessage={deleteErrorMessage}
        onRetry={() => {
          void refetch()
        }}
        onDelete={(shortUrl) => {
          deleteLinkMutation.mutate(shortUrl)
        }}
      />
    </Card>
  )
}
