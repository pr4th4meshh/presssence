"use client"

import { MessageSquare, Send, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Turn = { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "What has he worked on recently?",
  "What technologies does he use?",
  "Tell me about his experience",
]

interface PortfolioChatProps {
  portfolioUsername: string
  ownerName: string
}

/**
 * Streaming chat over the portfolio's own content.
 *
 * Reads the response body as it arrives rather than awaiting the full text:
 * total latency is the same either way, but first token lands in ~500ms instead
 * of the user watching a spinner for several seconds.
 */
export default function PortfolioChat({ portfolioUsername, ownerName }: PortfolioChatProps) {
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [turns, streaming])

  // Abort an in-flight stream if the component unmounts mid-answer.
  useEffect(() => () => abortRef.current?.abort(), [])

  async function send(question: string) {
    const trimmed = question.trim()
    if (!trimmed || streaming) return

    const history = turns
    setTurns([...history, { role: "user", content: trimmed }, { role: "assistant", content: "" }])
    setInput("")
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioUsername, question: trimmed, history }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const message =
          res.status === 429
            ? "Too many questions right now — give it a minute."
            : ((await res.json().catch(() => null))?.message ?? "Something went wrong.")
        setTurns((prev) => [...prev.slice(0, -1), { role: "assistant", content: message }])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        // Replace the trailing placeholder turn on every chunk.
        setTurns((prev) => [...prev.slice(0, -1), { role: "assistant", content: answer }])
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return
      setTurns((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Couldn't reach the server. Try again?" },
      ])
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg transition-transform hover:scale-105"
        aria-label={`Ask about ${ownerName}`}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Ask about {ownerName.split(" ")[0]}</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[min(32rem,calc(100vh-3rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">Ask about {ownerName.split(" ")[0]}</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {turns.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500">
              Ask anything about {ownerName}&apos;s work, skills, or experience.
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div
            key={i}
            className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                turn.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-neutral-100 dark:bg-neutral-900"
              }`}
            >
              {turn.content ||
                (streaming && i === turns.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                  </span>
                ) : null)}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          maxLength={500}
          disabled={streaming}
          className="flex-1 rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-400 disabled:opacity-50 dark:border-neutral-800"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="rounded-lg bg-foreground p-2 text-background disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="px-3 pb-2 text-center text-[10px] text-neutral-400">
        AI-generated from this portfolio. May be inaccurate.
      </p>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"
      style={{ animationDelay: delay }}
    />
  )
}
