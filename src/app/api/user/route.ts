import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

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
    include: {
        portfolio: true,
    }
  });

  return NextResponse.json(user, { status: 200 })
}