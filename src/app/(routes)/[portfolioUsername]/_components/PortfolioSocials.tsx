"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaExternalLinkAlt } from "react-icons/fa"
import { FiPlus } from "react-icons/fi"
import { toast } from "sonner"
import SocialMediaInput from "./portfolioSocials/SocialMediaInput"
import SocialMediaCard from "./portfolioSocials/SocialMediaCard"
import { socialIcons } from "./portfolioSocials/SocialMediaIcons"
import { Button } from "@/components/ui/button"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { getUsernameFromUrl } from "@/utils/getUsernameFromUrl"
import { getSpotifyUserIdFromUrl } from "@/utils/getSpotifyUserIdFromUrl"

interface SocialLinks {
  [platform: string]: string
}

interface SocialMediaData {
  links: SocialLinks
  order: string[]
}

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

interface SocialMetadata {
  platform: string
  username?: string
  spotifyUserId?: string
  github?: SocialProfile
  spotifyData?: SocialProfile
  [key: string]: any
}

interface PortfolioSocialsProps {
  socialMediaLinksViaPortfolio: {
    userId: string
    socialMedia?: {
      [platform: string]: string | { order?: string[] }
    }
  }
}

const PortfolioSocials: React.FC<PortfolioSocialsProps> = ({
  socialMediaLinksViaPortfolio,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [socialMediaDataViaExternalApi, setSocialMediaDataViaExternalApi] =
    useState<SocialMetadata[]>([])
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData>(() => {
    const rawLinks = socialMediaLinksViaPortfolio?.socialMedia || {}
    const links: SocialLinks = {}
    for (const [platform, url] of Object.entries(rawLinks)) {
      if (
        typeof url === "string" &&
        url.trim() &&
        !/^https?:\/\/localhost(:\d+)?/i.test(url)
      ) {
        links[platform] = url.trim()
      }
    }
    const orderArray = (
      rawLinks.order && Array.isArray(rawLinks.order) ? rawLinks.order : []
    ) as string[]
    const order = orderArray.filter((p: string) => links[p]) || Object.keys(links)
    return { links, order }
  })

  const { data: session } = useSession()
  const params = useParams()
  const isOwner = session?.user?.id === socialMediaLinksViaPortfolio?.userId

  // Re-sync local state when parent refetches (e.g. after adding via FloatingAddButton)
  useEffect(() => {
    if (isEditing) return
    const rawLinks = socialMediaLinksViaPortfolio?.socialMedia || {}
    const links: SocialLinks = {}
    for (const [platform, url] of Object.entries(rawLinks)) {
      if (typeof url === "string" && url.trim() && !/^https?:\/\/localhost(:\d+)?/i.test(url)) {
        links[platform] = url.trim()
      }
    }
    const orderArray = (rawLinks.order && Array.isArray(rawLinks.order) ? rawLinks.order : []) as string[]
    const order = orderArray.filter((p: string) => links[p]).length
      ? orderArray.filter((p: string) => links[p])
      : Object.keys(links)
    setSocialMediaData({ links, order })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(socialMediaLinksViaPortfolio?.socialMedia)])

  const fetchSocialMetadata = async (platform: string, username: string, spotifyUserId: string) => {
    try {
      const res = await fetch(
        `/api/socialMediaInfo?platform=${encodeURIComponent(platform)}&username=${encodeURIComponent(username || "")}&spotifyUserId=${encodeURIComponent(spotifyUserId || "")}`
      )
      if (res.ok) {
        const metadata = await res.json()
        setSocialMediaDataViaExternalApi((prev) => {
          const exists = prev.some((item) => item.platform === platform && item.username === username)
          return exists ? prev : [...prev, { platform, username, ...metadata }]
        })
      }
    } catch {}
  }

  useEffect(() => {
    if (socialMediaData.links) {
      for (const [platform, url] of Object.entries(socialMediaData.links)) {
        if (typeof url === "string" && url.trim()) {
          const username = getUsernameFromUrl(platform, url)
          const spotifyUserId = getSpotifyUserIdFromUrl(url)
          if (username || spotifyUserId) {
            fetchSocialMetadata(platform, username as string, spotifyUserId as string)
          }
        }
      }
    }
  }, [socialMediaData.links])

  const handleInputChange = (platform: string, value: string) => {
    setSocialMediaData((prev) => ({
      ...prev,
      links: { ...prev.links, [platform]: value },
    }))
    const username = getUsernameFromUrl(platform, value)
    const spotifyUserId = getSpotifyUserIdFromUrl(value)
    if (username || spotifyUserId) {
      fetchSocialMetadata(platform, username || "", spotifyUserId || "")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const filteredOrder = socialMediaData.order.filter((p) => socialMediaData.links[p]?.trim())
    const filteredLinks: Record<string, string> = {}
    for (const [platform, url] of Object.entries(socialMediaData.links)) {
      if (typeof url === "string" && url.trim()) filteredLinks[platform] = url.trim()
    }
    try {
      const res = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socialLinks: filteredLinks, socialLinksOrder: filteredOrder }),
      })
      if (res.ok) {
        setIsEditing(false)
        toast.success("Social links updated")
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to update social links")
      }
    } catch {
      toast.error("An error occurred while updating social links")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const items = [...socialMediaArray]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    const newOrder = items.map((item) => item.platform)
    setSocialMediaData((prev) => ({ links: prev.links, order: newOrder }))
    if (isOwner) {
      try {
        await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ socialLinks: socialMediaData.links, socialLinksOrder: newOrder }),
        })
      } catch {}
    }
  }

  const socialMediaArray: { platform: string; url: string; id: string }[] = (
    socialMediaData.order.length > 0
      ? socialMediaData.order
      : Object.keys(socialMediaData.links)
  )
    .filter((platform) => socialMediaData.links[platform])
    .map((platform) => ({
      platform,
      url: socialMediaData.links[platform],
      id: `social-${platform}`,
    }))

  if (!isOwner && socialMediaArray.length === 0) return null

  return (
    <div className="section-border py-10 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Connect
        </h2>

        {isOwner && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-7 px-3 text-xs"
                >
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Edit links
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(socialMediaData.links).map((platform) => {
            const Icon = socialIcons[platform as keyof typeof socialIcons]
            return (
              <div key={platform} className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/30">
                {Icon && <Icon className="shrink-0 text-base text-muted-foreground" />}
                <input
                  type="url"
                  value={socialMediaData.links[platform] || ""}
                  onChange={(e) => handleInputChange(platform, e.target.value)}
                  placeholder={`${platform} URL`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Cards */}
      {socialMediaArray.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="socials" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {socialMediaArray.map(({ platform, url, id }, index) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons] || FaExternalLinkAlt
                  const metadata = socialMediaDataViaExternalApi.find((item) => item.platform === platform)
                  return (
                    <Draggable
                      key={id}
                      draggableId={id}
                      index={index}
                      isDragDisabled={!isOwner}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-shadow ${snapshot.isDragging ? "shadow-xl rotate-1 scale-[1.02]" : ""} ${isOwner ? "cursor-grab active:cursor-grabbing" : ""}`}
                        >
                          <SocialMediaCard
                            platform={platform}
                            url={url}
                            icon={Icon}
                            metadata={{ platform, username: metadata?.username, ...metadata }}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : isOwner ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <p className="text-sm text-muted-foreground text-center">
            No social links yet. Add some so visitors can find you.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5 text-xs h-7"
          >
            <FiPlus size={12} />
            Add links
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default PortfolioSocials
