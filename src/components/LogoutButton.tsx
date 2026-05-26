"use client"
import { signOut } from "next-auth/react"
import React from "react"
import PrimaryButton from "./ui/primary-button"
import { LogOut } from "lucide-react"
import { Button } from "./ui/button"

const LogoutButton = ({ className, iconOnly }: { className?: string, iconOnly?: boolean }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }
  return (
    <Button
      className={`font-medium z-10 ${className}`}
      variant="destructive"
      onClick={handleLogout}
    >
      {iconOnly ? <LogOut /> : "Logout"}
    </Button>
  )
}

export default LogoutButton
