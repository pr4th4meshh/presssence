import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { ProfileData } from "./interfaces"

const getIsOwner = () => {
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

  return {
    isOwner: session?.data?.user.id === profileData?.userId,
    refetchPortfolioData,
  }
}

export default getIsOwner
