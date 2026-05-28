import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, CreatePortfolioSchema, UpdatePortfolioSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const SOCIAL_PLATFORMS = [
  "twitter", "linkedin", "github", "instagram", "youtube",
  "medium", "website", "behance", "figma", "awwwards", "dribbble", "spotify",
] as const

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const parsed = await parseBody(req, CreatePortfolioSchema)
    if (parsed.error) return parsed.error

    const { username, fullName, profession, headline, theme, features, projects, socialLinks, blogEnabled } = parsed.data

    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    })

    if (existingPortfolio) {
      return NextResponse.json({ message: "You already have a portfolio" }, { status: 400 })
    }

    const filteredSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([, value]) => typeof value === "string" && value.trim())
    )

    const portfolio = await prisma.portfolio.create({
      data: {
        username,
        fullName,
        profession,
        headline,
        theme: theme || "modern",
        blogEnabled,
        features,
        userId: session.user.id,
        socialMedia: { create: filteredSocialLinks },
        projects: {
          create: projects.map((p) => ({
            title: p.title,
            description: p.description ?? "",
            link: p.link || "",
            coverImage: p.coverImage || "",
            timeline: p.timeline || "",
          })),
        },
      },
      include: { socialMedia: true, projects: true },
    })

    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const portfolioUsername = searchParams.get("portfolioUsername")

    if (!portfolioUsername) {
      return NextResponse.json({ message: "Missing portfolioUsername" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: {
        projects: { orderBy: { position: "asc" } },
        blogPosts: true,
        socialMedia: {
          select: {
            twitter: true, linkedin: true, github: true, instagram: true,
            youtube: true, medium: true, website: true, behance: true,
            figma: true, awwwards: true, dribbble: true, spotify: true, order: true,
          },
        },
      },
    })

    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
    }

    const blogPostOrder: string[] = (portfolio as any).blogPostOrder ?? []
    const sortedBlogPosts =
      blogPostOrder.length > 0
        ? [
            ...blogPostOrder.map((id) => portfolio.blogPosts.find((p) => p.id === id)).filter(Boolean),
            ...portfolio.blogPosts.filter((p) => !blogPostOrder.includes(p.id)),
          ]
        : portfolio.blogPosts

    return NextResponse.json({ ...portfolio, blogPosts: sortedBlogPosts }, { status: 200 })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const portfolioUsername = searchParams.get("portfolioUsername")

    if (!portfolioUsername) {
      return NextResponse.json({ message: "Missing portfolioUsername" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true },
    })

    if (!portfolio || portfolio.User.id !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const parsed = await parseBody(req, UpdatePortfolioSchema)
    if (parsed.error) return parsed.error

    const updateData = parsed.data

    await prisma.$transaction(async (tx) => {
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          ...(updateData.fullName !== undefined && { fullName: updateData.fullName }),
          ...(updateData.profession !== undefined && { profession: updateData.profession }),
          ...(updateData.headline !== undefined && { headline: updateData.headline }),
          ...(updateData.features !== undefined && { features: updateData.features }),
          ...(updateData.theme !== undefined && { theme: updateData.theme }),
          ...(updateData.blogEnabled !== undefined && { blogEnabled: updateData.blogEnabled }),
          ...(updateData.blogPostOrder !== undefined && { blogPostOrder: updateData.blogPostOrder }),
        },
      })

      if (updateData.projects && Array.isArray(updateData.projects)) {
        for (let i = 0; i < updateData.projects.length; i++) {
          const project = updateData.projects[i]
          const position = project.position !== undefined ? project.position : i
          if (project.id) {
            await tx.project.update({
              where: { id: project.id },
              data: {
                title: project.title,
                description: project.description,
                link: project.link || "",
                timeline: project.timeline || "",
                coverImage: project.coverImage || "",
                position,
              },
            })
          } else {
            await tx.project.create({
              data: {
                title: project.title,
                description: project.description ?? "",
                link: project.link || "",
                timeline: project.timeline || "",
                coverImage: project.coverImage || "",
                position,
                portfolioId: portfolio.id,
              },
            })
          }
        }
      }

      if (updateData.socialLinks !== undefined) {
        const rawLinks = updateData.socialLinks as Record<string, string | undefined>

        const cleanLinks: Record<string, string> = {}
        for (const platform of SOCIAL_PLATFORMS) {
          const val = rawLinks[platform]
          if (typeof val === "string" && val.trim()) {
            cleanLinks[platform] = val.trim()
          }
        }

        const cleanOrder = (updateData.socialLinksOrder ?? []).filter(
          (platform) => cleanLinks[platform]
        )

        const socialData: Record<string, string | string[]> = { order: cleanOrder }
        for (const platform of SOCIAL_PLATFORMS) {
          socialData[platform] = cleanLinks[platform] || ""
        }

        await tx.socialLinks.upsert({
          where: { portfolioId: portfolio.id },
          update: socialData,
          create: { portfolioId: portfolio.id, ...socialData },
        })
      }
    })

    const updated = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: {
        projects: { orderBy: { position: "asc" } },
        socialMedia: true,
      },
    })

    return NextResponse.json({ portfolio: updated }, { status: 200 })
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
