"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen dark:bg-black bg-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold dark:text-white text-gray-900 mb-4 leading-none">
          Oops
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-6" />
        <h1 className="text-2xl font-semibold dark:text-white text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="dark:text-gray-400 text-gray-600 mb-8 text-sm leading-relaxed">
          An unexpected error occurred. Please try again or go back to the
          homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 dark:bg-neutral-900 bg-gray-100 dark:text-white text-gray-900 font-medium rounded-xl hover:opacity-80 transition-opacity text-sm border dark:border-neutral-800 border-gray-200"
          >
            <FiRefreshCw className="text-sm" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 dark:bg-white bg-black dark:text-black text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            <FiArrowLeft className="text-sm" />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
