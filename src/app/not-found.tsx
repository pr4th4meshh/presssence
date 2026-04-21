"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { FiArrowLeft } from "react-icons/fi"

export default function NotFound() {
  return (
    <div className="min-h-screen dark:bg-black bg-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold dark:text-white text-gray-900 mb-4 leading-none">
          404
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6" />
        <h1 className="text-2xl font-semibold dark:text-white text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="dark:text-gray-400 text-gray-600 mb-8 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. It might have been
          moved, deleted, or perhaps it never existed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 dark:bg-white bg-black dark:text-black text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          <FiArrowLeft className="text-base" />
          Back to home
        </Link>
      </motion.div>
    </div>
  )
}
