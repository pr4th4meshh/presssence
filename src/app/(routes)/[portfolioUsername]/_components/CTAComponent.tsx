"use client"
import Link from "next/link"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiX, FiArrowRight } from "react-icons/fi"

const CTAComponent = () => {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full dark:bg-neutral-900 bg-gray-900 text-white py-2.5 px-4 flex items-center justify-center gap-3 text-sm relative"
        >
          <span className="dark:text-gray-300 text-gray-300 text-center">
            Build your own portfolio like this —{" "}
            <Link
              href="/"
              className="font-semibold text-white underline underline-offset-2 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
            >
              Get started free
            </Link>
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <FiX className="text-sm" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CTAComponent
