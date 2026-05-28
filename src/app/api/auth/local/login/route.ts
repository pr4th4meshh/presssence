import { prisma } from "@/lib/prisma"
import { parseBody, LoginSchema } from "@/lib/validations"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const parsed = await parseBody(req, LoginSchema)
    if (parsed.error) return parsed.error

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "Invalid Email" }, { status: 400 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string)
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid Password" }, { status: 400 })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" })

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({ token, user: userWithoutPassword }, { status: 200 })
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
