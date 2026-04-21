"use client"
import { useEffect, useState } from "react"
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5"
import { Button } from "./ui/button"

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  // checking localStorage or default to light mode
  useEffect(() => {
    const savedMode = localStorage.getItem("theme")
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <Button
      onClick={toggleDarkMode}
      className="p-2 rounded-full text-white dark:text-white text-2xl"
    >
      {isDarkMode ? <IoMoonOutline/> : <IoSunnyOutline />}
    </Button>
  )
}
