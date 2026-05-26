import Link from "next/link"
import React from "react"

const PortfolioFooter = () => {
  const currentYear = new Date().getFullYear()
  return (
    <div className="border-t dark:border-neutral-800 border-gray-100 py-8 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 dark:text-gray-500 text-gray-400 text-sm">
        <p>
          Built with{" "}
          <Link
            href="/"
            className=" transition-colors underline underline-offset-2"
          >
            Presssence
          </Link>
        </p>
        <p>© {currentYear}</p>
      </div>
    </div>
  )
}

export default PortfolioFooter
