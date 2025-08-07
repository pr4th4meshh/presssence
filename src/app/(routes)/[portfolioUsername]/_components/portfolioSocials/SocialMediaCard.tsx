import React from "react"
import Link from "next/link"
import { GlareCard } from "@/components/ui/glare-card"

interface SocialMediaCardProps {
  platform: string
  url: string
  icon: React.ElementType
}

const SocialMediaCard: React.FC<SocialMediaCardProps> = ({ url, icon }) => (
  <div className="flex justify-center">
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <GlareCard className="flex flex-col justify-center items-center dark:bg-black-900 bg-black-500">
        <span className="flex items-center justify-center dark:text-white text-black">
          {React.createElement(icon, { className: "text-3xl sm:text-5xl" })}
        </span>
      </GlareCard>
    </Link>
  </div>
)

export default SocialMediaCard