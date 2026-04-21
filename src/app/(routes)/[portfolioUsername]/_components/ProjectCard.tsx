import React from "react"
import Image from "next/image"
import { FiExternalLink, FiCalendar } from "react-icons/fi"
import Link from "next/link"
import ProjectThumbnail from "../../../../../public/project_thumbnail.jpg"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

const ProjectCard = ({ project }: { project: IProject }) => {
  return (
    <div className="project-card-bg group relative bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Cover Image */}
      <div className="relative overflow-hidden h-[200px]">
        <Image
          src={project.coverImage || ProjectThumbnail}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="project-card-title font-semibold dark:text-white text-gray-900 text-base mb-2 line-clamp-1">
          {project.title}
        </h3>
        <p className="project-card-desc text-sm dark:text-gray-400 text-gray-600 line-clamp-2 leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="mt-4 pt-4 border-t dark:border-neutral-800 border-gray-100 flex items-center justify-between">
          {project.timeline && (
            <span className="project-card-date flex items-center gap-1.5 text-xs dark:text-gray-500 text-gray-400">
              <FiCalendar className="text-xs flex-shrink-0" />
              {new Date(project.timeline).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
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
      </div>
    </div>
  )
}

export default ProjectCard
