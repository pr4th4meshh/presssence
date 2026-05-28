import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { url, w, h, x, y, portfolioUsername } = await req.json()

    if (!url || !portfolioUsername) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { username: portfolioUsername },
      include: { User: true, _count: { select: { photos: true } } },
    })

    if (!portfolio || portfolio.User.id !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (portfolio._count.photos >= 8) {
      return NextResponse.json({ message: "Maximum 8 photos allowed" }, { status: 400 })
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        w: w ?? 1,
        h: h ?? 1,
        x: x ?? 0,
        y: y ?? 0,
        portfolioId: portfolio.id,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error("Error creating photo:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
