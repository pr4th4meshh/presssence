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
  const profile = metadata?.[platform] as SocialProfile | undefined

  const renderPlatformCard = () => {
    switch (platform) {
      case "github":
        return (
          <>
            {profile?.username && (
              <p className="text-sm mt-2 text-center">{profile?.username} </p>
            )}
            {profile?.displayName && (
              <p className="text-sm mt-1 text-center">{profile.displayName}</p>
            )}
            {profile?.bio && (
              <p className="text-xs text-gray-500 mt-1">{profile.bio}</p>
            )}
            {typeof profile?.followers === "number" && (
              <p className="text-xs text-gray-500">
                {profile.followers} followers
              </p>
            )}
          </>
        )

      case "spotify":
        return (
          <>
            {profile?.username && (
              <p className="text-sm mt-2 text-center">{profile?.username} </p>
            )}
            {profile?.displayName && (
              <p className="text-sm mt-1 text-center">{profile.displayName}</p>
            )}
            {typeof profile?.followers === "number" && (
              <p className="text-xs text-gray-500">
                {profile.followers === 1
                  ? "1 follower"
                  : profile.followers === 0
                  ? "No followers"
                  : `${profile.followers} followers`}
              </p>
            )}
          </>
        )

      default:
        return (
          <>
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.displayName || "User Avatar"}
                className="w-10 h-10 rounded-full mt-2"
              />
            )}
            {profile?.displayName && (
              <p className="text-sm mt-1 text-center">{profile.displayName}</p>
            )}
          </>
        )
    }
  }

  return (
    <div className="flex flex-col justify-center items-center border dark:border-light border-dark rounded-3xl p-4 h-[75px] sm:h-[150px] sm:w-[150px] w-[75px]">
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <span className="flex items-center justify-center dark:text-white text-black">
          {React.createElement(icon, { className: "text-3xl sm:text-5xl" })}
        </span>
      </Link>

      {renderPlatformCard()}
    </div>
  )
}

export default SocialMediaCard
