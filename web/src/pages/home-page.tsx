import logo from '../assets/logo.svg'
import { PageShell } from '../components/page-shell'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'

export function HomePage() {
  return (
    <PageShell title="Página inicial">
      <img src={logo} alt="Brev.ly" className="h-8 w-fit" />
      <Card className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-gray-500">
          Link original
          <Input placeholder="www.exemplo.com.br" />
        </label>
        <Button className="w-full">Salvar link</Button>
      </Card>
    </PageShell>
  )
}
