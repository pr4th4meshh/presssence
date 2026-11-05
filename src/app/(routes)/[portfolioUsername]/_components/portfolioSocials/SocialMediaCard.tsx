import React from "react"
import Link from "next/link"
import { FiExternalLink } from "react-icons/fi"

interface SocialProfile {
  displayName?: string
  followers?: number
  avatar?: string
  profileUrl?: string
  bio?: string
  following?: number
  name?: string
  username?: string
}

interface Metadata {
  platform: string
  username?: string
  [key: string]: string | SocialProfile | undefined
}

interface SocialMediaCardProps {
  platform: string
  /** Display name, e.g. "GitHub". Falls back to the platform id. */
  label?: string
  url: string
  icon: React.ElementType
  metadata?: Metadata
}

const formatFollowers = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

/**
 * The handle as it appears in the link, so the card never depends on a
 * profile lookup succeeding. Websites show their domain instead.
 */
export function handleFromUrl(platform: string, url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^www\./, "")
  if (platform === "website") return host + (parsed.pathname.length > 1 ? parsed.pathname.replace(/\/$/, "") : "")

  const parts = parsed.pathname.split("/").filter(Boolean).map((p) => decodeURIComponent(p))
  const clean = (value: string | undefined) => (value ? value.replace(/^@/, "") || null : null)

  switch (platform) {
    case "linkedin":
      // linkedin.com/in/name, linkedin.com/company/name
      return clean(parts[0] === "in" || parts[0] === "company" ? parts[1] : parts[0])
    case "youtube":
      // youtube.com/@name, youtube.com/c/name, youtube.com/user/name
      return clean(["c", "user"].includes(parts[0]) ? parts[1] : parts[0]?.startsWith("@") ? parts[0] : undefined)
    case "medium":
      // medium.com/@name or name.medium.com
      if (host.endsWith(".medium.com")) return host.replace(".medium.com", "")
      return clean(parts[0])
    case "spotify":
      // Spotify user ids are random strings; the looked-up display name reads better.
      return null
    default:
      // github.com/name, x.com/name, instagram.com/name, dribbble.com/name, figma.com/@name, ...
      return clean(parts[0])
  }
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ url, icon: Icon, metadata, platform, label }) => {
  const username = metadata?.username
  const profile = metadata?.[platform] as SocialProfile | undefined
  const displayName = profile?.displayName
  const followers = profile?.followers
  const bio = profile?.bio

  const urlHandle = handleFromUrl(platform, url)
  const handle = platform === "website" ? urlHandle : urlHandle || username || displayName

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-3 sm:p-4 rounded-2xl project-card-bg bg-white border border-border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-muted/60 group-hover:bg-primary/10 transition-colors">
        <Icon className="text-lg sm:text-xl text-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="section-label text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
          {label ?? platform}
        </p>
        {handle && (
          <p className="project-card-title text-sm font-semibold text-foreground truncate leading-snug">
            {platform === "website" ? handle : `@${handle}`}
          </p>
        )}
        {typeof followers === "number" && (
          <p className="project-card-date text-[11px] text-muted-foreground leading-tight">
            {followers === 0 ? "No followers" : `${formatFollowers(followers)} followers`}
          </p>
        )}
        {!handle && !followers && bio && (
          <p className="project-card-desc text-xs text-muted-foreground line-clamp-1 leading-snug">
            {bio}
          </p>
        )}
      </div>

      <FiExternalLink className="shrink-0 text-sm text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
    </Link>
  )
}

export default SocialMediaCard
