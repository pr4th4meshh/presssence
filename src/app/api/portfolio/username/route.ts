import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, UsernameSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const ChangeUsernameSchema = z.object({ username: UsernameSchema })

/** Change the signed-in user's portfolio URL. */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const parsed = await parseBody(req, ChangeUsernameSchema)
    if (parsed.error) return parsed.error
    const { username } = parsed.data

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      select: { id: true, username: true },
    })
    if (!portfolio) {
      return NextResponse.json({ message: "You don't have a portfolio yet" }, { status: 404 })
    }
    if (portfolio.username === username) {
      return NextResponse.json({ username })
    }

    const taken = await prisma.portfolio.findUnique({ where: { username }, select: { id: true } })
    if (taken) {
      return NextResponse.json({ message: "That username is already taken" }, { status: 409 })
    }

    await prisma.portfolio.update({ where: { id: portfolio.id }, data: { username } })
    return NextResponse.json({ username })
  } catch (error) {
    // Unique index race: someone claimed it between the check and the write.
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ message: "That username is already taken" }, { status: 409 })
    }
    console.error("Error changing username:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
