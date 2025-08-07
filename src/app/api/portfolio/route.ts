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
      Object.entries(socialLinks).filter(([ value]) => value)
    );
    

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
        projects: true,
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

    // Find the portfolio by username
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { username: portfolioUsername },
      include: {
        socialMedia: true,
        User: true,
      },
    })

    if (!existingPortfolio) {
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      )
    }

    // Prepare the update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolioUpdate: any = {}

    // Update basic fields if provided
    if (updateData.fullName) portfolioUpdate.fullName = updateData.fullName
    if (updateData.profession)
      portfolioUpdate.profession = updateData.profession
    if (updateData.headline) portfolioUpdate.headline = updateData.headline
    if (updateData.theme) portfolioUpdate.theme = updateData.theme
    if (updateData.features) portfolioUpdate.features = updateData.features
    if (updateData.coverImage)
      portfolioUpdate.coverImage = updateData.coverImage

    // Update projects if provided
    if (updateData.projects) {
      portfolioUpdate.projects = {
        deleteMany: {},
        create: updateData.projects.map((project: IProject) => ({
          title: project.title,
          description: project.description,
          link: project.link || "",
          timeline: project.timeline || "",
          coverImage: project.coverImage || "",
        })),
      }
    }

    // Update social links if provided
    if (updateData.socialLinks) {
      portfolioUpdate.socialMedia = {
        upsert: {
          create: {
            ...updateData.socialLinks,
          },
          update: {
            ...updateData.socialLinks,
          },
        },
      }
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: {
        username: portfolioUsername,
      },
      data: portfolioUpdate,
      include: {
        socialMedia: true,
        projects: true,
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