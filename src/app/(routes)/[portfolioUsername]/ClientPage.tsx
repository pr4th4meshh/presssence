"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import PageHeader from "./_components/PageHeader"
import PortfolioHero from "./_components/PortfolioHero"
import PortfolioFooter from "./_components/PortfolioFooter"
import PortfolioSkills from "./_components/PortfolioSkills"
import PortfolioProjects from "./_components/PortfolioProjects"
import PortfolioSocials from "./_components/PortfolioSocials"
import PortfolioBlogs from "./_components/PortfolioBlogs"
import PortfolioWorkExperience from "./_components/PortfolioWorkExperience"
import CTAComponent from "./_components/CTAComponent"
import FloatingAddButton from "./_components/FloatingAddButton"
import { ProfileData } from "@/types"

type AddItemType = "social" | "feature" | "project"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
}

export default function ClientPage({ initialData }: { initialData: ProfileData }) {
  const params = useParams<{ portfolioUsername: string }>()
  const router = useRouter()
  const session = useSession()

  const [profileData, setProfileData] = useState<ProfileData>(initialData)
  const [theme, setTheme] = useState(
    typeof initialData.theme === "string" ? initialData.theme : "modern"
  )

  // Sync when server re-renders after router.refresh()
  useEffect(() => {
    setProfileData(initialData)
    setTheme(typeof initialData.theme === "string" ? initialData.theme : "modern")
  }, [initialData])

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
    try {
      await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch {}
  }

  const isOwner = session?.data?.user?.id === profileData.userId

  return (
    <AnimatePresence>
      <div
        className="min-h-screen bg-background"
        data-theme={theme}
      >
        {!isOwner && <CTAComponent />}
        <PageHeader />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0}>
            <PortfolioHero profileData={profileData} />
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.1}>
            <PortfolioSkills skillsAndFeatures={profileData} isOwner={isOwner} />
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.2}>
            <PortfolioSocials socialMediaLinksViaPortfolio={profileData} />
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.3}>
            <PortfolioProjects initialProjects={profileData} />
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.35}>
            <PortfolioWorkExperience
              initialExperiences={profileData.workExperiences ?? []}
              userId={profileData.userId}
            />
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.4}>
            <PortfolioBlogs
              initialPosts={profileData.blogPosts ?? []}
              initialBlogEnabled={profileData.blogEnabled ?? false}
              userId={profileData.userId}
            />
          </motion.div>

          <PortfolioFooter />
        </div>

        {isOwner && (
          <FloatingAddButton
            userId={profileData.userId}
            socialMediaLinks={profileData.socialMedia}
            features={profileData.features}
            refetchData={() => router.refresh()}
            projects={profileData.projects}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onUpdate={(type: AddItemType, newData: any) => {
              setProfileData((prev) => ({
                ...prev,
                [type === "social" ? "socialMedia" : type === "feature" ? "features" : "projects"]: newData,
              }))
            }}
          />
        )}
      </div>
    </AnimatePresence>
  )
}
