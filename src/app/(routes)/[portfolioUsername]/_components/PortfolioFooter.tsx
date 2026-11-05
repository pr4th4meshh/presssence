import Link from "next/link"
import React from "react"
import { LogoMark } from "@/components/Logo"

const PortfolioFooter = () => {
  const currentYear = new Date().getFullYear()
  return (
    <div className="border-t dark:border-neutral-800 border-gray-100 py-8 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 dark:text-gray-500 text-gray-400 text-sm">
        <p className="flex items-center gap-1.5">
          Built with
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-black/80 transition-colors hover:text-black"
          >
            <LogoMark className="h-4 w-4" />
            presssence
          </Link>
        </p>
        <p>© {currentYear}</p>
      </div>
    </div>
  )
}

export default PortfolioFooter
