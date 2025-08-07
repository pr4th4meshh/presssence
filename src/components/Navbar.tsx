"use client"
import React from "react"
import PrimaryButton from "./ui/primary-button"
import ThemeSwitch from "./ui/ThemeSwitch"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const Navbar = () => {
  const router = useRouter()
  const session = useSession()
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-transparent py-4 px-6">
      <div className="flex items-center justify-between mx-auto w-min sm:w-[50vw] border-[#404040] border-2 py-4 sm:py-4 px-6 sm:px-8 rounded-full space-x-6">
        <div>
          <h1 className="text-black dark:text-white text-xl font-bold">
            Presssence
          </h1>
        </div>
        <div className="flex flex-row">
          <ThemeSwitch />
          {session?.data?.user ? (
            <div className="flex items-center space-x-3 ml-3">
              <div className="hidden sm:flex items-center space-x-1">
                <span className="text-lg font-medium flex whitespace-nowrap text-black dark:text-white">
                  Hey, {session.data?.user.name}
                </span>
              </div>
              <PrimaryButton
                className="font-medium"
                title="Logout"
                onClick={handleLogout}
              />
            </div>
          ) : session.status === "loading" ? (
            <span className="text-lg p-2 font-medium dark:text-white text-black">
              Loading..
            </span>
          ) : (
            <PrimaryButton
              title="Sign In"
              onClick={() => router.push("/auth/signup")}
              className="mr-2 min-w-fit"
            />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
