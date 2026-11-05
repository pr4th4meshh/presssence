"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Logo } from "@/components/Logo"
import HowItWorks from "@/components/landing/HowItWorks"
import FeatureTour from "@/components/landing/FeatureTour"
import ClaimUrl from "@/components/landing/ClaimUrl"
import type { LandingDemo } from "@/components/landing/types"

export default function LandingSections({ demo }: { demo: LandingDemo }) {
  const { status } = useSession()
  const signedIn = status === "authenticated"

  return (
    <>
      <HowItWorks demo={demo} />
      <FeatureTour demo={demo} />
      <ClaimUrl />

      <footer className="border-t border-neutral-200 bg-[#f5f5f5] px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 text-sm text-neutral-500 sm:flex-row">
          <span className="flex items-center gap-3">
            <Logo markClassName="h-6 w-6" wordmarkClassName="text-base" />
            <span>© {new Date().getFullYear()}</span>
          </span>
          <nav className="flex items-center gap-5">
            {signedIn ? (
              <Link href="/settings" className="hover:text-neutral-900">
                Settings
              </Link>
            ) : (
              <Link href="/auth/login" className="hover:text-neutral-900">
                Sign in
              </Link>
            )}
            <a
              href="https://github.com/pr4th4meshh/presssence"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </>
  )
}
