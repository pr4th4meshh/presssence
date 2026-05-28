import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, UpdateBlogSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const portfolioUsername = searchParams.get("portfolioUsername")

    if (!portfolioUsername) {
      return NextResponse.json({ message: "Missing portfolioUsername" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { username: portfolioUsername },
      select: { id: true, userId: true },
    })

    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === portfolio.userId

    const post = await prisma.blogPost.findFirst({
      where: {
        portfolioId: portfolio.id,
        OR: [{ slug: id }, { id }],
        ...(isOwner ? {} : { published: true }),
      },
    })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { Portfolio: { select: { userId: true } } },
    })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    if (post.Portfolio.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const parsed = await parseBody(req, UpdateBlogSchema)
    if (parsed.error) return parsed.error

    const { title, content, coverImage, published } = parsed.data

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && {
          content: content.trim(),
          excerpt: content.slice(0, 160).trimEnd(),
        }),
        ...(coverImage !== undefined && { coverImage: coverImage ?? null }),
        ...(published !== undefined && { published }),
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { Portfolio: { select: { userId: true } } },
    })

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    if (post.Portfolio.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.blogPost.delete({ where: { id } })

    return NextResponse.json({ message: "Deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
