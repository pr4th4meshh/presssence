"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { SignupSchemaFrontend } from "@/lib/validations"

export async function registerUser(name: string, email: string, password: string) {
  // Server actions are public endpoints, so validate here, not just in the form.
  const parsed = SignupSchemaFrontend.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" }
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } },
      select: { id: true },
    })

    if (existingUser) {
      return { error: "An account with this email already exists. Try signing in." }
    }

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: await bcrypt.hash(parsed.data.password, 10),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
