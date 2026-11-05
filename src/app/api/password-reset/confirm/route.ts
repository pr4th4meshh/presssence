import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit"
import { consumeResetToken } from "@/lib/passwordReset"
import { NewPasswordSchema } from "@/lib/validations"

const Body = z.object({ token: z.string().min(1), password: NewPasswordSchema })

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      const message = parsed.error.issues.find((i) => i.path[0] === "password")?.message
      return NextResponse.json({ message: message ?? "Invalid request" }, { status: 400 })
    }

    const limit = await checkRateLimit(getClientKey(req, "pwreset-confirm"), 10, 15 * 60)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: "Too many attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      )
    }

    const userId = await consumeResetToken(parsed.data.token)
    if (!userId) {
      return NextResponse.json(
        { message: "This reset link has expired or was already used. Ask for a new one." },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(parsed.data.password, 10) },
      select: { email: true },
    })

    // The email lets the page sign the user straight in with the new password.
    return NextResponse.json({ ok: true, email: user.email })
  } catch (error) {
    console.error("Password reset failed:", error)
    return NextResponse.json({ message: "Something went wrong. Try again." }, { status: 500 })
  }
}
