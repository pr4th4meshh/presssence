import Link from "next/link"
import React from "react"

const CTAComponent = () => {
  return (
    <Link href="/">
      <div className="absolute sm:fixed transform rotate-90 dark:text-black dark:bg-white bg-black text-white origin-top-right top-[350px] z-50 right-0 py-1 px-2 sm:px-4 rounded-b-lg sm:py-1 text-sm sm:text-lg tracking-wide border-t-0">
        Create your Presssence
      </div>
    </Link>
  )
}

export default CTAComponent
