"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Loading from "@/components/Loading"
import PageHeader from "./_components/PageHeader"
import PortfolioHero from "./_components/PortfolioHero"
import PortfolioFooter from "./_components/PortfolioFooter"
import PortfolioSkills from "./_components/PortfolioSkills"
import PortfolioProjects from "./_components/PortfolioProjects"
import PortfolioSocials from "./_components/PortfolioSocials"
import CTAComponent from "./_components/CTAComponent"
import FloatingAddButton from "./_components/FloatingAddButton"
import SharePresssenceButton from "./_components/SharePresssenceButton"
import NoPortfolioScreen from "./_components/NoPortfolioScreen"
import { ProfileData } from "@/utils/interfaces"

export default function ClientPage() {
  const params = useParams<{ portfolioUsername: string }>()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [portfolioExists, setPortfolioExists] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const session = useSession()

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`
      )

      if (!response.ok) {
        setPortfolioExists(false)
        return
      }

      const data = await response.json()
      setProfileData(data || null)
      setPortfolioExists(true)
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refetchPortfolioData = async () => {
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`
      )
      if (response.ok) {
        const data = await response.json()
        setProfileData(data || null)
      } else {
        console.error("Failed to fetch portfolio data.")
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [params.portfolioUsername])

  if (isLoading) {
    return (
      <div className="min-h-screen flex dark:bg-dark bg-light items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!portfolioExists || !profileData) {
    return <NoPortfolioScreen />
  }

  return (
    <div className="min-h-screen dark:bg-black bg-light">
      {session?.data?.user.id !== profileData.userId && <CTAComponent />}
      <PageHeader />

      <div className="container mx-auto max-w-7xl">
        <PortfolioHero profileData={profileData} />

        {session?.data?.user?.id === profileData.userId && (
          <>
            {" "}
            <SharePresssenceButton />{" "}
            <FloatingAddButton
              userId={profileData.userId}
              socialMediaLinks={profileData.socialMedia}
              features={profileData.features}
              refetchData={refetchPortfolioData}
              projects={profileData.projects}
              onUpdate={(type, newData) => {
                setProfileData((prev) =>
                  prev
                    ? {
                        ...prev,
                        [type === "social"
                          ? "socialLinks"
                          : type === "feature"
                          ? "features"
                          : "projects"]: newData,
                      }
                    : null
                )
              }}
            />{" "}
          </>
        )}

        <PortfolioSkills skillsAndFeatures={profileData} />
        <PortfolioSocials socialMediaLinksViaPortfolio={profileData} />
        <PortfolioProjects initialProjects={profileData} />
        <PortfolioFooter />
      </div>
    </div>
  )
}
