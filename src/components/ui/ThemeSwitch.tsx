"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5"
import { Button } from "./button"

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (resolvedTheme === "dark") {
    return (
      <Button
        className=" dark:text-white text-3xl p-2"
        onClick={() => setTheme("light")}
      >
        <IoSunnyOutline />
      </Button>
    )
  }

  if (resolvedTheme === "light") {
    return (
      <Button
        className=" dark:text-white text-3xl p-2"
        onClick={() => setTheme("dark")}
      >
        <IoMoonOutline />
      </Button>
    )
  }
}
