import { prisma } from "@/lib/prisma"
import { parseBody, CheckUsernameSchema, UsernameSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const parsed = await parseBody(req, CheckUsernameSchema)
    if (parsed.error) return parsed.error

    const result = UsernameSchema.safeParse(parsed.data.username)
    if (!result.success) {
      return NextResponse.json({ available: false, reason: result.error.issues[0]?.message })
    }

    const existing = await prisma.portfolio.findUnique({ where: { username: result.data } })

    return NextResponse.json({
      available: !existing,
      reason: existing ? "That username is already taken" : undefined,
    })
  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
