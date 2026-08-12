import "server-only"

export type SourceType = "profile" | "skills" | "project" | "experience" | "blog"

export type Chunk = {
  content: string
  sourceType: SourceType
  sourceId: string | null
}

/** Long prose is split on paragraph boundaries; everything else is one chunk. */
const MAX_CHUNK_CHARS = 1200

export type IndexablePortfolio = {
  fullName: string
  profession: string
  headline: string | null
  features: string[]
  projects: Array<{
    id: string
    title: string
    description: string
    link: string | null
    timeline: string | null
  }>
  workExperiences: Array<{
    id: string
    company: string
    role: string
    startDate: string
    endDate: string | null
    location: string | null
    description: string | null
  }>
  blogPosts: Array<{ id: string; title: string; content: string; published: boolean }>
}

/**
 * Splits on blank lines, packing paragraphs up to the size cap.
 *
 * Splitting at a fixed character count instead would cut mid-sentence, and a
 * chunk that starts halfway through a thought embeds to a vector that matches
 * nothing well.
 */
function splitProse(text: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ""

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      chunks.push(current)
      current = paragraph
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph
    }
  }
  if (current) chunks.push(current)

  // A single paragraph over the cap still needs breaking up.
  return chunks.flatMap((chunk) =>
    chunk.length <= MAX_CHUNK_CHARS
      ? [chunk]
      : (chunk.match(new RegExp(`[\\s\\S]{1,${MAX_CHUNK_CHARS}}`, "g")) ?? [])
  )
}

/**
 * Chunks along the portfolio's own structure — one project, one role, one chunk
 * — rather than sliding a fixed window over concatenated text. The data is
 * already semantically segmented, and a chunk spanning the end of one project
 * and the start of another retrieves badly for both.
 *
 * Every chunk repeats the person's name and the record's title. Chunks are
 * retrieved in isolation, so "Reduced latency by 60%" with no subject is
 * useless to the model; it needs to know who and what it refers to.
 */
export function buildChunks(portfolio: IndexablePortfolio): Chunk[] {
  const chunks: Chunk[] = []
  const who = portfolio.fullName

  const profileParts = [
    `${who} is a ${portfolio.profession}.`,
    portfolio.headline ? `Summary: ${portfolio.headline}` : null,
  ].filter(Boolean)
  chunks.push({ content: profileParts.join(" "), sourceType: "profile", sourceId: null })

  if (portfolio.features.length > 0) {
    chunks.push({
      content: `${who}'s skills and technologies: ${portfolio.features.join(", ")}.`,
      sourceType: "skills",
      sourceId: null,
    })
  }

  for (const project of portfolio.projects) {
    const parts = [
      `Project by ${who}: ${project.title}.`,
      project.timeline ? `Built ${project.timeline}.` : null,
      project.description,
      project.link ? `Link: ${project.link}` : null,
    ].filter(Boolean)
    chunks.push({
      content: parts.join(" "),
      sourceType: "project",
      sourceId: project.id,
    })
  }

  for (const role of portfolio.workExperiences) {
    const period = `${role.startDate} to ${role.endDate ?? "Present"}`
    const parts = [
      `${who} worked as ${role.role} at ${role.company} (${period}).`,
      role.location ? `Location: ${role.location}.` : null,
      role.description,
    ].filter(Boolean)
    chunks.push({
      content: parts.join(" "),
      sourceType: "experience",
      sourceId: role.id,
    })
  }

  // Drafts are invisible on the portfolio and must stay invisible to the bot.
  for (const post of portfolio.blogPosts.filter((p) => p.published)) {
    for (const [i, piece] of splitProse(post.content).entries()) {
      chunks.push({
        content: `Blog post by ${who}: "${post.title}"${i > 0 ? " (continued)" : ""}. ${piece}`,
        sourceType: "blog",
        sourceId: post.id,
      })
    }
  }

  return chunks.filter((c) => c.content.trim().length > 0)
}
