import "server-only"
import { cache } from "react"
import { prisma } from "@/lib/prisma"

/** The portfolio shown as the landing-page sample. */
export const DEMO_USERNAME = "pr4th4meshh"

export type DemoData = {
  username: string
  fullName: string
  profession: string
  headline: string
  photo: string
  skills: string[]
  projects: Array<{ title: string; description: string; timeline: string }>
  experience: Array<{ role: string; company: string; period: string }>
  socials: string[]
}

/**
 * Used when the sample portfolio is missing or empty. The landing page must
 * never render a broken or half-filled preview.
 */
const FALLBACK: DemoData = {
  username: DEMO_USERNAME,
  fullName: "Prathamesh Asolkar",
  profession: "Full Stack Developer",
  headline: "I build fast, polished web products — mostly React, TypeScript, and Node.",
  photo: "",
  skills: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "Prisma"],
  projects: [
    {
      title: "Presssence",
      timeline: "2026",
      description: "Portfolio builder with AI resume import and a RAG chatbot.",
    },
    {
      title: "Astrology Consult",
      timeline: "2026",
      description: "React Native app with realtime chat and in-app voice calls.",
    },
  ],
  experience: [{ role: "Software Engineer", company: "Freelance", period: "2024 — Present" }],
  socials: ["github", "linkedin"],
}

/**
 * `cache()` dedupes this across the render pass, so the hero pill and the demo
 * section share one query instead of issuing two.
 */
export const getDemoProfile = cache(async (): Promise<DemoData> => {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { username: DEMO_USERNAME },
      select: {
        username: true,
        fullName: true,
        profession: true,
        headline: true,
        features: true,
        User: { select: { image: true } },
        projects: {
          orderBy: { position: "asc" },
          take: 2,
          select: { title: true, description: true, timeline: true },
        },
        workExperiences: {
          orderBy: { position: "asc" },
          take: 2,
          select: { role: true, company: true, startDate: true, endDate: true },
        },
        socialMedia: { select: { github: true, linkedin: true, website: true, twitter: true } },
      },
    })

    if (!portfolio || portfolio.projects.length === 0) return FALLBACK

    return {
      username: portfolio.username,
      fullName: portfolio.fullName,
      profession: portfolio.profession,
      headline: portfolio.headline || FALLBACK.headline,
      photo: portfolio.User?.image ?? "",
      skills: portfolio.features.slice(0, 8),
      projects: portfolio.projects.map((p) => ({
        title: p.title,
        description: p.description,
        timeline: p.timeline ?? "",
      })),
      experience: portfolio.workExperiences.map((w) => ({
        role: w.role,
        company: w.company,
        period: `${w.startDate} — ${w.endDate || "Present"}`,
      })),
      socials: (["github", "linkedin", "website", "twitter"] as const).filter(
        (key) => portfolio.socialMedia?.[key]
      ),
    }
  } catch {
    // A database hiccup should degrade the sample, not break the landing page.
    return FALLBACK
  }
})
