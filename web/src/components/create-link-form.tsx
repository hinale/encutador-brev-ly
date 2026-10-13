import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateLinkConflictError } from '../errors/create-link-conflict-error'
import { CreateLinkRequestError } from '../errors/create-link-request-error'
import { createLink } from '../http/create-link'
import {
  createLinkFormSchema,
  type CreateLinkFormValues,
} from '../http/create-link-schema'
import { LINKS_QUERY_KEY } from '../http/list-links'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'

const SHORT_URL_PREFIX = 'brev.ly/'

const FIELD_CLASS_NAME = 'flex flex-col gap-2'
const FIELD_LABEL_CLASS_NAME =
  'text-xs font-semibold uppercase text-gray-500'

const PREFIX_FIELD_CLASS_NAME =
  'flex h-12 items-center gap-1 rounded-lg border bg-white px-4 focus-within:border-blue-base'

function FieldErrorMessage({ message }: { message: string | undefined }) {
  if (!message) {
    return null
  }

  return (
    <p className="flex items-center gap-1 text-sm text-danger">
      <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

export function CreateLinkForm() {
  const queryClient = useQueryClient()
  const [requestError, setRequestError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkFormSchema),
    defaultValues: {
      originalUrl: '',
      shortUrl: '',
    },
  })

  async function onSubmit(values: CreateLinkFormValues) {
    setRequestError(null)

    try {
      await createLink(values)
    } catch (error: unknown) {
      if (error instanceof CreateLinkConflictError) {
        setError('shortUrl', { message: error.message })
        return
      }

      if (error instanceof CreateLinkRequestError) {
        setRequestError(error.message)
        return
      }

      setRequestError('Não foi possível criar o link. Tente novamente.')
      return
    }

    reset()
    await queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY })
  }

  const shortUrlInvalid = Boolean(errors.shortUrl)
  const prefixBorderClassName = shortUrlInvalid
    ? 'border-danger focus-within:border-danger'
    : 'border-gray-300'

  return (
    <Card className="flex w-full shrink-0 flex-col gap-6 lg:max-w-sm">
      <h2 className="text-lg font-bold text-gray-600">Novo link</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={FIELD_CLASS_NAME}>
          <label className={FIELD_LABEL_CLASS_NAME} htmlFor="original-url">
            Link original
          </label>
          <Input
            id="original-url"
            placeholder="www.exemplo.com.br"
            invalid={Boolean(errors.originalUrl)}
            {...register('originalUrl')}
          />
          <FieldErrorMessage message={errors.originalUrl?.message} />
        </div>

        <div className={FIELD_CLASS_NAME}>
          <label className={FIELD_LABEL_CLASS_NAME} htmlFor="short-url">
            Link encurtado
          </label>
          <div className={`${PREFIX_FIELD_CLASS_NAME} ${prefixBorderClassName}`}>
            <span className="text-md text-gray-400">{SHORT_URL_PREFIX}</span>
            <input
              id="short-url"
              className="min-w-0 flex-1 bg-transparent text-md text-gray-600 outline-none placeholder:text-gray-400"
              aria-invalid={shortUrlInvalid}
              {...register('shortUrl')}
            />
          </div>
          <FieldErrorMessage message={errors.shortUrl?.message} />
        </div>

        {requestError ? (
          <p className="text-sm text-danger" role="alert">
            {requestError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            'Salvar link'
          )}
        </Button>
      </form>
    </Card>
  )
}
