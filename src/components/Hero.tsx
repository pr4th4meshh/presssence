"use client"
import { FlipWords } from "./ui/flip-words"
import BorderStyleButton from "./ui/border-button"
import { IoLogoGithub, IoLogoLinkedin, IoLogoTwitter } from "react-icons/io"
import { FloatingDock } from "./ui/floating-dock"
import { FaUpwork } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "./Navbar"
import { useEffect, useRef, useState } from "react"
import { BiGlobe } from "react-icons/bi"
import { motion } from "framer-motion"
import ScrollToDemo from "./ScrollToDemo"

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

interface HeroProps {
  demoProfile?: { username: string; fullName: string; photo: string }
}

export default function Hero({ demoProfile }: HeroProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const words = ["quick", "modern", "standout", "beautiful"]

  const links = [
    {
      title: "GitHub",
      icon: <IoLogoGithub className="h-full w-full text-neutral-500" />,
      href: "https://github.com/pr4th4meshh/presssence",
    },
    {
      title: "X (Twitter)",
      icon: <IoLogoTwitter className="h-full w-full text-neutral-500" />,
      href: "https://x.com/pr4th4meshh",
    },
    {
      title: "LinkedIn",
      icon: <IoLogoLinkedin className="h-full w-full text-neutral-500" />,
      href: "https://www.linkedin.com/in/prathamesh-asolkar",
    },
    {
      title: "Upwork",
      icon: <FaUpwork className="h-full w-full text-neutral-500" />,
      href: "https://www.upwork.com/freelancers/~01d3757453c315801b?mp_source=share",
    },
    {
      title: "Website",
      icon: <BiGlobe className="h-full w-full text-neutral-500" />,
      href: "https://p4-portfolio.vercel.app/",
    },
  ]

  const { data: clientSession, status } = useSession()

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/user?username=${userId}`)
      if (!response.ok) return
      const data = await response.json()
      if (data) setUser(data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    if (status === "authenticated" && clientSession?.user?.id) {
      fetchUser(clientSession.user.id)
    }
  }, [status, clientSession?.user?.id])

  // The social links belong to the hero; past it they'd sit on top of the
  // sections below, so they fade out once most of the hero has scrolled away.
  const heroRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  // Starts true so the dock is there on first paint instead of fading in.
  const [heroVisible, setHeroVisible] = useState(true)
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.35,
    })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    // Keeps the hidden links out of the tab order (React 18 has no inert prop).
    dockRef.current?.toggleAttribute("inert", !heroVisible)
  }, [heroVisible])

  const handleCreatePortfolio = () => {
    // /me resolves to the portfolio or onboarding on the server.
    router.push(status === "authenticated" ? "/me" : "/auth/signup")
  }

  const dockState = heroVisible ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-3 opacity-0"

  return (
    <>
      <div ref={heroRef} className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <Navbar />

        {/* ── Hero content ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {/* Attribution */}
            <motion.p
              variants={fadeUp}
              className="text-xs text-neutral-400 tracking-widest uppercase mb-10"
            >
              Built with ❤️ by{" "}
              <a
                href="https://github.com/pr4th4meshh"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
              >
                @pr4th4meshh
              </a>
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-bold tracking-tight leading-[0.92] mb-6"
            >
              <span className="block text-6xl sm:text-8xl text-neutral-900">
                No Portfolio?
              </span>
              <span className="block text-6xl sm:text-8xl text-neutral-300">
                No Problem.
              </span>
            </motion.h1>

            {/* Subtitle + FlipWords */}
            <motion.div
              variants={fadeUp}
              className="text-lg sm:text-xl text-neutral-500 leading-relaxed"
            >
              Build a{" "}
              <FlipWords
                words={words}
                className="text-neutral-800 font-semibold px-0"
              />
              portfolio in just a few clicks.
            </motion.div>

            {/* URL hint */}
            <motion.p
              variants={fadeUp}
              className="text-sm text-neutral-400 mt-3 mb-10"
            >
              Live at{" "}
              <span className="font-medium text-neutral-600">
                presssence.me/yourname
              </span>
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp}>
              <BorderStyleButton
                title={
                  user?.portfolio
                    ? "Go to your Presssence →"
                    : "Create your Presssence →"
                }
                onClick={handleCreatePortfolio}
                className="w-[270px] text-lg"
              />
            </motion.div>

            {/* Without this the hero fills the viewport and nothing signals
                there is a live example below it. */}
            {demoProfile && (
              <motion.div variants={fadeUp} className="mt-12 sm:mt-14">
                <ScrollToDemo {...demoProfile} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div ref={dockRef} aria-hidden={!heroVisible}>
        <FloatingDock
          desktopClassName={`fixed bottom-10 right-10 z-40 transition-[opacity,transform] duration-300 ${dockState}`}
          mobileClassName={`fixed bottom-10 right-10 z-40 transition-[opacity,transform] duration-300 ${dockState}`}
          items={links}
        />
      </div>

    </>
  )
}
