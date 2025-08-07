import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/serverAuth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { photoUrl } = await req.json()

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: photoUrl },
    })

    session.user.image = photoUrl;
    return NextResponse.json({ user: updatedUser,  image: photoUrl })
  } catch (error) {
    console.error('Error updating user photo:', error)
    return NextResponse.json({ error: 'Error updating user photo' }, { status: 500 })
  }
}