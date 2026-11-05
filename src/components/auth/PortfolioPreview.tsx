import Image from "next/image"
import { getInitials } from "@/utils/getInitials"

interface PortfolioPreviewProps {
  username: string
  name: string
  profession?: string
  headline?: string
  photo?: string
  skills?: string[]
  projects?: Array<{ title: string; description: string }>
  /** Unfilled fields render as grey bars instead of text. */
  draft?: boolean
}

function Bar({ className }: { className: string }) {
  return <span aria-hidden className={`block rounded-full bg-neutral-100 ${className}`} />
}

/** A scaled-down portfolio page in a browser frame. */
export default function PortfolioPreview({
  username,
  name,
  profession,
  headline,
  photo,
  skills = [],
  projects = [],
  draft = false,
}: PortfolioPreviewProps) {
  return (
    <div className="w-full max-w-[30rem] overflow-hidden rounded-2xl border border-neutral-200 bg-[#fafafa] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
          presssence.me/<span className="text-neutral-900">{username}</span>
        </span>
      </div>

      <div className="px-7 pb-8 pt-9">
        <div className="flex items-center gap-4">
          {photo ? (
            <Image
              src={photo}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-white">
              {name ? getInitials(name) : ""}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold tracking-tight text-neutral-900">
              {name || "Your name"}
            </p>
            {profession ? (
              <p className="truncate text-sm text-neutral-500">{profession}</p>
            ) : (
              draft && <Bar className="mt-2 h-3 w-28" />
            )}
          </div>
        </div>

        {headline ? (
          <p className="mt-6 line-clamp-3 text-sm leading-relaxed text-neutral-600">{headline}</p>
        ) : (
          draft && (
            <div className="mt-6 space-y-2">
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
            </div>
          )
        )}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {skills.length > 0
            ? skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700"
                >
                  {skill}
                </span>
              ))
            : draft &&
              ["w-14", "w-20", "w-16", "w-12"].map((w) => (
                <Bar key={w} className={`h-6 ${w} border border-neutral-200 bg-white`} />
              ))}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {projects.length > 0
            ? projects.slice(0, 2).map((project) => (
                <div key={project.title} className="rounded-xl border border-neutral-200 bg-white p-3.5">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-900">{project.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                    {project.description}
                  </p>
                </div>
              ))
            : [0, 1].map((i) => (
                <div key={i} aria-hidden className="rounded-xl border border-neutral-200 bg-white p-3">
                  <span className="block h-14 rounded-lg bg-neutral-100" />
                  <Bar className="mt-3 h-2.5 w-3/4" />
                  <Bar className="mt-2 h-2.5 w-1/2" />
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
