import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

async function getAuthorizedPhoto(id: string, userId: string) {
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { Portfolio: { include: { User: true } } },
  })
  if (!photo || photo.Portfolio.User.id !== userId) return null
  return photo
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const photo = await getAuthorizedPhoto(id, (session.user as any).id)
    if (!photo) return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    await prisma.photo.delete({ where: { id } })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
