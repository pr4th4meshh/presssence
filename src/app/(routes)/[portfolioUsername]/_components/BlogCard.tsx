import Image from "next/image"
import Link from "next/link"
import { FiCalendar, FiLock } from "react-icons/fi"
import { BlogPost } from "@/types"

interface BlogCardProps {
  post: BlogPost
  portfolioUsername: string
}

const BlogCard = ({ post, portfolioUsername }: BlogCardProps) => {
  return (
    <Link
      href={`/${portfolioUsername}/blog/${post.slug}`}
      className="group block project-card-bg bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {post.coverImage && (
        <div className="relative overflow-hidden h-[180px]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="project-card-title font-semibold text-foreground text-base line-clamp-2 leading-snug">
            {post.title}
          </h3>
          {!post.published && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
              <FiLock size={9} />
              Draft
            </span>
          )}
        </div>

        {post.excerpt && (
          <p className="project-card-desc text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="project-card-date flex items-center gap-1.5 text-xs text-muted-foreground">
            <FiCalendar size={11} className="shrink-0" />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="project-card-link text-xs font-medium transition-colors">
            Read more →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default BlogCard
