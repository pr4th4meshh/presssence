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
    select: { id: true, fullName: true, userId: true, theme: true },
  })

  if (!portfolio) notFound()

  const post = await prisma.blogPost.findUnique({
    where: { portfolioId_slug: { portfolioId: portfolio.id, slug } },
  })

  if (!post || !post.published) notFound()

  const theme = typeof portfolio.theme === "string" ? portfolio.theme : "modern"

  return (
    <div className="min-h-screen bg-background" data-theme={theme}>
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-12">

        {/* Back link */}
        <Link
          href={`/${portfolioUsername}`}
          className="project-card-link inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <FiArrowLeft size={14} />
          {portfolio.fullName}&apos;s portfolio
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative w-full h-[280px] sm:h-[400px] rounded-2xl overflow-hidden mb-8 border border-border">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8 pb-8 border-b section-border border-border">
          <p className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Blog
          </p>
          <h1 className="portfolio-name text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="portfolio-headline text-base text-muted-foreground leading-relaxed mb-4">
              {post.excerpt}
            </p>
          )}
          <div className="project-card-date flex items-center gap-1.5 text-sm text-muted-foreground">
            <FiCalendar size={13} />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        {/* Content */}
        <article className="max-w-none">
          {post.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p
                key={i}
                className="project-card-desc text-base text-foreground/80 leading-[1.85] mb-5"
              >
                {paragraph}
              </p>
            ) : (
              <div key={i} className="h-2" />
            )
          )}
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t section-border border-border">
          <Link
            href={`/${portfolioUsername}`}
            className="project-card-link inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiArrowLeft size={14} />
            Back to {portfolio.fullName}&apos;s portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
