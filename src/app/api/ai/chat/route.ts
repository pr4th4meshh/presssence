import {
  buildChatPrompt,
  looksLikeInjection,
  MAX_HISTORY_TURNS,
  MAX_QUESTION_CHARS,
  type ChatTurn,
} from "@/lib/ai/chat"
import { MODELS } from "@/lib/ai/models"
import { streamText } from "@/lib/ai/provider"
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit"
import { ensureFreshIndex, retrieve } from "@/lib/ai/retrieval"
import { prisma } from "@/lib/prisma"
import { parseBody } from "@/lib/validations"
import { NextResponse } from "next/server"
import { z } from "zod"

export const maxDuration = 60

const ChatSchema = z.object({
  portfolioUsername: z.string().min(1).max(30),
  question: z.string().min(1).max(MAX_QUESTION_CHARS),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        // History is client-supplied and therefore forgeable. Capping length
        // bounds how much text an attacker can smuggle in through it.
        content: z.string().max(2000),
      })
    )
    .max(MAX_HISTORY_TURNS * 2)
    .default([]),
})

export async function POST(req: Request) {
  try {
    const parsed = await parseBody(req, ChatSchema)
    if (parsed.error) return parsed.error
    const { portfolioUsername, question } = parsed.data
    // parseBody's generic ties Zod's input and output types together, so a
    // `.default([])` field still reads as optional here even though the parser
    // has already filled it in.
    const history = parsed.data.history ?? []

    // Public endpoint: 20 questions per 10 minutes per IP. Generous for a real
    // visitor, low enough that a script can't drain the daily model quota.
    const limit = await checkRateLimit(getClientKey(req, "chat"), 20, 600)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: "Too many questions. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      )
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { username: portfolioUsername },
      select: { id: true, fullName: true },
    })
    if (!portfolio) {
      return NextResponse.json({ message: "Portfolio not found" }, { status: 404 })
    }

    if (looksLikeInjection(question)) {
      return NextResponse.json(
        {
          message: `I can only answer questions about ${portfolio.fullName}'s work and background.`,
        },
        { status: 400 }
      )
    }

    // Once per conversation, not per message — the check costs a few queries.
    if (history.length === 0) await ensureFreshIndex(portfolio.id)

    const chunks = await retrieve(portfolio.id, question)
    const { system, prompt } = buildChatPrompt(
      portfolio.fullName,
      question,
      chunks,
      history as ChatTurn[]
    )

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamText({
            system,
            prompt,
            model: MODELS.fast,
            temperature: 0.3,
            maxOutputTokens: 600,
          })) {
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error) {
          console.error("Chat stream failed:", error)
          // Headers are already sent, so there is no status code left to set —
          // the only way to surface a failure is in the stream body itself.
          controller.enqueue(encoder.encode("\n\n[Sorry — something went wrong.]"))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        // Tells the client whether the answer had any grounding at all.
        "X-Context-Chunks": String(chunks.length),
      },
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
