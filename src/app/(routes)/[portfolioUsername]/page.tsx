import { cache } from "react"
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

// cache() dedupes this per request, so generateMetadata and Page share one DB query.
const getPortfolio = cache((username: string) =>
  prisma.portfolio.findFirst({
    where: { username },
    include: {
      User: { select: { image: true } },
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
)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { portfolioUsername } = await params
  const fallback: Metadata = {
    title: `${portfolioUsername} | Presssence`,
    description: `View ${portfolioUsername}'s portfolio on Presssence.`,
  }

  try {
    const portfolio = await getPortfolio(portfolioUsername)
    if (!portfolio) return fallback

    const name = portfolio.fullName || portfolioUsername
    const image = portfolio.User?.image || undefined
    const description =
      portfolio.headline?.trim() ||
      `${name}${portfolio.profession ? `, ${portfolio.profession}` : ""}. Projects, skills, and more on Presssence.`

    return {
      title: `${name} | Presssence`,
      description,
      openGraph: {
        title: `${name}'s Portfolio`,
        description,
        type: "profile",
        images: image ? [{ url: image, width: 400, height: 400, alt: `${name}'s profile photo` }] : [],
        siteName: "Presssence",
      },
      twitter: {
        card: "summary",
        title: `${name}'s Portfolio`,
        description,
        images: image ? [image] : [],
      },
      icons: {
        icon: image || "/favicon.ico",
      },
    }
  } catch {
    return fallback
  }
}

export default async function Page({ params }: PageProps) {
  const { portfolioUsername } = await params

  try {
    const portfolio = await getPortfolio(portfolioUsername)

    if (!portfolio) return <NoPortfolioScreen />

    const blogOrder = portfolio.blogPostOrder ?? []
    const sortedBlogPosts = blogOrder.length > 0
      ? [
          ...blogOrder.map((id) => portfolio.blogPosts.find((p) => p.id === id)).filter(Boolean),
          ...portfolio.blogPosts.filter((p) => !blogOrder.includes(p.id)),
        ]
      : portfolio.blogPosts

    // JSON round-trip converts Prisma Date objects → ISO strings,
    // matching the shape components expect from the old API fetch flow.
    const profileData = JSON.parse(
      JSON.stringify({
        ...portfolio,
        blogPosts: sortedBlogPosts,
        photo: portfolio.User?.image ?? "",
      })
    ) as ProfileData

    return <ClientPage initialData={profileData} />
  } catch (error) {
    console.error("[portfolioUsername] page error:", error)
    return <NoPortfolioScreen />
  }
}
