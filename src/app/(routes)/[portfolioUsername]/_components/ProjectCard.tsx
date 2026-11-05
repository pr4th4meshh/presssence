import React from "react"
import Image from "next/image"
import { FiExternalLink, FiCalendar } from "react-icons/fi"
import Link from "next/link"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

/** "2024-06-01" → "Jun 2024"; free text like "2023 – 2024" is shown as-is. */
function formatTimeline(timeline: string): string {
  const date = new Date(timeline)
  if (Number.isNaN(date.getTime())) return timeline
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

/** Stable hue per title, so a project keeps its colour across renders. */
function hueFor(text: string): number {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}

/** Shown when a project has no cover image, instead of a shared stock photo. */
function GeneratedCover({ title }: { title: string }) {
  const hue = hueFor(title)
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 92%), hsl(${(hue + 40) % 360} 65% 82%))`,
      }}
    >
      <span
        className="text-6xl font-bold tracking-tight"
        style={{ color: `hsl(${hue} 45% 35% / 0.55)` }}
      >
        {title.trim().charAt(0).toUpperCase() || "•"}
      </span>
    </div>
  )
}

const ProjectCard = ({ project }: { project: IProject }) => {
  const hasFooter = Boolean(project.timeline || project.link)

  return (
    <div className="project-card-bg group relative bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex h-full flex-col">
      {/* Cover Image */}
      <div className="relative overflow-hidden h-[200px]">
        {project.coverImage ? (
          <>
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </>
        ) : (
          <GeneratedCover title={project.title} />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="project-card-title font-semibold dark:text-white text-gray-900 text-base mb-2 line-clamp-2">
          {project.title}
        </h3>
        <p className="project-card-desc text-sm dark:text-gray-400 text-gray-600 line-clamp-2 leading-relaxed flex-1">
          {project.description}
        </p>

        {hasFooter && (
        <div className="mt-4 pt-4 border-t dark:border-neutral-800 border-gray-100 flex items-center justify-between">
          {project.timeline && (
            <span className="project-card-date flex items-center gap-1.5 text-xs dark:text-gray-500 text-gray-400">
              <FiCalendar className="text-xs flex-shrink-0" />
              {formatTimeline(project.timeline)}
            </span>
          )}

          {project.link && (
            <Link
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="project-card-link inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              View project
              <FiExternalLink className="text-xs" />
            </Link>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
