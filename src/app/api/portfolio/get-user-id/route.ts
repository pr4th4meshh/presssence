import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function GET(request: Request) {
const url = new URL(request.url);
const usernameViaParams = url.searchParams.get("portfolioUsername")
  if (!usernameViaParams) {
    return new Response("Username not found", { status: 400 })
  }

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      username: usernameViaParams,
    },
    include: {
      User: true
    },
  })

  const user = portfolio;

  if (!user) {
    return new Response("User not found", { status: 404 })
  }

    return NextResponse.json(user.User.id, { status: 200 })
}