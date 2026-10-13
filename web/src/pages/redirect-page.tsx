import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import logoIcon from '../assets/logo-icon.svg'
import { GetLinkRequestError } from '../errors/get-link-request-error'
import { LinkNotFoundError } from '../errors/link-not-found-error'
import { getLink } from '../http/get-link'
import { incrementLinkAccess } from '../http/increment-link-access'
import { isValidShortUrl } from '../http/short-url-pattern'
import { NotFoundPage } from './not-found-page'

type RedirectStatus = 'loading' | 'not-found' | 'ready'

export function RedirectPage() {
  const { shortUrl } = useParams()
  const processedShortUrlRef = useRef<string | null>(null)
  const [status, setStatus] = useState<RedirectStatus>('loading')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [requestErrorMessage, setRequestErrorMessage] = useState<string | null>(
    null,
  )

  const isShortUrlValid =
    typeof shortUrl === 'string' && isValidShortUrl(shortUrl)

  useEffect(() => {
    if (!isShortUrlValid || shortUrl === undefined) {
      return
    }

    if (processedShortUrlRef.current === shortUrl) {
      return
    }

    const currentShortUrl = shortUrl
    processedShortUrlRef.current = currentShortUrl

    async function resolveAndRedirect() {
      try {
        const { link } = await getLink(currentShortUrl)

        setOriginalUrl(link.originalUrl)
        setStatus('ready')

        try {
          await incrementLinkAccess(currentShortUrl)
          window.location.assign(link.originalUrl)
        } catch {
          setRequestErrorMessage(
            'Não foi possível registrar o acesso. Use o link abaixo.',
          )
        }
      } catch (error: unknown) {
        if (error instanceof LinkNotFoundError) {
          setStatus('not-found')
          return
        }

        if (error instanceof GetLinkRequestError) {
          setRequestErrorMessage(error.message)
          return
        }

        setStatus('not-found')
      }
    }

    void resolveAndRedirect()
  }, [isShortUrlValid, shortUrl])

  if (!isShortUrlValid || status === 'not-found') {
    return <NotFoundPage />
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-gray-200 px-3 py-8">
      <div className="flex w-full max-w-xl flex-col items-center rounded-lg bg-gray-100 px-5 py-10 text-center sm:px-12 sm:py-12">
        <img src={logoIcon} alt="Brev.ly" className="mb-6 h-10 w-auto max-w-full sm:h-12" />
        <h1 className="mb-3 text-lg font-bold text-gray-600">
          Redirecionando...
        </h1>
        <p className="mb-4 text-md text-gray-500">
          O link será aberto automaticamente em alguns instantes.
        </p>
        {originalUrl ? (
          <p className="text-md text-gray-500">
            Não foi redirecionado?{' '}
            <a
              href={originalUrl}
              className="font-semibold text-blue-base hover:underline"
            >
              Acesse aqui
            </a>
          </p>
        ) : (
          <p className="text-md text-gray-500" role="status">
            Preparando o redirecionamento...
          </p>
        )}
        {requestErrorMessage ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {requestErrorMessage}
          </p>
        ) : null}
      </div>
    </main>
  )
}
