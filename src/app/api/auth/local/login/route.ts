import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { LoginSchema } from "@/lib/zod"

export async function POST(req: Request) {
  const body = await req.json()
  const bodyResult = LoginSchema.safeParse(body)

  if (!bodyResult.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: bodyResult.error.errors },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: bodyResult.data?.email },
  })

  if (!user) {
    return NextResponse.json(
      { message: "Invalid Email" },
      { status: 400 }
    )
  }

  const matchPassword = await bcrypt.compare(
    bodyResult.data?.password,
    user.password
  )

  if (!matchPassword) {
    return NextResponse.json(
      { message: "Invalid Password" },
      { status: 400 }
    )
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  })

  const { password, ...userWithoutPassword } = user

  const response = NextResponse.json({ token, user: userWithoutPassword }, { status: 200 })
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  })

  return response
}