import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { company, role, startDate, endDate, description, location, portfolioUsername } = await req.json()

    if (!company || !role || !startDate || !portfolioUsername) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true },
    })

    if (!portfolio || portfolio.User.id !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const count = await prisma.workExperience.count({ where: { portfolioId: portfolio.id } })

    const entry = await prisma.workExperience.create({
      data: {
        company,
        role,
        startDate,
        endDate: endDate || null,
        description: description || null,
        location: location || null,
        position: count,
        portfolioId: portfolio.id,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Error creating work experience:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
