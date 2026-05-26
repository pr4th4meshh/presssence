import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft, FiCalendar } from "react-icons/fi"

interface PageProps {
  params: Promise<{ portfolioUsername: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { portfolioUsername, slug } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { username: portfolioUsername },
    select: { id: true, fullName: true },
  })

  if (!portfolio) return { title: "Post not found" }

  const post = await prisma.blogPost.findUnique({
    where: { portfolioId_slug: { portfolioId: portfolio.id, slug } },
  })

  if (!post || !post.published) return { title: "Post not found" }

  return {
    title: `${post.title} | ${portfolio.fullName}`,
    description: post.excerpt ?? post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt ?? post.content.slice(0, 160),
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { portfolioUsername, slug } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { username: portfolioUsername },
    select: { id: true, fullName: true, userId: true },
  })

  if (!portfolio) notFound()

  const post = await prisma.blogPost.findUnique({
    where: { portfolioId_slug: { portfolioId: portfolio.id, slug } },
  })

  if (!post || !post.published) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link
          href={`/${portfolioUsername}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <FiArrowLeft size={14} />
          Back to {portfolio.fullName}&apos;s portfolio
        </Link>

        {post.coverImage && (
          <div className="relative w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FiCalendar size={13} />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed">
          {post.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-base dark:text-gray-300 text-gray-700">
                {paragraph}
              </p>
            ) : (
              <br key={i} />
            )
          )}
        </article>
      </div>
    </div>
  )
}
