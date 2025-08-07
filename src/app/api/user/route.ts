import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("username")


    if(!userId) {
        return NextResponse.json(
            { message: "Missing userId" },
            { status: 400 }
          )
    }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
        portfolio: true,
    }
  });

  return NextResponse.json(user, { status: 200 })
}