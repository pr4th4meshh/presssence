import { cn } from "@/lib/utils"
import React from "react"

const PrimaryButton = ({
  title,
  onClick,
  icon,
  className,
  disabled,
  type
}: {
  title: string
  onClick?: () => void
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full border border-neutral-600 text-black bg-white transition duration-200 flex justify-center items-center disabled:opacity-50",
        className
      )}
      disabled={disabled}
      type={type}
    >
      {icon}
      {title}
    </button>
  )
}

export default PrimaryButton
