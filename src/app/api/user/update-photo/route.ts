import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, UpdateUserPhotoSchema } from "@/lib/validations"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const parsed = await parseBody(req, UpdateUserPhotoSchema)
    if (parsed.error) return parsed.error

    const { photoUrl } = parsed.data

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: photoUrl },
    })

    session.user.image = photoUrl
    return NextResponse.json({ user: updatedUser, image: photoUrl })
  } catch (error) {
    console.error("Error updating user photo:", error)
    return NextResponse.json({ error: "Error updating user photo" }, { status: 500 })
  }
}
