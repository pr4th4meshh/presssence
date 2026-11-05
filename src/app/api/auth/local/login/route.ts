import { prisma } from "@/lib/prisma"
import { parseBody, LoginSchema } from "@/lib/validations"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// bcrypt hash of a random string; compared against when the user doesn't exist
const DUMMY_HASH = "$2b$10$61MjVc6iU.wErttaGqsjaOops8aSqqT3HG.Vn/CdhwExm.AO.SHS6"

export async function POST(req: Request) {
  try {
    const parsed = await parseBody(req, LoginSchema)
    if (parsed.error) return parsed.error

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Same response (and roughly the same timing) whether the email exists or
    // not, so the endpoint can't be used to discover registered accounts.
    const passwordMatch = await bcrypt.compare(password, user?.password ?? DUMMY_HASH)
    if (!user || !user.password || !passwordMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" })

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({ token, user: userWithoutPassword }, { status: 200 })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
