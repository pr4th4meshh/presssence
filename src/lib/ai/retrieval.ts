import "server-only"
import { prisma } from "@/lib/prisma"
import { buildChunks, type IndexablePortfolio } from "./chunking"
import { cosineSimilarity, embed } from "./provider"

/** Gemini's embed endpoint accepts batches; keep them modest to stay under limits. */
const EMBED_BATCH = 32

/**
 * Rebuilds the whole index for one portfolio.
 *
 * Delete-then-insert rather than diffing: a portfolio is a few dozen chunks, so
 * a full rebuild costs one embed call and is always correct. Diffing would need
 * content hashing per row to save a fraction of a cent.
 */
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

  // Embedding first means a failed API call leaves the old index intact and
  // searchable, rather than wiping it and leaving the chatbot with nothing.
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
 * Reindexes if any source row has been edited since the index was built.
 *
 * Chosen over reindexing inside every mutation route because those are spread
 * across portfolio/projects/work-experience/blogs, and a fire-and-forget call
 * from a serverless handler isn't guaranteed to finish after the response is
 * sent. Checking on read is a few indexed queries and is always correct.
 *
 * Call this once per conversation, not per message.
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
 * Brute-force nearest-neighbour search: load every chunk, score, take top K.
 *
 * A portfolio is tens of chunks, so this is a sub-millisecond loop over a few
 * hundred KB. An Atlas Vector Search index would add setup and an index to keep
 * in sync to avoid a scan that isn't slow. Worth switching once a single
 * portfolio exceeds a few thousand chunks — the swap is contained to this
 * function, since callers only see RetrievedChunk[].
 *
 * `minScore` is a token-saving filter, not a correctness guarantee. Cosine
 * scores cluster tightly (measured here: ~0.65 relevant vs ~0.52 unrelated), so
 * no threshold cleanly separates them — an off-topic question still retrieves
 * its "least unrelated" chunks. Refusing to answer from irrelevant context is
 * handled at generation time by the system prompt, which is verified to work.
 * Keep this floor low: a false positive costs tokens, a false negative makes
 * the bot claim it doesn't know something the portfolio actually says.
 */
export async function retrieve(
  portfolioId: string,
  query: string,
  { topK = 5, minScore = 0.45 }: { topK?: number; minScore?: number } = {}
): Promise<RetrievedChunk[]> {
  // Build the index on first use so a portfolio created before this feature
  // existed still answers questions. Costs the first visitor a few seconds.
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
