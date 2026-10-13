import { Link } from 'react-router'
import notFoundIllustration from '../assets/not-found.svg'

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-gray-200 px-3 py-8">
      <div className="flex w-full max-w-xl flex-col items-center rounded-lg bg-gray-100 px-5 py-10 text-center sm:px-12 sm:py-12">
        <img
          src={notFoundIllustration}
          alt=""
          className="mb-6 h-16 w-auto max-w-full sm:h-20"
          aria-hidden="true"
        />
        <h1 className="mb-3 text-lg font-bold text-gray-600">
          Link não encontrado
        </h1>
        <p className="mb-4 text-md text-gray-500">
          O link que você está tentando acessar não existe, foi removido ou é
          uma URL inválida.
        </p>
        <p className="text-md text-gray-500">
          Saiba mais em{' '}
          <Link to="/" className="font-semibold text-blue-base hover:underline">
            brev.ly
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
