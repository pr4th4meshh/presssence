import "server-only"
import type { z } from "zod"
import { getAiClient } from "./client"
import { EMBEDDING_DIMENSIONS, MODELS } from "./models"
import { toGeminiSchema } from "./schema"

export type TokenUsage = { input: number; output: number; total: number }

export type AiResult<T> = { data: T; usage: TokenUsage }

export class AiValidationError extends Error {
  constructor(
    message: string,
    readonly raw: string
  ) {
    super(message)
    this.name = "AiValidationError"
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/* eslint-disable @typescript-eslint/no-explicit-any */
function isRateLimit(error: any): boolean {
  const status = error?.status ?? error?.code
  if (status === 429) return true
  return typeof error?.message === "string" && error.message.includes("429")
}

// Only 429s are retried; a 400 will fail identically on a second attempt.
async function withBackoff<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRateLimit(error) || attempt === attempts - 1) throw error
      // Jitter so parallel callers don't retry in lockstep.
      await sleep(2000 * 2 ** attempt + Math.random() * 500)
    }
  }
  throw lastError
}

function readUsage(response: any): TokenUsage {
  const u = response?.usageMetadata
  return {
    input: u?.promptTokenCount ?? 0,
    output: u?.candidatesTokenCount ?? 0,
    // Exceeds input + output: hidden reasoning tokens are billed too.
    total: u?.totalTokenCount ?? 0,
  }
}

type GenerateOptions = {
  system?: string
  /** Text, or content parts for multimodal input (e.g. an inline PDF). */
  prompt: string | Array<Record<string, unknown>>
  model?: string
  temperature?: number
  maxOutputTokens?: number
}

function buildContents(prompt: GenerateOptions["prompt"]) {
  const parts = typeof prompt === "string" ? [{ text: prompt }] : prompt
  return [{ role: "user", parts }]
}

export async function generateText(options: GenerateOptions): Promise<AiResult<string>> {
  const ai = getAiClient()
  const response: any = await withBackoff(() =>
    ai.models.generateContent({
      model: options.model ?? MODELS.fast,
      contents: buildContents(options.prompt),
      config: {
        systemInstruction: options.system,
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens,
      },
    })
  )
  return { data: response.text ?? "", usage: readUsage(response) }
}

/**
 * `responseSchema` constrains the decoder so malformed JSON is impossible; Zod
 * then checks the content is usable, which the schema cannot do.
 */
export async function generateStructured<T>(
  options: GenerateOptions & {
    schema: z.ZodType<T>
    maxAttempts?: number
  }
): Promise<AiResult<T>> {
  const ai = getAiClient()
  const maxAttempts = options.maxAttempts ?? 2
  const geminiSchema = toGeminiSchema(options.schema)

  let lastError: AiValidationError | undefined
  let spentTokens = 0

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response: any = await withBackoff(() =>
      ai.models.generateContent({
        model: options.model ?? MODELS.fast,
        contents: buildContents(options.prompt),
        config: {
          systemInstruction: options.system,
          // Not 0 — greedy decoding makes repetition loops likely on list output.
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema: geminiSchema,
        },
      })
    )

    const raw = response.text ?? ""
    const usage = readUsage(response)
    spentTokens += usage.total // failed attempts still cost

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Reachable when a response is truncated at maxOutputTokens.
      lastError = new AiValidationError("Model returned unparseable JSON", raw)
      continue
    }

    const result = options.schema.safeParse(parsed)
    if (result.success) {
      return { data: result.data, usage: { ...usage, total: spentTokens } }
    }

    lastError = new AiValidationError(
      `Model output failed validation: ${result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
      raw
    )
  }

  throw lastError ?? new AiValidationError("Structured generation failed", "")
}

/** Yields text chunks; returns final token usage. */
export async function* streamText(
  options: GenerateOptions
): AsyncGenerator<string, TokenUsage> {
  const ai = getAiClient()
  const stream: any = await ai.models.generateContentStream({
    model: options.model ?? MODELS.fast,
    contents: buildContents(options.prompt),
    config: {
      systemInstruction: options.system,
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens,
    },
  })

  let usage: TokenUsage = { input: 0, output: 0, total: 0 }
  for await (const chunk of stream) {
    // Usage arrives on later chunks; keep the most recent.
    if (chunk?.usageMetadata) usage = readUsage(chunk)
    const text = chunk?.text
    if (text) yield text
  }
  return usage
}

/** `taskType` matters: storing and querying the same text yields different vectors. */
export async function embed(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[][]> {
  if (texts.length === 0) return []
  const ai = getAiClient()
  const response: any = await withBackoff(() =>
    ai.models.embedContent({
      model: MODELS.embedding,
      contents: texts,
      config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
    })
  )

  const vectors: number[][] = (response?.embeddings ?? []).map((e: any) => e?.values ?? [])
  if (vectors.length !== texts.length) {
    throw new Error(`Expected ${texts.length} embeddings, received ${vectors.length}`)
  }
  return vectors
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vectors must have equal length")
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denominator = Math.sqrt(magA) * Math.sqrt(magB)
  return denominator === 0 ? 0 : dot / denominator
}
