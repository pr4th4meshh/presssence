import Link from "next/link"

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Right-hand panel on large screens. Hidden on small ones. */
  aside: React.ReactNode
}

export default function AuthShell({ title, subtitle, children, aside }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="w-fit rounded-md text-base font-bold tracking-tight text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f5]"
        >
          Presssence
        </Link>

        <main className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-[2.5rem]">
              {title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-500">{subtitle}</p>
            <div className="mt-9">{children}</div>
          </div>
        </main>
      </div>

      <aside className="hidden p-3 lg:block">
        <div className="sticky top-3 flex h-[calc(100vh-1.5rem)] flex-col items-center justify-center rounded-[28px] border border-neutral-200/80 bg-white px-10">
          {aside}
        </div>
      </aside>
    </div>
  )
}
