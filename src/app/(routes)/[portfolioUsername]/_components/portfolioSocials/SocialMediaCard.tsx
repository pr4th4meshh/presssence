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
  url: string
  icon: React.ElementType
  metadata?: Metadata
}

const formatFollowers = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ url, icon: Icon, metadata, platform }) => {
  const username = metadata?.username
  const profile = metadata?.[platform] as SocialProfile | undefined
  const displayName = profile?.displayName
  const followers = profile?.followers
  const bio = profile?.bio

  const handle = username || displayName

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
        <p className="section-label text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none mb-0.5 capitalize">
          {platform}
        </p>
        {handle && (
          <p className="project-card-title text-sm font-semibold text-foreground truncate leading-snug">
            @{handle}
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
