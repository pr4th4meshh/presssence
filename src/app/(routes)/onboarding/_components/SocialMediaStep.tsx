import { UseFormRegister } from "react-hook-form"
import { FormData } from "@/lib/zod"
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaMedium,
  FaGlobe,
  FaBehance,
  FaFigma,
  FaProjectDiagram,
  FaDribbble,
} from "react-icons/fa"

interface SocialMediaStepProps {
  register: UseFormRegister<FormData>
}

const socialPlatforms = [
  { name: "twitter", icon: FaTwitter },
  { name: "linkedin", icon: FaLinkedin },
  { name: "github", icon: FaGithub },
  { name: "instagram", icon: FaInstagram },
  { name: "youtube", icon: FaYoutube },
  { name: "medium", icon: FaMedium },
  { name: "website", icon: FaGlobe },
  { name: "behance", icon: FaBehance },
  { name: "figma", icon: FaFigma },
  { name: "awwwards", icon: FaProjectDiagram },
  { name: "dribbble", icon: FaDribbble },
]

const socialLinksKeys = [
  "twitter",
  "linkedin",
  "github",
  "instagram",
  "youtube",
  "medium",
  "website",
  "behance",
  "figma",
  "awwwards",
  "dribbble",
] as const

type SocialLinkKey = (typeof socialLinksKeys)[number]

export default function SocialMediaStep({ register }: SocialMediaStepProps) {
  return (
    <div className="space-y-6 h-[30vh] overflow-hidden overflow-y-scroll customFormScrollbar">
      <h2 className="text-lg font-semibold">Add Social Media Links</h2>
      {socialPlatforms.map((platform) => (
        <div key={platform.name} className="space-y-2">
          <span className="flex items-center">
            <platform.icon className="text-xl mr-2" />
            {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
          </span>
          <input
            type="url"
            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter your ${platform.name} link`}
            {...register(
              `socialLinks.${platform.name}` as `socialLinks.${SocialLinkKey}`
            )}
          />
        </div>
      ))}
    </div>
  )
}
