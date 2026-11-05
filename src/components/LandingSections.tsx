"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { FileText, LayoutTemplate, MessageSquareText, Palette, PenLine, Share2 } from "lucide-react"

const STEPS = [
  {
    title: "Sign up and pick your URL",
    body: "Claim presssence.me/yourname in a few seconds with Google or email.",
  },
  {
    title: "Import your resume",
    body: "Upload a PDF and we fill in your skills, projects and experience for you to review.",
  },
  {
    title: "Share one link",
    body: "Edit anything in place, then send the link to recruiters, clients or anyone else.",
  },
]

const FEATURES = [
  { icon: FileText, title: "Resume import", body: "Turn a PDF into a full portfolio draft." },
  { icon: MessageSquareText, title: "Ask-me chat", body: "Visitors ask questions and get answers from your portfolio." },
  { icon: Palette, title: "Four themes", body: "Switch looks in one click, any time." },
  { icon: LayoutTemplate, title: "Edit in place", body: "Click any field on your page to change it." },
  { icon: PenLine, title: "Built-in blog", body: "Publish posts alongside your work." },
  { icon: Share2, title: "Share anywhere", body: "Rich link previews with your name and photo." },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

export default function LandingSections() {
  const { status } = useSession()
  const signedIn = status === "authenticated"

  return (
    <>
      <section className="bg-[#f5f5f5] px-4 py-20 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto max-w-4xl"
        >
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-neutral-400">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Live in three steps.
            </h2>
          </motion.div>

          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                variants={fadeUp}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{step.body}</p>
              </motion.li>
            ))}
          </ol>

          <motion.ul
            variants={fadeUp}
            className="mt-16 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-neutral-200">
                  <Icon className="h-4 w-4 text-neutral-700" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-0.5 text-sm text-neutral-500">{body}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      <section className="bg-[#f5f5f5] px-4 pb-20 sm:pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-neutral-900 px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Your portfolio, live today.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-400">
            Free to use. No design or code skills needed.
          </p>
          <Link
            href={signedIn ? "/me" : "/auth/signup"}
            className="mt-8 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            {signedIn ? "Go to your portfolio →" : "Create your Presssence →"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-[#f5f5f5] px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 text-sm text-neutral-500 sm:flex-row">
          <span>
            <span className="font-semibold text-neutral-900">Presssence</span> · © {new Date().getFullYear()}
          </span>
          <nav className="flex items-center gap-5">
            {signedIn ? (
              <Link href="/settings" className="hover:text-neutral-900">
                Settings
              </Link>
            ) : (
              <Link href="/auth/login" className="hover:text-neutral-900">
                Sign in
              </Link>
            )}
            <a
              href="https://github.com/pr4th4meshh/presssence"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </>
  )
}
