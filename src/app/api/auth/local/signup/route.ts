import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { SignupSchema } from "@/lib/zod"
import { useAuth } from "@clerk/nextjs"

export async function POST(req: Request) {  
  const body = await req.json()
  const bodyResult = SignupSchema.safeParse(body)

  if (!bodyResult.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: bodyResult.error.errors },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: bodyResult.data?.email,
    },
  })

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(bodyResult.data?.password, 10)

  await prisma.user.create({
    data: {
      email: bodyResult.data?.email,
      name: bodyResult.data?.username,
      password: hashedPassword,
    },
  })

  return NextResponse.json(
    { message: "User created successfully" },
    { status: 201 }
  )
}
