import "server-only"
import { z } from "zod"
import { MODELS } from "./models"
import { generateStructured, type AiResult } from "./provider"

/**
 * Mirrors the Portfolio/Project/WorkExperience models so extraction output can
 * populate the onboarding form without translation.
 *
 * The `.describe()` strings are sent to the model as part of the schema — they
 * are prompt, not documentation. Length caps match DB columns and double as a
 * guard: an oversized value fails validation and triggers a retry instead of
 * writing junk.
 */
export const ResumeExtractionSchema = z.object({
  fullName: z.string().max(80).describe("The person's full name exactly as written, if it's all uppercase make sure only the first letter is uppercase"),
  profession: z
    .string()
    .max(50)
    .describe("Their current job title, e.g. 'Full Stack Developer'. Max 50 characters."),

  headline: z
    .string()
    .max(160)
    .describe(
      "A single punchy sentence summarising them, under 160 characters. Write this yourself from the resume's content — do not copy a long summary paragraph verbatim."
    ),

  skills: z
    .array(z.string())
    .max(40)
    .describe(
      "Technical skills, languages, and tools. Concrete technologies only — include 'React', 'PostgreSQL', 'Docker'; exclude soft skills like 'teamwork' or 'communication'."
    ),

  workExperience: z
    .array(
      z.object({
        company: z.string().describe("Company name"),
        role: z.string().describe("Job title held at this company"),
        startDate: z.string().max(40).describe("Start date as written, e.g. 'Jan 2023' or '2023'"),
        endDate: z
          .string()
          .max(40)
          .optional()
          .describe(
            "End date as written. OMIT this field entirely if the role is current or ongoing — do not write 'Present', 'Current', or an empty string."
          ),
        // Tight cap: the model has leaked its own reasoning into this field when
        // the source line was ambiguous about where the location ended.
        location: z.string().max(60).optional().describe("City or 'Remote', if stated"),
        description: z
          .string()
          .max(400)
          .optional()
          .describe("What they did, condensed to under 400 characters"),
      })
    )
    // Caps break repetition loops rather than expressing a business rule.
    .max(15)
    .describe("Employment history, most recent first. Never repeat the same role twice."),

  projects: z
    .array(
      z.object({
        title: z.string().describe("Project name"),
        description: z.string().max(400).describe("What it does, under 400 characters"),
        link: z.string().optional().describe("Project URL if one is given"),
        timeline: z.string().optional().describe("When it was built, e.g. '2024'"),
      })
    )
    .max(20)
    .describe(
      "Personal or professional projects explicitly listed as projects. Never repeat the same project twice."
    ),

  socialLinks: z
    .object({
      github: z.string().optional().describe("Full GitHub profile URL"),
      linkedin: z.string().optional().describe("Full LinkedIn profile URL"),
      twitter: z.string().optional().describe("Full Twitter/X profile URL"),
      website: z.string().optional().describe("Personal website or portfolio URL"),
    })
    .describe("Profile URLs found anywhere in the document"),
})

export type ResumeExtraction = z.infer<typeof ResumeExtractionSchema>

// Naming the specific failures (inventing employers, writing commentary into a
// field) works; generic "be accurate" instructions do not.
const SYSTEM_PROMPT = `You extract structured data from resumes.

Rules:
- Only record information actually present in the document. Never invent or infer employers, dates, titles, or skills.
- If a field is absent, omit it rather than guessing or writing a placeholder.
- Preserve the person's own wording for names, titles, and companies. Do not "improve" them.
- The one exception is "headline": the resume may not contain one, so write it yourself from what the document says.
- Condense long prose to fit the stated length limits rather than truncating mid-sentence.
- Write every value in English, using Latin characters only.
- Field values contain extracted data and nothing else. Never write commentary, notes to yourself, or remarks about formatting into a field value.`

export type ResumeFile = { base64: string; mimeType: string }

const NON_LATIN = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/gu

// Strips stray characters the model leaked mid-generation (e.g. "Chennai宿"),
// which are too short for a length cap to catch. Skipped when the value is
// mostly non-Latin, so genuinely non-English resumes survive intact.
function stripLeakedScript(value: string): string {
  const offenders = value.match(NON_LATIN)
  if (!offenders) return value
  if (offenders.length / [...value].length > 0.3) return value
  return value.replace(NON_LATIN, "").replace(/\s{2,}/g, " ").trim()
}

function sanitizeStrings<T>(value: T): T {
  if (typeof value === "string") return stripLeakedScript(value) as T
  if (Array.isArray(value)) return value.map(sanitizeStrings) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeStrings(v)])
    ) as T
  }
  return value
}

// Keyed on identifying fields, not deep equality: loop-produced duplicates
// differ in their corrupted fields and would otherwise all survive.
function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const k = key(item).trim().toLowerCase()
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export async function extractResume(
  input: ResumeFile | { text: string }
): Promise<AiResult<ResumeExtraction>> {
  const instruction = {
    text: "Extract this person's details from the resume, following the rules exactly.",
  }

  const prompt =
    "text" in input
      ? [{ text: `${instruction.text}\n\nRESUME:\n${input.text}` }]
      : [{ inlineData: { mimeType: input.mimeType, data: input.base64 } }, instruction]

  const result = await generateStructured({
    system: SYSTEM_PROMPT,
    prompt,
    schema: ResumeExtractionSchema,
    // PDFs are parsed visually and need the stronger model; text doesn't, and
    // the stronger model has a much tighter free-tier quota.
    model: "text" in input ? MODELS.fast : MODELS.smart,
    maxAttempts: 3,
    temperature: 0.2,
    maxOutputTokens: 4096,
  })

  // Sanitize before dedupe so entries differing only by leaked characters collapse.
  const clean = sanitizeStrings(result.data)

  return {
    ...result,
    data: {
      ...clean,
      skills: dedupeBy(clean.skills, (s) => s),
      workExperience: dedupeBy(clean.workExperience, (w) => `${w.company}|${w.role}`),
      projects: dedupeBy(clean.projects, (p) => p.title),
    },
  }
}
