import { checkRateLimit } from "@/lib/ai/rateLimit"
import { reindexPortfolio } from "@/lib/ai/retrieval"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const maxDuration = 60

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
    }

    const limit = await checkRateLimit(`reindex:${session.user.id}`, 10, 3600)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: "Too many reindex requests. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      )
    }

    const count = await reindexPortfolio(portfolio.id)
    return NextResponse.json({ chunks: count }, { status: 200 })
  } catch (error) {
    console.error("Error reindexing portfolio:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
