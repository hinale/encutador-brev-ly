import { useParams } from 'react-router'
import { PageShell } from '../components/page-shell'

export function RedirectPage() {
  const { shortUrl } = useParams()

  return (
    <PageShell title="Redirecionamento">
      <p className="text-md text-gray-500">{shortUrl}</p>
    </PageShell>
  )
}
