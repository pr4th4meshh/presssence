import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaExternalLinkAlt } from "react-icons/fa"
import PrimaryButton from "@/components/ui/primary-button"
import EditButton from "./EditButton"
import SocialMediaInput from "./portfolioSocials/SocialMediaInput"
import SocialMediaCard from "./portfolioSocials/SocialMediaCard"
import { socialIcons } from "./portfolioSocials/SocialMediaIcons"
import { Button } from "@/components/ui/button"

const PortfolioSocials = ({ socialMediaLinksViaPortfolio }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [socialMediaLinks, setSocialMediaLinks] = useState(
    socialMediaLinksViaPortfolio?.socialMedia || {}
  )
  const { data: session } = useSession()
  const params = useParams()

  const handleInputChange = (platform: string, value: string) => {
    setSocialMediaLinks((prev: object | any) => ({
      ...prev,
      [platform]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ socialLinks: socialMediaLinks }),
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

  const socialMediaArray = Object.entries(socialMediaLinks).filter(
    ([platform, url]) => url !== null && url !== undefined && url !== ""
  )

  return (
    socialMediaArray.length > 0 && (
      <div className="py-20 container mx-auto px-4">
        <h1 className="pb-10 text-2xl uppercase text-center">Socials</h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(socialMediaLinks).map((platform) => (
              <SocialMediaInput
                key={platform}
                platform={platform}
                value={socialMediaLinks[platform] || ""}
                handleInputChange={handleInputChange}
              />
            ))}
            <div className="flex justify-end space-x-4 mt-4">
              <Button
              variant="destructive"
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white"
              >Cancel</Button>
              <Button variant="secondary" type="submit" >Save Changes</Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid sm:grid-cols-5 grid-cols-3 gap-6 sm:gap-4">
              {socialMediaArray.length > 0 &&
                socialMediaArray.map(([platform, url]: any, index) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons] || FaExternalLinkAlt
                  return (
                    <SocialMediaCard
                      key={index}
                      platform={platform}
                      url={url}
                      icon={Icon}
                    />
                  )
                })}
            </div>
            {session?.user?.id === socialMediaLinksViaPortfolio?.userId && (
              <EditButton
                className="float-right mt-4 sm:mt-0"
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        )}
      </div>
    )
  )
}

export default PortfolioSocials
