"use client"
import { signOut } from "next-auth/react"
import React from "react"
import PrimaryButton from "./ui/primary-button"

const LogoutButton = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }
  return (
    <PrimaryButton
      className="font-medium z-10"
      title="Logout"
      onClick={handleLogout}
    />
  )
}

export default LogoutButton
