import { PageShell } from '../components/page-shell'

export function NotFoundPage() {
  return (
    <PageShell title="Página não encontrada">
      <p className="text-md text-gray-500">
        O endereço acessado não existe.
      </p>
    </PageShell>
  )
}
