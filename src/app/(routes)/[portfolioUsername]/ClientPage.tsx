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
  const params = useParams()
  const [profileData0, setProfileData0] = useState<ProfileData | null>(null)
  const [portfolioExists, setPortfolioExists] = useState(true)
  const [loading, setLoading] = useState(true)
  const session = useSession()

  const handleGetPortfolioInformation = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`
      )

      if (!response.ok) {
        setPortfolioExists(false)
        return
      }

      const data = await response.json()
      if (data) {
        setProfileData0(data)
        setPortfolioExists(true)
      } else {
        console.error("Portfolio fetch failed:", data.message)
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refetchData = async () => {
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`
      )
      if (response.ok) {
        const data = await response.json()
        setProfileData0(data)
      } else {
        console.error("Failed to fetch portfolio data.")
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    }
  }

  useEffect(() => {
    handleGetPortfolioInformation()
  }, [params.portfolioUsername])

  const handleEndorsement = (skillIndex: number) => {
    if (!profileData0) return

    setProfileData0((prev) => {
      if (!prev) return null

      const updatedSkills = [...prev.skills]
      updatedSkills[skillIndex].endorsements += 1

      return {
        ...prev,
        skills: updatedSkills,
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex dark:bg-dark bg-light items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!portfolioExists) {
    return <NoPortfolioScreen />
  }

  console.log("profileData0?.socialMedia",profileData0)

  return (
    <div className="min-h-screen dark:bg-black bg-light">
      {/* Call to action component on the right to create new portfolio/pressence  */}
      {session?.data?.user.id !== profileData0?.userId && <CTAComponent />}
      {/* Page Header / Navbar  */}
      <PageHeader />
      <div className="container mx-auto max-w-7xl">
        {/* Profile Header */}
        <PortfolioHero
          session={session}
          params={params}
          profileData={profileData0}
          handleEndorsement={handleEndorsement}
        />

        {session?.data?.user?.id === profileData0?.userId && (
          <>
            <SharePresssenceButton />

            <FloatingAddButton
              userId={profileData0?.userId}
              socialMediaLinks={profileData0?.socialMedia}
              features={profileData0?.features}
              refetchData={refetchData}
              projects={profileData0?.projects}
              onUpdate={(type, newData) => {
                setProfileData0((prevData) => {
                  if (!prevData) return null
                  return {
                    ...prevData,
                    [type === "social"
                      ? "socialLinks"
                      : type === "feature"
                      ? "features"
                      : "projects"]: newData,
                  }
                })
              }}
            />
          </>
        )}

        {/* Skills Section */}
        <PortfolioSkills skillsAndFeatures={profileData0} />

        <PortfolioSocials socialMediaLinksViaPortfolio={profileData0} />

        {/* Projects Timeline */}
        <PortfolioProjects initialProjects={profileData0} />

        {/* Portfolio Footer */}
        <PortfolioFooter />
      </div>
    </div>
  )
}
