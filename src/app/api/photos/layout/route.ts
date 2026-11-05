import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, PhotoLayoutSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const parsed = await parseBody(req, PhotoLayoutSchema)
    if (parsed.error) return parsed.error

    const { portfolioUsername, layout } = parsed.data

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true },
    })

    if (!portfolio || portfolio.User.id !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const photoIds = layout.map((item) => item.id)
    const ownedCount = await prisma.photo.count({
      where: { id: { in: photoIds }, portfolioId: portfolio.id },
    })
    if (ownedCount !== new Set(photoIds).size) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await Promise.all(
      layout.map((item) =>
        prisma.photo.update({
          where: { id: item.id, portfolioId: portfolio.id },
          data: { x: item.x, y: item.y, w: item.w, h: item.h },
        })
      )
    )

    return NextResponse.json({ message: "Layout saved" })
  } catch (error) {
    console.error("Error saving photo layout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
