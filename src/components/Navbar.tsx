"use client"
import React, { useState, useEffect } from "react"
import ThemeSwitch from "./ui/ThemeSwitch"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FiLogOut, FiUser } from "react-icons/fi"
import { Button } from "./ui/button"

const Navbar = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="flex items-center justify-center">
        <div
          className={`flex items-center gap-4 sm:gap-6 border border-white/20 dark:border-neutral-700/60 px-5 sm:px-7 py-3 rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-black/90 backdrop-blur-lg shadow-lg dark:shadow-black/40"
              : "bg-white/10 backdrop-blur-sm"
          }`}
        >
          <Link href="/" className="text-white dark:text-white text-base font-bold tracking-tight">
            Presssence
          </Link>

          <div className="w-px h-4 bg-white/20 dark:bg-neutral-600" />

          {/* <ThemeSwitch /> */}

          {status === "loading" ? (
            <div className="w-16 h-7 rounded-full dark:bg-neutral-800 bg-white/20 animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-white/90 dark:text-gray-200">
                <FiUser className="text-xs opacity-70" />
                {session.user.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-white/80 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors"
              >
                <Button variant="destructive" className="rounded-full">Logout</Button>
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-sm font-medium text-white/90 dark:text-gray-200 hover:text-white transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
