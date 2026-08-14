"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, Github, Globe, Linkedin, Sparkles, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { DemoData } from "@/lib/demoProfile"


const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  twitter: Twitter,
} as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function PresssenceDemoView({ data }: { data: DemoData }) {
  return (
    // scroll-mt clears the fixed navbar (~64px when scrolled) so the section
    // lands below it rather than underneath.
    <section id="demo" className="scroll-mt-20 bg-[#f5f5f5] px-4 py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        className="mx-auto max-w-4xl"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-neutral-400">
            A real Presssence
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            One link. Your whole story.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Answer a few questions and get a live portfolio at your own URL — projects,
            skills, experience, and writing, all in one place.
          </p>
        </motion.div>

        {/* Browser chrome frames this as a preview of a real page rather than
            as another band of the landing page. */}
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-xs text-neutral-400 ring-1 ring-neutral-200">
              presssence.me/<span className="text-neutral-700">{data.username}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {data.photo ? (
                <Image
                  src={data.photo}
                  alt={data.fullName}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-white"
                >
                  {initialsOf(data.fullName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-neutral-900">{data.fullName}</h3>
                <p className="text-sm text-neutral-500">{data.profession}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{data.headline}</p>
                {data.socials.length > 0 && (
                  <div className="mt-3 flex gap-2 text-neutral-400" aria-hidden>
                    {data.socials.map((key) => {
                      const Icon = SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS]
                      return Icon ? (
                        <span
                          key={key}
                          className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-neutral-200"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </div>

            {data.skills.length > 0 && (
              <>
                <Divider label="Skills" />
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {data.projects.length > 0 && (
              <>
                <Divider label="Projects" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.projects.map((project) => (
                    <div
                      key={project.title}
                      className="rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300"
                    >
                      {project.timeline && (
                        <p className="mb-1 text-[10px] uppercase tracking-widest text-neutral-400">
                          {project.timeline}
                        </p>
                      )}
                      {/* Clamped, not truncated: real titles run to ~50 chars
                          and a single ellipsised line loses the useful half. */}
                      <p className="line-clamp-2 font-medium leading-snug text-neutral-900">
                        {project.title}
                      </p>
                      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-neutral-500">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.experience.length > 0 && (
              <>
                <Divider label="Experience" />
                <div className="space-y-1.5">
                  {data.experience.map((job, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm text-neutral-700">
                        <span className="font-medium text-neutral-900">{job.role}</span> ·{" "}
                        {job.company}
                      </p>
                      <span className="shrink-0 text-xs text-neutral-400">{job.period}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Nods to the chat widget that ships on every portfolio. */}
            <div className="mt-8 flex items-center gap-2.5 rounded-xl bg-neutral-900 px-4 py-3 text-white">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-300" />
              <p className="text-sm">
                <span className="font-medium">
                  Ask about {data.fullName.split(" ")[0]}
                </span>
                <span className="ml-1.5 text-neutral-400">
                  — visitors can ask your portfolio questions.
                </span>
              </p>
            </div>
          </div>

          {/* Inside the frame so the CTA reads as part of the page being
              previewed, not as landing-page furniture beneath it. */}
          <Link
            href={`/${data.username}`}
            className="flex items-center justify-center gap-1.5 border-t border-neutral-100 bg-neutral-50 px-4 py-3.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            Visit this profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</span>
      <span className="h-px flex-1 bg-neutral-100" />
    </div>
  )
}
