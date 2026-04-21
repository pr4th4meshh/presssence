import React from "react"
import DarkModeToggle from "./DarkModeToggle"
import PrimaryButton from "./ui/primary-button"
import Image from "next/image"
import Default_Avatar from "../../public/qp_default_avatar.jpg"
import ThemeSwitch from "./ui/ThemeSwitch"
import { signIn, signOut, useSession } from "next-auth/react"
import SigninWGoogle from "./SigninWGoogle"
import { getAuthSession } from "@/lib/serverAuth"
import Link from "next/link"
import LogoutButton from "./LogoutButton"

interface User {
  id: string
  username: string
}

const ServerNavbar = async () => {
  const session = await getAuthSession()
  //  const handleLogout = () => {
  //     signOut({callbackUrl: '/'})
  //   }

  console.log(session)

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-transparent py-4 px-6 shadow-md">
      <div className="flex items-center justify-between mx-auto w-min sm:w-[50vw] border-[#404040] border-2 py-4 sm:py-4 px-6 sm:px-8 rounded-full space-x-6">
        <div>
          <h1 className="text-black dark:text-white text-xl font-semibold">
            qPortfolio
          </h1>
        </div>
        <div className="flex flex-row">
          <ThemeSwitch />
          {session?.user ? (
            <div className="flex items-center space-x-3 ml-3">
              <div className="hidden sm:flex items-center space-x-1">
                <Image
                  src={
                    session?.user.image ? session?.user.image : Default_Avatar
                  }
                  placeholder="blur"
                  alt="avatar"
                  className="w-[40px] h-[40px] mr-1 rounded-full object-contain"
                  height={50}
                  width={50}
                />
                <span className="text-lg font-medium flex whitespace-nowrap text-black dark:text-white">
                  Hey, {session?.user.name}
                </span>
              </div>
              <LogoutButton />
            </div>
          ) : !session ? (
            <span className="text-lg font-medium dark:text-white text-black">
              Loading..
            </span>
          ) : (
            <>
              <Link href={"/auth/signin"}>
                <PrimaryButton title="Sign in" className="mr-2" />
              </Link>
              <SigninWGoogle />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default ServerNavbar
