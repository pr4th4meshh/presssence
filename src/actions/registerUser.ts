"use server"

import { signIn } from "next-auth/react"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

interface IFormData { 
  name: string
  email: string
  password: string
  image: string
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  image: string
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User already exists" }
    }

    console.log("HEHEHELE")

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    console.log("#######################")
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        portfolio: {}
      },
    })
console.log("**********************")
    // Sign in the user
    const response = await signIn("credentials", { email, password })
    console.log(response, "RESPONSE")
    
    if(response?.error) {
      return { error: response.error}
    }

    return { success: true}
  } catch (error) {
    console.error("Registration error:", error)
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: IFormData
) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error) {
      switch (error) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}