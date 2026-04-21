"use client"
import { WavyBackground } from "./ui/wavy-background"
import { FlipWords } from "./ui/flip-words"
import BorderStyleButton from "./ui/border-button"
import { IoLogoGithub, IoLogoLinkedin, IoLogoTwitter } from "react-icons/io"
import { FloatingDock } from "./ui/floating-dock"
import { FaUpwork, FaRocket, FaCheck } from "react-icons/fa6"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "./Navbar"
import { useEffect, useState, useRef } from "react"
import { BiGlobe } from "react-icons/bi"
import SignupModal from "./SignupModal"
import { motion, useInView } from "framer-motion"
import { FiEdit3, FiShare2, FiZap, FiLayers, FiCode, FiGlobe } from "react-icons/fi"
import { RocketIcon } from "lucide-react"
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
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

// Feature card data
const features = [
  {
    icon: FiEdit3,
    title: "Inline Editing",
    description:
      "Click any text on your portfolio to edit it live. No dashboards, no forms — just click and type.",
  },
  {
    icon: FiLayers,
    title: "Drag & Drop",
    description:
      "Reorder your projects, skills, and social links by dragging them to the right position.",
  },
  {
    icon: FiShare2,
    title: "Custom URL",
    description:
      "Get your own unique URL at presssence.me/yourname and share it with anyone instantly.",
  },
  {
    icon: FiGlobe,
    title: "Social Integration",
    description:
      "Connect GitHub and Spotify to display live follower counts and stats automatically.",
  },
  {
    icon: FiZap,
    title: "Lightning Fast",
    description:
      "Built on Next.js 15 with server-side rendering for blazing fast load times worldwide.",
  },
  {
    icon: FiCode,
    title: "No Code Needed",
    description:
      "Everything is visual. Upload images, write your bio, add links — no coding skills required.",
  },
]

// How it works steps
const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up with Google or email in seconds. No credit card required.",
  },
  {
    number: "02",
    title: "Fill in your details",
    description:
      "Walk through our 5-step onboarding: add your name, skills, projects, and social links.",
  },
  {
    number: "03",
    title: "Share your Presssence",
    description:
      "Your portfolio is live instantly at presssence.me/username. Share it with the world.",
  },
]

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
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
      title: "X (Twitter)",
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

  const handleCreatePortfolio = () => {
    if (status === "authenticated") {
      if (user?.portfolio) {
        router.push(`/${user.portfolio.username}`)
      } else {
        router.push("/onboarding")
      }
    } else {
      setShowSignUpPrompt(true)
    }
  }

  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" })
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" })

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <WavyBackground>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 self-center"
            >
              {/* 🚀 Quick & Easy Portfolio Builder */}
              <p className=" text-sm">
            Built with ❤️ by{" "}
            <a
              href="https://github.com/pr4th4meshh"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              @pr4th4meshh
            </a>
          </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl text-center font-bold text-gray-900 dark:text-white my-4"
            >
              No Portfolio?{" "}
              <span className="text-gray-900 dark:text-white">
                No Problem!
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-3xl sm:text-5xl font-normal text-center text-white dark:text-neutral-300"
            >
              Build
              <FlipWords className="text-white font-semibold" words={words} />{" "}
              <br className="hidden sm:block" />
              portfolio site with just a few clicks
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white/70 text-lg mt-4 max-w-xl mx-auto"
            >
              A full-stack portfolio builder that gives you a live, editable
              portfolio at{" "}
              <span className="text-white font-semibold">
                presssence.me/yourname
              </span>{" "}
              in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <BorderStyleButton
                title={
                  user?.portfolio
                    ? "Go to your Presssence →"
                    : "Create your Presssence →"
                }
                onClick={handleCreatePortfolio}
                className="w-[280px] text-xl"
              />
              {/* <a
                href="https://github.com/pr4th4meshh/presssence"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                <IoLogoGithub className="text-xl" />
                View on GitHub
              </a> */}
            </motion.div>
          </div>

          <FloatingDock
            desktopClassName="fixed bottom-10 right-10"
            mobileClassName="fixed bottom-10 right-10"
            items={links}
          />
        </div>
      </WavyBackground>

      {/* ─── STATS STRIP ─────────────────────────────────────── */}
      {/* <motion.div
        ref={statsRef}
        variants={stagger}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        className="bg-black text-white py-16"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10 px-6 text-center">
          {[
            { label: "Portfolios Created", value: 500, suffix: "+" },
            { label: "Tech Stack Layers", value: 10, suffix: "+" },
            { label: "GitHub Stars", value: 48, suffix: "" },
            { label: "Uptime", value: 99, suffix: "%" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <p className="text-4xl font-bold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div> */}

      {/* ─── FEATURES ────────────────────────────────────────── */}
      {/* <div
        ref={featuresRef}
        className="bg-neutral-950 py-24 px-6"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">
              Features
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Everything you need to shine
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Presssence gives you all the tools to build, manage, and share a
              portfolio that stands out — zero code required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="group relative bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div> */}

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      {/* <div ref={stepsRef} className="bg-black py-24 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={stepsInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">
              How It Works
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Live in 3 simple steps
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden sm:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 -translate-x-1/2" />

            <div className="space-y-12 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  custom={i * 0.1}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4 z-10 shadow-lg shadow-blue-500/25">
                    {step.number}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div> */}

      {/* ─── TECH STACK ──────────────────────────────────────── */}
      {/* <div className="bg-neutral-950 py-16 px-6 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">
            Built with modern technology
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind CSS",
              "MongoDB",
              "Prisma",
              "NextAuth",
              "Firebase",
              "Framer Motion",
              "React Hook Form",
              "Zod",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 text-sm font-medium bg-neutral-900 text-gray-300 border border-neutral-800 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div> */}

      {/* ─── OPEN SOURCE CTA ────────────────────────────────── */}
      {/* <div className="bg-black py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <FaCheck className="text-xs" />
            Free &amp; Open Source
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Your portfolio deserves to be seen
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of developers and creatives who built their online
            presence with Presssence. Takes less than 5 minutes.
          </p>
          <BorderStyleButton
            title={
              user?.portfolio
                ? "Go to your Presssence →"
                : "Get started for free →"
            }
            onClick={handleCreatePortfolio}
            className="w-[280px] text-xl self-center"
          />
        </div>
      </div> */}

      {/* ─── FOOTER ────────────────────────────────────────── */}
      {/* <div className="bg-neutral-950 border-t border-neutral-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Presssence — Built with ❤️ by{" "}
            <a
              href="https://github.com/pr4th4meshh"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              @pr4th4meshh
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pr4th4meshh/presssence"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-white transition-colors text-sm"
            >
              GitHub
            </a>
            <a
              href="https://x.com/pr4th4meshh"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-white transition-colors text-sm"
            >
              Twitter
            </a>
          </div>
        </div>
      </div> */}

      {showSignUpPrompt && (
        <SignupModal signUpPromptState={setShowSignUpPrompt} />
      )}
    </>
  )
}
