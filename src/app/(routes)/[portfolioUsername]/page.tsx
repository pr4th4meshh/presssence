import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import ClientPage from "./ClientPage"
import NoPortfolioScreen from "./_components/NoPortfolioScreen"
import { ProfileData } from "@/types"

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

export default async function Page({ params }: PageProps) {
  const { portfolioUsername } = await params

  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: {
        projects: { orderBy: { position: "asc" } },
        workExperiences: { orderBy: { position: "asc" } },
        photos: true,
        blogPosts: true,
        socialMedia: {
          select: {
            twitter: true,
            linkedin: true,
            github: true,
            instagram: true,
            youtube: true,
            medium: true,
            website: true,
            behance: true,
            figma: true,
            awwwards: true,
            dribbble: true,
            spotify: true,
            order: true,
          },
        },
      },
    })

    if (!portfolio) return <NoPortfolioScreen />

    const blogOrder: string[] = (portfolio as any).blogPostOrder ?? []
    const sortedBlogPosts = blogOrder.length > 0
      ? [
          ...blogOrder.map((id) => portfolio.blogPosts.find((p) => p.id === id)).filter(Boolean),
          ...portfolio.blogPosts.filter((p) => !blogOrder.includes(p.id)),
        ]
      : portfolio.blogPosts

    // JSON round-trip converts Prisma Date objects → ISO strings,
    // matching the shape components expect from the old API fetch flow.
    const profileData = JSON.parse(
      JSON.stringify({ ...portfolio, blogPosts: sortedBlogPosts })
    ) as ProfileData

    return <ClientPage initialData={profileData} />
  } catch (error) {
    console.error("[portfolioUsername] page error:", error)
    return <NoPortfolioScreen />
  }
}
