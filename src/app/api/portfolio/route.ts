import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

interface IProject {
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

export async function POST(req: Request) {
  try {
    const {
      fullName,
      profession,
      headline,
      theme,
      features,
      projects,
      username,
      socialLinks,
    } = await req.json()

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session) {
      console.log("User name from getServerSession:", session.user?.name)
    } else {
      console.log("Session is undefined or expired")
    }

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Checking for missing required fields
    if (!fullName || !profession || !features || !projects) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingPortfolio = await prisma.portfolio.findUnique({
      where: {
        userId: session?.user?.id,
      },
    })

    if (existingPortfolio) {
      NextResponse.json(
        { message: "You already have a portfolio" },
        { status: 400 }
      )
    }

    const filteredSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([value]) => value)
    )

    // Create a new portfolio with the socialLinks
    const portfolio = await prisma.portfolio.create({
      data: {
        username,
        fullName,
        profession,
        headline,
        theme: theme || "modern",
        features,
        userId: session?.user.id,
        socialMedia: {
          create: filteredSocialLinks,
        },
        projects: {
          create: projects.map((project: IProject) => ({
            title: project.title,
            description: project.description,
            link: project.link || "",
            coverImage: project.coverImage || "",
            timeline: project.timeline || "",
          })),
        },
      },
      include: {
        socialMedia: true,
        projects: true,
      },
    })

    // Return the created portfolio in the response
    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const portfolioUsername = url.searchParams.get("portfolioUsername")

    if (!portfolioUsername) {
      return NextResponse.json(
        { message: "Missing porfolio username" },
        { status: 400 }
      )
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        username: portfolioUsername,
      },
      include: {
        projects: {
          orderBy: {
            position: "asc",
          },
        },
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
            order: true,
          },
        },
      },
    })

    if (!portfolio) {
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(portfolio, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 })
  }
}

// update portfolio route:
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const portfolioUsername = url.searchParams.get("portfolioUsername")

    if (!portfolioUsername) {
      return NextResponse.json(
        { message: "Missing portfolioUsername" },
        { status: 400 }
      )
    }

    const updateData = await req.json()
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true },
    })

    if (!portfolio || portfolio.User.id !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update portfolio's basic fields
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          fullName: updateData.fullName,
          profession: updateData.profession,
          headline: updateData.headline,
          features: updateData.features,
          theme: updateData.theme,
        },
      })

      // Update or create projects
      if (updateData.projects && Array.isArray(updateData.projects)) {
        for (let i = 0; i < updateData.projects.length; i++) {
          const project = updateData.projects[i]
          if (project.id) {
            // Update existing
            await tx.project.update({
              where: { id: project.id },
              data: {
                title: project.title,
                description: project.description,
                link: project.link || "",
                timeline: project.timeline || "",
                coverImage: project.coverImage || "",
                position: project.position !== undefined ? project.position : i,
              },
            })
          } else {
            // Create new
            await tx.project.create({
              data: {
                title: project.title,
                description: project.description,
                link: project.link || "",
                timeline: project.timeline || "",
                coverImage: project.coverImage || "",
                position: project.position !== undefined ? project.position : i,
                portfolioId: portfolio.id,
              },
            })
          }
        }
      }

      // Define all supported platforms (must match your Prisma model fields)
      const supportedPlatforms = [
        "twitter",
        "linkedin",
        "github",
        "instagram",
        "youtube",
        "medium",
        "website",
        "behance",
        "figma",
        "awwwards",
        "dribbble",
      ]

      // Clean up social links before saving
      const rawLinks = (updateData.socialLinks as Record<string, string>) || {}

      // Remove empty strings from socialLinks
      const cleanLinks: Record<string, string> = {}
      for (const [platform, url] of Object.entries(rawLinks)) {
        if (typeof url === "string" && url.trim()) {
          cleanLinks[platform] = url.trim()
        }
      }

      // Ensure order only contains valid platforms
      const cleanOrder = (updateData.socialLinksOrder || []).filter(
        (platform: string) => cleanLinks[platform]
      )

      // Build the full update object
      const updateSocialData: Record<string, string | string[]> = {
        order: cleanOrder,
      }

      // Ensure every platform is included (empty if missing)
      for (const platform of supportedPlatforms) {
        updateSocialData[platform] = cleanLinks[platform] || ""
      }

      await tx.socialLinks.upsert({
        where: { portfolioId: portfolio.id },
        update: updateSocialData,
        create: {
          portfolioId: portfolio.id,
          ...updateSocialData,
        },
      })
    })

    const updatedPortfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: {
        projects: {
          orderBy: { position: "asc" },
        },
        socialMedia: true,
      },
    })

    return NextResponse.json({ portfolio: updatedPortfolio }, { status: 200 })
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    )
  }
}
