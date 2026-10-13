import logo from '../assets/logo.svg'
import { CreateLinkForm } from '../components/create-link-form'
import { LinkList } from '../components/link-list'

export function HomePage() {
  return (
    <main className="min-h-dvh bg-gray-200 px-3 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
        <img src={logo} alt="Brev.ly" className="h-8" />
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
          <CreateLinkForm />
          <LinkList />
        </div>
      </div>
    </main>
  )
}
