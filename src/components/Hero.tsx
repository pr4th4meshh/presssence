"use client"
import { WavyBackground } from "./ui/wavy-background"
import { FlipWords } from "./ui/flip-words"
import BorderStyleButton from "./ui/border-button"
import { IoLogoGithub, IoLogoLinkedin, IoLogoTwitter } from "react-icons/io"
import { FloatingDock } from "./ui/floating-dock"
import { FaUpwork } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "./Navbar"
import { useEffect, useState } from "react"
import { BiGlobe } from "react-icons/bi"
import SignupModal from "./SignupModal"

interface Portfolio {
  username: string
  fullName: string
  profession: string
  headline: string
  theme: string
  features: string[]
  projects: string[]
}
interface User {
  id: string
  name: string
  email: string
  portfolio: Portfolio
  emailVerified: null | boolean
  image: string
}

export default function Hero() {
  const [user, setUser] = useState<User | null>(null)
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false)
  const router = useRouter()
  const words = ["easy", "quick", "beautiful", "modern"]
  const links = [
    {
      title: "GitHub",
      icon: (
        <IoLogoGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/pr4th4meshh/presssence",
    },
    {
      title: "X (former Twitter)",
      icon: (
        <IoLogoTwitter className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://x.com/pr4th4meshh",
    },
    {
      title: "LinkedIn",
      icon: (
        <IoLogoLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/prathamesh-asolkar",
    },
    {
      title: "Upwork",
      icon: (
        <FaUpwork className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.upwork.com/freelancers/~01d3757453c315801b?mp_source=share",
    },
    {
      title: "Website",
      icon: (
        <BiGlobe className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://p4-portfolio.vercel.app/",
    },
  ]

  const session = useSession()
  const fetchUser = async () => {
    try {
      const response = await fetch(
        `/api/user?username=${session?.data?.user?.id}`
      )
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio data.")
      }

      const data = await response.json()
      if (data) {
        setUser(data)
      } else {
        console.error("Portfolio fetch failed:", data.message)
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      console.log("LOADING", false)
    }
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      console.log("useeff trigg")
      fetchUser()
    }
  }, [session.status])

  const handleCreatePortfolio = () => {
    if (session.status === "authenticated") {
      if (user?.portfolio) {
        router.push(`/${user.portfolio.username}`)
      } else {
        router.push("/onboarding")
      }
    } else {
      setShowSignUpPrompt(true)
    }
  }
  return (
    <WavyBackground>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center text-center px-4">
          <h1 className="text-5xl sm:text-7xl text-center font-bold text-gray-900 dark:text-white my-10">
            No Portfolio? No Problem!
          </h1>
          <div className="text-3xl sm:text-6xl font-normal text-center sm:text-start text-white dark:text-neutral-400">
            Build
            <FlipWords className="text-white" words={words} /> <br className="hidden sm:block" />
            portfolio site with just a few clicks
          </div>

          {
            <BorderStyleButton
              title="Create your Presssence"
              onClick={handleCreatePortfolio}
              className="mt-20 w-[300px] flex self-center text-2xl items-center"
            />
          }
        </div>
        <FloatingDock
          desktopClassName="fixed bottom-10 right-10"
          mobileClassName="fixed bottom-10 right-10"
          items={links}
        />
      </div>

      {showSignUpPrompt && (
        <SignupModal signUpPromptState={setShowSignUpPrompt} />
      )}
    </WavyBackground>
  )
}
