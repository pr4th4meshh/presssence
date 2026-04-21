"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function registerUser(
  name: string,
  email: string,
  password: string,
  image?: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User already exists with this email" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        portfolio: {},
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
