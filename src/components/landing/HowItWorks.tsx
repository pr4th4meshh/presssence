"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { Check, FileText } from "lucide-react"
import { LogoMark } from "@/components/Logo"
import Avatar from "./Avatar"
import type { LandingDemo } from "./types"

/** Types the username out once, the first time the strip scrolls into view. */
function useTypedText(text: string, start: boolean) {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    if (reduce) return setCount(text.length)
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) clearInterval(timer)
    }, 85)
    return () => clearInterval(timer)
  }, [start, text, reduce])
  return { typed: text.slice(0, count), done: count >= text.length }
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: number
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <li className="flex flex-col">
      <div className="flex h-56 items-center justify-center border-b border-neutral-200 bg-[#fafafa] px-6 sm:h-60">
        {children}
      </div>
      <div className="flex gap-4 p-6 sm:p-7">
        <span className="pt-px text-sm font-medium tabular-nums text-neutral-400">{n}</span>
        <div>
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-black">{title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-500">{body}</p>
        </div>
      </div>
    </li>
  )
}

export default function HowItWorks({ demo }: { demo: LandingDemo }) {
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, margin: "-120px" })
  const { typed, done } = useTypedText(demo.username, inView)
  const skills = demo.skills.slice(0, 4)

  return (
    <section className="bg-[#f5f5f5] px-4 pb-24 pt-8 sm:pb-32" aria-labelledby="how-heading">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <h2 id="how-heading" className="text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.04em] text-black sm:text-[3.25rem]">
            Sign up, import, share.
          </h2>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-neutral-500">
            No templates to fill in from scratch. Your résumé does most of the work, and you fix
            the rest right on the page.
          </p>
        </div>

        <ol
          ref={ref}
          className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-white md:grid-cols-3 md:divide-x md:divide-neutral-200 [&>li+li]:border-t [&>li+li]:border-neutral-200 md:[&>li+li]:border-t-0"
        >
          <Step n={1} title="Claim your link" body="Pick the name people will type. You can change it later in settings.">
            <div className="w-full max-w-[260px]">
              <div className="flex h-12 items-center rounded-xl border border-neutral-300 bg-white px-3.5 text-[15px] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <span className="text-neutral-400">presssence.me/</span>
                <span className="text-black">{typed}</span>
                <span
                  aria-hidden
                  className={`ml-px inline-block h-5 w-px bg-black ${done ? "animate-[blink_1s_steps(1)_infinite]" : ""}`}
                />
              </div>
              <p
                className={`mt-2.5 flex items-center gap-1.5 text-sm text-black transition-opacity duration-300 ${
                  done ? "opacity-100" : "opacity-0"
                }`}
              >
                <Check className="h-4 w-4" aria-hidden />
                Available
              </p>
            </div>
          </Step>

          <Step n={2} title="Import your résumé" body="Upload a PDF. Skills, projects and experience come out of it for you to check.">
            <div className="flex w-full max-w-[280px] items-center gap-3">
              <div className="flex h-[108px] w-[84px] shrink-0 flex-col rounded-lg border border-neutral-300 bg-white p-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <FileText className="h-4 w-4 text-neutral-500" aria-hidden />
                <div className="mt-2 space-y-1.5">
                  {[100, 80, 92, 64, 86].map((w, i) => (
                    <div key={i} className="h-1 rounded-full bg-neutral-200" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <span className="mt-auto text-[10px] text-neutral-500">resume.pdf</span>
              </div>
              <svg width="28" height="12" viewBox="0 0 28 12" className="shrink-0 text-neutral-300" aria-hidden>
                <path d="M0 6h25m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-xs text-black">
                    {skill}
                  </span>
                ))}
                <span className="rounded-full bg-black px-2.5 py-1 text-xs text-white">
                  {demo.projects.length || 2} projects
                </span>
              </div>
            </div>
          </Step>

          <Step n={3} title="Send one link" body="Paste it into an application, a DM or your bio. It unfurls with your name and photo.">
            <div className="w-full max-w-[270px]">
              <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-black px-3.5 py-2 text-sm text-white">
                Here&apos;s my portfolio
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-neutral-300 bg-white">
                <div className="flex items-center gap-3 border-b border-neutral-200 p-3">
                  <Avatar name={demo.fullName} photo={demo.photo} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black">{demo.fullName}</p>
                    <p className="truncate text-xs text-neutral-500">{demo.profession}</p>
                  </div>
                </div>
                <p className="flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-500">
                  <LogoMark className="h-3.5 w-3.5" />
                  presssence.me/{demo.username}
                </p>
              </div>
            </div>
          </Step>
        </ol>
      </div>
    </section>
  )
}
