"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { motion } from "framer-motion"
import { FiArrowRight } from "react-icons/fi"

const NoPortfolioScreen = () => {
  const params = useParams()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-center max-w-lg"
      >
        {/* Available badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          This URL is available
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-3xl sm:text-5xl font-bold text-foreground mb-3"
        >
          <span className="dark:text-gray-400 text-gray-500 font-normal text-2xl sm:text-3xl block mb-2">
            presssence.me/
          </span>
          {params.portfolioUsername}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-muted-foreground text-base mb-8"
        >
          This portfolio hasn&apos;t been claimed yet. Sign up now to make it yours!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Claim this URL
            <FiArrowRight className="text-sm" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NoPortfolioScreen
