"use client"
import React, { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

const Navbar = () => {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="flex items-center justify-center">
        <div
          className={`flex items-center gap-4 sm:gap-6 px-5 sm:px-7 py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? "bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.04]"
              : "bg-white/30 border border-white/50 backdrop-blur-md shadow-sm shadow-black/[0.03]"
          }`}
        >
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-neutral-900"
          >
            Presssence
          </Link>

          <div className="w-px h-4 bg-black/10" />

          {status === "loading" ? (
            <div className="w-24 h-7 rounded-full bg-neutral-200 animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/me"
                className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 sm:text-sm"
              >
                My portfolio
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 sm:text-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
