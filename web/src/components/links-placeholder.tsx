import { Link2 } from 'lucide-react'
import { Card } from './ui/card'

const EMPTY_LINKS_MESSAGE = 'AINDA NÃO EXISTEM LINKS CADASTRADOS'

export function LinksPlaceholder() {
  return (
    <Card className="flex min-h-48 w-full flex-1 flex-col gap-5">
      <h2 className="text-lg font-bold text-gray-600">Meus links</h2>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
        <Link2 className="size-8 text-gray-400" aria-hidden="true" />
        <p className="text-xs uppercase text-gray-400">{EMPTY_LINKS_MESSAGE}</p>
      </div>
    </Card>
  )
}
