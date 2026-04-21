"use client"
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { FiArrowLeft } from "react-icons/fi"

const PageHeader = () => {
  const { data: session } = useSession()
  const params = useParams()

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-semibold text-foreground">presssence.me</span>
        </Link>

        {/* <div className="flex items-center gap-3">
          {session && (
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              My portfolio
            </Link>
          )}
          <AnimatedThemeToggler />
        </div> */}
      </div>
    </div>
  )
}

export default PageHeader
