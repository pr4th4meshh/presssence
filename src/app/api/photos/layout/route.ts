import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

// PUT /api/photos/layout  body: { portfolioUsername, layout: [{id, x, y, w, h}] }
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { portfolioUsername, layout } = await req.json()

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true },
    })

    if (!portfolio || portfolio.User.id !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await Promise.all(
      (layout as { id: string; x: number; y: number; w: number; h: number }[]).map((item) =>
        prisma.photo.update({
          where: { id: item.id },
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
