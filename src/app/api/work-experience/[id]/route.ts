import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

async function getAuthorizedEntry(id: string, userId: string) {
  const entry = await prisma.workExperience.findUnique({
    where: { id },
    include: { Portfolio: { include: { User: true } } },
  })
  if (!entry || entry.Portfolio.User.id !== userId) return null
  return entry
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const entry = await getAuthorizedEntry(id, (session.user as any).id)
    if (!entry) return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    const { company, role, startDate, endDate, description, location, position } = await req.json()

    const updated = await prisma.workExperience.update({
      where: { id },
      data: {
        ...(company !== undefined && { company }),
        ...(role !== undefined && { role }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate: endDate || null }),
        ...(description !== undefined && { description: description || null }),
        ...(location !== undefined && { location: location || null }),
        ...(position !== undefined && { position }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating work experience:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const entry = await getAuthorizedEntry(id, (session.user as any).id)
    if (!entry) return NextResponse.json({ message: "Forbidden" }, { status: 403 })

    await prisma.workExperience.delete({ where: { id } })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("Error deleting work experience:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
