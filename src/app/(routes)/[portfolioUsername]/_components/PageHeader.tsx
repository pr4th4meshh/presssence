"use client"
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler"
import React from "react"

const PageHeader = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex justify-end items-center">
        <AnimatedThemeToggler />
      </div>
    </div>
  )
}

export default PageHeader
