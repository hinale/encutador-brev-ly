import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  children?: ReactNode
}

export function PageShell({ title, children }: PageShellProps) {
  return (
    <main className="min-h-dvh bg-gray-200 px-5 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-600">{title}</h1>
        {children}
      </div>
    </main>
  )
}
