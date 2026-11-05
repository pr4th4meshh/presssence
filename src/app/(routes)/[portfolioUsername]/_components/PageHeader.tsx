"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

const PageHeader = ({ isOwner = false }: { isOwner?: boolean }) => {
  const { data: session, status } = useSession()

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold text-foreground transition-opacity hover:opacity-70"
        >
          presssence.me
        </Link>

        {status === "authenticated" && session?.user && (
          <div className="flex items-center gap-4 text-sm">
            {isOwner ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                You&apos;re viewing your portfolio
              </span>
            ) : (
              <Link
                href="/me"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                My portfolio
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
