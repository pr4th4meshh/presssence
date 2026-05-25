import React from "react"
import Link from "next/link"

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

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({
  url,
  icon,
  metadata,
  platform,
}) => {
  const username = metadata?.username
  const profile = metadata?.[platform] as SocialProfile | undefined
  const displayName = profile?.displayName
  const followers = profile?.followers
  const bio = profile?.bio

  return (
    <div className="flex flex-col items-center border border-border rounded-2xl sm:rounded-3xl p-2 sm:p-4 w-full min-h-[90px] sm:min-h-[150px] transition-colors hover:bg-muted/40">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center mt-1 sm:mt-2"
      >
        <span className="flex items-center justify-center dark:text-white text-black">
          {React.createElement(icon, { className: "text-[1.6rem] sm:text-5xl" })}
        </span>
      </Link>

      <div className="flex flex-col items-center w-full mt-1 sm:mt-2 gap-0.5 overflow-hidden">
        {username && (
          <p className="text-[10px] sm:text-xs font-medium truncate w-full text-center leading-tight">
            @{username}
          </p>
        )}
        {displayName && !username && (
          <p className="text-[10px] sm:text-xs font-medium truncate w-full text-center leading-tight">
            {displayName}
          </p>
        )}
        {platform === "github" && bio && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 text-center leading-tight">
            {bio}
          </p>
        )}
        {typeof followers === "number" && (
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
            {followers === 0
              ? "No followers"
              : followers === 1
              ? "1 follower"
              : `${followers.toLocaleString()} followers`}
          </p>
        )}
      </div>
    </div>
  )
}

export default SocialMediaCard
