import ClientPage from "./ClientPage"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{
    portfolioUsername: string
  }>
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { portfolioUsername } = await params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const res = await fetch(
      `${baseUrl}/api/portfolio/get-user-id?portfolioUsername=${portfolioUsername}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return {
        title: `${portfolioUsername} | Presssence`,
        description: `View ${portfolioUsername}'s portfolio on Presssence.`,
      }
    }

    const userId = await res.json()

    const userRes = await fetch(
      `${baseUrl}/api/user?username=${userId}`,
      { cache: "no-store" }
    )

    if (!userRes.ok) {
      return {
        title: `${portfolioUsername} | Presssence`,
        description: `View ${portfolioUsername}'s portfolio on Presssence.`,
      }
    }

    const userData = await userRes.json()
    const name = userData?.name || portfolioUsername
    const image = userData?.image || undefined

    return {
      title: `${name} | Presssence`,
      description: `Check out ${name}'s portfolio on Presssence — projects, skills, and more.`,
      openGraph: {
        title: `${name}'s Portfolio`,
        description: `Check out ${name}'s portfolio on Presssence.`,
        type: "profile",
        images: image ? [{ url: image, width: 400, height: 400, alt: `${name}'s profile photo` }] : [],
        siteName: "Presssence",
      },
      twitter: {
        card: "summary",
        title: `${name}'s Portfolio`,
        description: `Check out ${name}'s portfolio on Presssence.`,
        images: image ? [image] : [],
      },
      icons: {
        icon: image || "/favicon.ico",
      },
    }
  } catch {
    return {
      title: `${portfolioUsername} | Presssence`,
      description: `View ${portfolioUsername}'s portfolio on Presssence.`,
    }
  }
}

export default ClientPage
