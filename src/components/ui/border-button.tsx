import { cn } from "@/lib/utils"
import React from "react"

interface BorderStyleButtonProps {
  title: string | React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "submit" | "reset" | "button"
}

const BorderStyleButton = ({
  title,
  onClick,
  className,
  disabled,
  type,
}: BorderStyleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none",
        className
      )}
      disabled={disabled}
      type={type}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full dark:bg-black bg-gray-900 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
        {title}
      </span>
    </button>
  )
}

export default BorderStyleButton
