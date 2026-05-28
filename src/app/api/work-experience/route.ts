import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, CreateWorkExperienceSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const parsed = await parseBody(req, CreateWorkExperienceSchema)
    if (parsed.error) return parsed.error

    const { company, role, startDate, endDate, description, location, portfolioUsername } = parsed.data

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
        endDate: endDate ?? null,
        description: description ?? null,
        location: location ?? null,
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
