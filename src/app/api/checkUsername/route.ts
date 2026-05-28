import { prisma } from "@/lib/prisma"
import { parseBody, CheckUsernameSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const parsed = await parseBody(req, CheckUsernameSchema)
    if (parsed.error) return parsed.error

    const { username } = parsed.data

    const existing = await prisma.portfolio.findFirst({ where: { username } })

    return NextResponse.json({ available: !existing })
  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
