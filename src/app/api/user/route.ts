import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/serverAuth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBody } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      portfolio: true,
    },
  });

  return NextResponse.json(user, { status: 200 })
}

const DeleteAccountSchema = z.object({
  /** The account email, typed by the user to confirm. */
  confirm: z.string().trim().min(1),
})

/**
 * Delete the signed-in user's account. Prisma's cascades remove the
 * portfolio and everything under it, plus OAuth accounts and sessions.
 */
export async function DELETE(req: Request) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const parsed = await parseBody(req, DeleteAccountSchema)
  if (parsed.error) return parsed.error

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })
    if (!user) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 })
    }
    if (user.email?.toLowerCase() !== parsed.data.confirm.toLowerCase()) {
      return NextResponse.json({ message: "That email doesn't match your account" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: session.user.id } })
    return NextResponse.json({ message: "Account deleted" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
