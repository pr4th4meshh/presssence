import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaExternalLinkAlt } from "react-icons/fa"
import EditButton from "./EditButton"
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
  [key: string]: any // for any future platforms
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
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [socialMediaDataViaExternalApi, setSocialMediaDataViaExternalApi] =
    useState<SocialMetadata[]>([])
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData>(
    () => {
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

      const order =
        orderArray.filter((platform: string) => links[platform]) ||
        Object.keys(links)

      return { links, order }
    }
  )

  const { data: session } = useSession()
  const params = useParams()
  const isOwner = session?.user?.id === socialMediaLinksViaPortfolio?.userId

  const fetchSocialMetadata = async (
    platform: string,
    username: string,
    spotifyUserId: string
  ) => {
    try {
      const res = await fetch(
        `/api/socialMediaInfo?platform=${encodeURIComponent(
          platform
        )}&username=${encodeURIComponent(
          username || ""
        )}&spotifyUserId=${encodeURIComponent(spotifyUserId || "")}`
      )
      if (res.ok) {
        const metadata: Omit<SocialMediaData, "platform"> = await res.json()

        setSocialMediaDataViaExternalApi((prev) => {
          const exists = prev.some(
            (item) => item.platform === platform && item.username === username
          )
          return exists ? prev : [...prev, { platform, username, ...metadata }]
        })
      }
    } catch (error) {
      console.error("Error fetching external social media metadata:", error)
    }
  }

  useEffect(() => {
    if (socialMediaData.links) {
      for (const [platform, url] of Object.entries(socialMediaData.links)) {
        if (typeof url === "string" && url.trim()) {
          const username = getUsernameFromUrl(platform, url)
          const spotifyUserId = getSpotifyUserIdFromUrl(url)
          if (username || spotifyUserId) {
            fetchSocialMetadata(
              platform,
              username as string,
              spotifyUserId as string
            )
          }
        }
      }
    }
  }, [socialMediaData.links])

  const handleInputChange = (platform: string, value: string): void => {
    setSocialMediaData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value,
      },
    }))

    const username = getUsernameFromUrl(platform, value)
    const spotifyUserId = getSpotifyUserIdFromUrl(value)
    if (username || spotifyUserId) {
      fetchSocialMetadata(platform, username || "", spotifyUserId || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    const filteredOrder = socialMediaData.order.filter((platform: string) =>
      socialMediaData.links[platform]?.trim()
    )

    const rawLinks = socialMediaData.links as Record<string, string>
    const filteredLinks: Record<string, string> = {}
    for (const [platform, url] of Object.entries(rawLinks)) {
      if (typeof url === "string" && url.trim()) {
        filteredLinks[platform] = url.trim()
      }
    }

    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            socialLinks: filteredLinks,
            socialLinksOrder: filteredOrder,
          }),
        }
      )

      if (response.ok) {
        setIsEditing(false)
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update social media links")
      }
    } catch (error) {
      console.error("Error updating social media links:", error)
      alert("An error occurred while updating the social media links")
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = [...socialMediaArray]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const newOrder = items.map((item) => item.platform)
    setSocialMediaData((prev) => ({
      links: prev.links,
      order: newOrder,
    }))

    if (isOwner) {
      try {
        await fetch(
          `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              socialLinks: socialMediaData.links,
              socialLinksOrder: newOrder,
            }),
          }
        )
      } catch (error) {
        console.error("Error saving new order:", error)
      }
    }
  }

  // Create ordered array of social media items
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

  if (!isEditing && socialMediaArray.length === 0) {
    return null
  }

  return (
    <div className="py-20 container mx-auto px-4">
      <h1 className="pb-4 text-xl uppercase dark:text-light text-dark font-medium">
        socials:
      </h1>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(socialMediaData.links).map((platform) => (
            <SocialMediaInput
              key={platform}
              platform={platform}
              value={socialMediaData.links[platform] || ""}
              handleInputChange={handleInputChange}
            />
          ))}
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="destructive"
              onClick={() => setIsEditing(false)}
              className="bg-red-500 text-white"
            >
              Cancel
            </Button>
            <Button variant="secondary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      ) : socialMediaArray.length > 0 ? (
        <div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="socials" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid sm:grid-cols-5 grid-cols-3 gap-6 sm:gap-4"
                >
                  {socialMediaArray.map(
                    (
                      {
                        platform,
                        url,
                        id,
                      }: { platform: string; url: string; id: string },
                      index: number
                    ) => {
                      const Icon =
                        socialIcons[platform as keyof typeof socialIcons] ||
                        FaExternalLinkAlt

                      const metadata = socialMediaDataViaExternalApi.find(
                        (item) => item.platform === platform
                      )
                      return (
                        <Draggable
                          key={id}
                          draggableId={id}
                          index={index}
                          isDragDisabled={!isOwner}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <SocialMediaCard
                                platform={platform}
                                url={url}
                                icon={Icon}
                                metadata={metadata}
                              />
                            </div>
                          )}
                        </Draggable>
                      )
                    }
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {isOwner && (
            <EditButton
              className="float-right mt-4 sm:mt-0"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
      ) : (
        // Fallback if no socials exist
        isOwner && (
          <div className="text-center">
            <p className="text-gray-500">
              Start by adding socials to your portfolio. <br /> (Only visible to
              you.)
            </p>
          </div>
        )
      )}
    </div>
  )
}

export default PortfolioSocials
