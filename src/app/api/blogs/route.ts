import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/serverAuth"
import { parseBody, CreateBlogSchema } from "@/lib/validations"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function GET(req: Request) {
  try {
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

    const posts = await prisma.blogPost.findMany({
      where: {
        portfolioId: portfolio.id,
        ...(isOwner ? {} : { published: true }),
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(posts, { status: 200 })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const parsed = await parseBody(req, CreateBlogSchema)
    if (parsed.error) return parsed.error

    const { title, content, coverImage, published } = parsed.data

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
    }

    let slug = generateSlug(title)

    const existing = await prisma.blogPost.findUnique({
      where: { portfolioId_slug: { portfolioId: portfolio.id, slug } },
    })
    if (existing) slug = `${slug}-${Date.now()}`

    const postCount = await prisma.blogPost.count({ where: { portfolioId: portfolio.id } })
    const excerpt = content.slice(0, 160).trimEnd()

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt,
        coverImage: coverImage ?? null,
        published,
        order: postCount,
        portfolioId: portfolio.id,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
