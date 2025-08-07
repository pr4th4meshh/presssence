"use client"
import ThemeSwitch from "@/components/ui/ThemeSwitch"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import React from "react"

const PageHeader = () => {
  const { resolvedTheme } = useTheme()
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex justify-end items-center">
        <ThemeSwitch />
      </div>
    </div>
  )
}

export default PageHeader
