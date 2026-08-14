"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import Image from "next/image"

interface ScrollToDemoProps {
  username: string
  fullName: string
  photo: string
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Scroll affordance for the hero, shaped as a preview of the portfolio below.
 *
 * A bare chevron says "there is more"; showing the actual avatar and URL says
 * what the more *is*, which is the thing a first-time visitor needs to
 * understand about the product.
 */
export default function ScrollToDemo({ username, fullName, photo }: ScrollToDemoProps) {
  return (
    <a
      href="#demo"
      aria-label={`See ${fullName}'s live Presssence portfolio`}
      className="group inline-flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full bg-white/90 py-1.5 pl-1.5 pr-3 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.18)] ring-1 ring-neutral-200/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.28)] hover:ring-neutral-300 sm:gap-3 sm:pr-4"
    >
      <span className="relative shrink-0">
        {photo ? (
          <Image
            src={photo}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
            unoptimized
          />
        ) : (
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white sm:h-9 sm:w-9"
          >
            {initialsOf(fullName)}
          </span>
        )}
        {/* Signals the destination is a real, live page rather than a mockup. */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </span>
      </span>

      <span className="min-w-0 text-left">
        <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400 sm:text-[10px]">
          See a real one
        </span>
        <span className="block truncate text-xs font-medium text-neutral-800 sm:text-sm">
          presssence.me/<span className="text-neutral-500">{username}</span>
        </span>
      </span>

      <motion.span
        aria-hidden
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="ml-0.5 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-500"
      >
        <ChevronDown className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </motion.span>
    </a>
  )
}
