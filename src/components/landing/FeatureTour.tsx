"use client"

import { useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, FileText, Sparkles } from "lucide-react"
import { LogoMark } from "@/components/Logo"
import Avatar from "./Avatar"
import type { LandingDemo } from "./types"

type FeatureId = "edit" | "chat" | "import" | "themes" | "share"

const FEATURES: Array<{ id: FeatureId; title: string; body: string }> = [
  { id: "edit", title: "Edit in place", body: "Click any text on your page and type. It saves as you go, with no dashboard in between." },
  { id: "chat", title: "Ask-me chat", body: "Visitors ask questions about your work and get answers drawn from your portfolio." },
  { id: "import", title: "Résumé import", body: "Drop in a PDF and your skills, projects and roles fill themselves in." },
  { id: "themes", title: "Four themes", body: "Switch the whole page's look in one click, as often as you like." },
  { id: "share", title: "Link previews", body: "Your link shows your name, role and photo wherever you paste it." },
]

const THEMES = [
  { id: "modern", label: "Modern", bg: "#f5f5f5" },
  { id: "creative", label: "Creative", bg: "#f2ebff" },
  { id: "professional", label: "Pro", bg: "#e8f0fa" },
  { id: "bold", label: "Bold", bg: "#e8f9f4" },
]

/** "Skribbl Clone — Real-time Drawing Game" → "Skribbl Clone" */
const shortTitle = (title: string) => title.split(/\s[—–-]\s|:\s/)[0]

/** Cuts at a word boundary so the sample answer stays short. */
function clip(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, text.lastIndexOf(" ", max)).replace(/[,.;:]$/, "") + "…"
}

/** The sample portfolio, with one feature acted out on top of it. */
function Preview({ demo, feature }: { demo: LandingDemo; feature: FeatureId }) {
  const [theme, setTheme] = useState(THEMES[1])
  const bg = feature === "themes" ? theme.bg : "#ffffff"
  const skills = demo.skills.slice(0, 6)
  const project = demo.projects[0]

  if (feature === "share") {
    return (
      <div className="flex h-full flex-col justify-end gap-3 bg-[#fafafa] p-5 sm:p-8">
        <div className="flex items-end gap-2.5">
          <span className="h-8 w-8 shrink-0 rounded-full bg-neutral-300" aria-hidden />
          <p className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-sm text-black ring-1 ring-neutral-200">
            Are you still looking? Send me your work.
          </p>
        </div>
        <div className="ml-auto w-full max-w-[340px]">
          <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-black px-3.5 py-2 text-sm text-white">
            presssence.me/{demo.username}
          </p>
          <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex h-28 items-center gap-4 bg-[#f5f5f5] px-5">
              <Avatar name={demo.fullName} photo={demo.photo} size={56} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-[-0.01em] text-black">{demo.fullName}</p>
                <p className="truncate text-sm text-neutral-500">{demo.profession}</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-black">{demo.fullName}&apos;s portfolio</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{demo.headline}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                <LogoMark className="h-3.5 w-3.5" />
                presssence.me
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full p-5 transition-colors duration-500 sm:p-8" style={{ background: bg }}>
      <div className="flex items-center gap-4">
        <Avatar name={demo.fullName} photo={demo.photo} size={52} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-[-0.02em] text-black">{demo.fullName}</p>
          <p className="truncate text-sm text-neutral-500">{demo.profession}</p>
        </div>
      </div>

      <div className="relative mt-4">
        <p
          className={`line-clamp-2 rounded-md text-[15px] leading-relaxed text-neutral-700 ${
            feature === "edit" ? "-mx-2 -my-1 px-2 py-1 outline-dashed outline-1 outline-black" : ""
          }`}
        >
          {demo.headline}
          {feature === "edit" && (
            <span aria-hidden className="ml-px inline-block h-4 w-px translate-y-0.5 animate-[blink_1s_steps(1)_infinite] bg-black" />
          )}
        </p>
        {feature === "edit" && (
          <span className="absolute -top-7 right-0 flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs text-white">
            <Check className="h-3 w-3" aria-hidden />
            Saved
          </span>
        )}
      </div>

      <div className="mt-6">
        {feature === "import" && (
          <p className="mb-2.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Filled in from resume.pdf
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <motion.span
              key={`${feature}-${skill}`}
              initial={feature === "import" ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature === "import" ? 0.08 * i : 0 }}
              className={`rounded-full px-2.5 py-1 text-xs ${
                feature === "import" ? "bg-black text-white" : "border border-neutral-300 bg-white/70 text-neutral-700"
              }`}
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      {feature === "themes" && (
        <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Preview a theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme.id === t.id}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                theme.id === t.id ? "border-black text-black" : "border-neutral-300 text-neutral-500 hover:text-black"
              }`}
            >
              <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: t.bg }} aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {project && (
        // On phones the preview is shorter, so the theme picker takes this spot.
        <div className={`mt-6 rounded-xl border border-neutral-200 bg-white/80 p-4 ${feature === "themes" ? "hidden sm:block" : ""}`}>
          <p className="text-sm font-semibold text-black">{project.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">{project.description}</p>
        </div>
      )}


      {feature === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-4 bottom-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[300px]"
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-black">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Ask about {demo.fullName.split(" ")[0]}
          </p>
          <p className="ml-auto mt-3 w-fit max-w-[85%] rounded-2xl rounded-br-md bg-neutral-100 px-3 py-2 text-[13px] text-black">
            What has {demo.fullName.split(" ")[0]} built recently?
          </p>
          <p className="mt-2 max-w-[92%] rounded-2xl rounded-bl-md bg-black px-3 py-2 text-[13px] leading-relaxed text-white">
            {project ? `Most recently, ${shortTitle(project.title)}. ${clip(project.description, 90)}` : "Ask me anything about my work."}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default function FeatureTour({ demo }: { demo: LandingDemo }) {
  const [active, setActive] = useState<FeatureId>("edit")
  const reduce = useReducedMotion()
  const id = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + FEATURES.length) % FEATURES.length
    setActive(FEATURES[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="bg-[#f5f5f5] px-4 pb-24 sm:pb-32" aria-labelledby="tour-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="tour-heading" className="max-w-4xl text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.04em] text-black sm:text-[3.25rem]">
          A page that does more than sit there.
        </h2>

        <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div role="tablist" aria-orientation="vertical" aria-label="Features" className="flex flex-col">
            {FEATURES.map((f, i) => {
              const selected = f.id === active
              return (
                <button
                  key={f.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${f.id}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(f.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`group border-t border-neutral-300 py-4 text-left transition-colors last:border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black sm:py-5 ${
                    selected ? "" : "hover:bg-black/[0.02]"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span
                      className={`text-[19px] font-semibold tracking-[-0.02em] transition-colors sm:text-[21px] ${
                        selected ? "text-black" : "text-neutral-400 group-hover:text-neutral-600"
                      }`}
                    >
                      {f.title}
                    </span>
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full bg-black transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
                    />
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-1.5 text-[15px] leading-relaxed text-neutral-500">{f.body}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            className="order-first overflow-hidden rounded-3xl border border-neutral-200 bg-white lg:order-none"
          >
            <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              </span>
              <span className="mx-auto truncate rounded-md bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                {active === "share" ? "Messages" : `presssence.me/${demo.username}`}
              </span>
            </div>
            <div className="relative h-[360px] sm:h-[420px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0"
                >
                  <Preview demo={demo} feature={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
