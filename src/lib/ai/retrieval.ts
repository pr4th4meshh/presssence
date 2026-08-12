import "server-only"
import { prisma } from "@/lib/prisma"
import { buildChunks, type IndexablePortfolio } from "./chunking"
import { cosineSimilarity, embed } from "./provider"

/** Gemini's embed endpoint accepts batches; keep them modest to stay under limits. */
const EMBED_BATCH = 32

/** Full rebuild rather than a diff — a portfolio is a few dozen chunks. */
export async function reindexPortfolio(portfolioId: string): Promise<number> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: { projects: true, workExperiences: true, blogPosts: true },
  })
  if (!portfolio) throw new Error(`Portfolio ${portfolioId} not found`)

  const chunks = buildChunks(portfolio as unknown as IndexablePortfolio)
  if (chunks.length === 0) {
    await prisma.portfolioChunk.deleteMany({ where: { portfolioId } })
    return 0
  }

  const vectors: number[][] = []
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH)
    vectors.push(...(await embed(batch.map((c) => c.content), "RETRIEVAL_DOCUMENT")))
  }

  // Embed before deleting: a failed API call leaves the old index searchable.
  await prisma.portfolioChunk.deleteMany({ where: { portfolioId } })
  await prisma.portfolioChunk.createMany({
    data: chunks.map((chunk, i) => ({
      portfolioId,
      content: chunk.content,
      sourceType: chunk.sourceType,
      sourceId: chunk.sourceId,
      embedding: vectors[i],
    })),
  })

  return chunks.length
}

/**
 * Rebuilds if any source row changed since the index was built. Checked on read
 * rather than in each mutation route, because a fire-and-forget reindex from a
 * serverless handler isn't guaranteed to finish. Call once per conversation.
 */
export async function ensureFreshIndex(portfolioId: string): Promise<void> {
  const [newestChunk, portfolio, project, role, post] = await Promise.all([
    prisma.portfolioChunk.findFirst({
      where: { portfolioId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.portfolio.findUnique({ where: { id: portfolioId }, select: { updatedAt: true } }),
    prisma.project.findFirst({
      where: { portfolioId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.workExperience.findFirst({
      where: { portfolioId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.blogPost.findFirst({
      where: { portfolioId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ])

  if (!newestChunk) {
    await reindexPortfolio(portfolioId)
    return
  }

  const lastEdit = Math.max(
    ...[portfolio?.updatedAt, project?.updatedAt, role?.updatedAt, post?.updatedAt]
      .filter(Boolean)
      .map((d) => (d as Date).getTime())
  )

  if (lastEdit > newestChunk.createdAt.getTime()) {
    await reindexPortfolio(portfolioId)
  }
}

export type RetrievedChunk = {
  content: string
  sourceType: string
  score: number
}

/**
 * Brute-force nearest-neighbour search. A portfolio is tens of chunks, so a
 * vector index would add sync burden to avoid a scan that isn't slow; swapping
 * it in is contained here since callers only see RetrievedChunk[].
 *
 * Keep `minScore` low. Cosine scores cluster tightly (~0.65 relevant vs ~0.52
 * unrelated), so it can't separate off-topic questions — the system prompt does
 * that at generation time. A false negative is worse than a false positive.
 */
export async function retrieve(
  portfolioId: string,
  query: string,
  { topK = 5, minScore = 0.45 }: { topK?: number; minScore?: number } = {}
): Promise<RetrievedChunk[]> {
  // Build on first use so portfolios predating this feature still work.
  if ((await prisma.portfolioChunk.count({ where: { portfolioId } })) === 0) {
    await reindexPortfolio(portfolioId)
  }

  const [queryVector] = await embed([query], "RETRIEVAL_QUERY")
  if (!queryVector) return []

  const chunks = await prisma.portfolioChunk.findMany({
    where: { portfolioId },
    select: { content: true, sourceType: true, embedding: true },
  })

  return chunks
    .map((chunk) => ({
      content: chunk.content,
      sourceType: chunk.sourceType,
      score: cosineSimilarity(queryVector, chunk.embedding),
    }))
    .filter((chunk) => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
