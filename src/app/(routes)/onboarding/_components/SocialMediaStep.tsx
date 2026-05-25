"use client"

import { UseFormRegister, UseFormWatch } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { Input } from "@/components/ui/input"
import { useState } from "react"
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
  FaDribbble,
  FaSpotify,
} from "react-icons/fa"
import { SiAwwwards } from "react-icons/si"
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SocialMediaStepProps {
  register: UseFormRegister<FormData>
  watch: UseFormWatch<FormData>
}

const socialLinksKeys = [
  "twitter", "linkedin", "github", "instagram",
  "youtube", "medium", "website", "behance",
  "figma", "awwwards", "dribbble", "spotify",
] as const

type SocialLinkKey = (typeof socialLinksKeys)[number]

const socialPlatforms: {
  name: SocialLinkKey
  label: string
  icon: React.ElementType
  color: string
  placeholder: string
}[] = [
  { name: "github",    label: "GitHub",    icon: FaGithub,    color: "#24292e", placeholder: "https://github.com/username" },
  { name: "linkedin",  label: "LinkedIn",  icon: FaLinkedin,  color: "#0A66C2", placeholder: "https://linkedin.com/in/username" },
  { name: "twitter",   label: "Twitter / X", icon: FaTwitter, color: "#1DA1F2", placeholder: "https://twitter.com/username" },
  { name: "instagram", label: "Instagram", icon: FaInstagram, color: "#E1306C", placeholder: "https://instagram.com/username" },
  { name: "youtube",   label: "YouTube",   icon: FaYoutube,   color: "#FF0000", placeholder: "https://youtube.com/@channel" },
  { name: "dribbble",  label: "Dribbble",  icon: FaDribbble,  color: "#EA4C89", placeholder: "https://dribbble.com/username" },
  { name: "behance",   label: "Behance",   icon: FaBehance,   color: "#1769FF", placeholder: "https://behance.net/username" },
  { name: "figma",     label: "Figma",     icon: FaFigma,     color: "#F24E1E", placeholder: "https://figma.com/@username" },
  { name: "medium",    label: "Medium",    icon: FaMedium,    color: "#000000", placeholder: "https://medium.com/@username" },
  { name: "spotify",   label: "Spotify",   icon: FaSpotify,   color: "#1DB954", placeholder: "https://open.spotify.com/..." },
  { name: "awwwards",  label: "Awwwards",  icon: SiAwwwards,  color: "#F7E011", placeholder: "https://awwwards.com/username" },
  { name: "website",   label: "Website",   icon: FaGlobe,     color: "#6366F1", placeholder: "https://yourwebsite.com" },
]

function PlatformTile({
  platform,
  register,
  value,
}: {
  platform: (typeof socialPlatforms)[number]
  register: UseFormRegister<FormData>
  value: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isFilled = !!(value && value.trim().length > 0)

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${isFilled ? "border-green-500/40 bg-green-500/5" : "border-border bg-background"}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: platform.color }}
        >
          <platform.icon size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{platform.label}</p>
          {isFilled && !expanded && (
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFilled && <CheckCircle2 size={14} className="text-green-500" />}
          {expanded ? (
            <ChevronUp size={14} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-0">
              <Input
                type="url"
                placeholder={platform.placeholder}
                autoFocus
                {...register(`socialLinks.${platform.name}` as `socialLinks.${SocialLinkKey}`)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SocialMediaStep({ register, watch }: SocialMediaStepProps) {
  const values = watch("socialLinks")
  const filledCount = socialPlatforms.filter((p) => {
    const v = values?.[p.name]
    return v && v.trim().length > 0
  }).length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Click any platform to add your profile link
        </p>
        {filledCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
            {filledCount} connected
          </span>
        )}
      </div>

      {/* Platform grid */}
      <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-0.5 customFormScrollbar">
        {socialPlatforms.map((platform) => (
          <PlatformTile
            key={platform.name}
            platform={platform}
            register={register}
            value={values?.[platform.name] ?? ""}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        All links are optional — you can add more later
      </p>
    </div>
  )
}
