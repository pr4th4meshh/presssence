import {prisma} from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function getUserFromToken() {
  const authcookie = (await cookies()).get("token")

  if (!authcookie || !authcookie.value) {
    throw new Error("Token not found")
  }

  try {
    const decoded = jwt.verify(authcookie.value, process.env.JWT_SECRET!) as { userId: string }

    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return user
  } catch (error) {
    console.error('Error decoding token:', error)
    throw new Error("Unauthorized or invalid token")
  }
}