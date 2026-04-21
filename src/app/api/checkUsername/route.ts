import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  try {
    const userExists = await prisma.portfolio.findFirst({
      where: { username },
    });

    return NextResponse.json({ available: !userExists });
  } catch (error) {
    console.error("Error creating portfolio:", error)
    return NextResponse.json({ message: 'Internal server error' }, {status: 500});
  }
}
