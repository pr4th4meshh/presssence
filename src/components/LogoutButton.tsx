"use client"
import { signOut } from "next-auth/react"
import React from "react"
import PrimaryButton from "./ui/primary-button"
import { LogOut } from "lucide-react"

const LogoutButton = ({ className, iconOnly }: { className?: string, iconOnly?: boolean }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }
  return (
    <PrimaryButton
      className={`font-medium z-10 ${className}`}
      title={iconOnly ? <LogOut /> : "Logout"}
      onClick={handleLogout}
    />
  )
}

export default LogoutButton
