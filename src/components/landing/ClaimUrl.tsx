"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, Loader2, X } from "lucide-react"
import { saveClaimedUsername } from "@/lib/claimedUsername"

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; reason: string }
  | { kind: "error" }

/** Same rules as the server: lowercase letters, numbers and underscores. */
const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20)

export default function ClaimUrl() {
  const { status: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const inputRef = useRef<HTMLInputElement>(null)
  const latest = useRef("")

  useEffect(() => {
    latest.current = name
    if (name.length < 3) {
      setStatus(name ? { kind: "unavailable", reason: "Use at least 3 characters" } : { kind: "idle" })
      return
    }
    setStatus({ kind: "checking" })
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/checkUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name }),
        })
        const data = await res.json()
        // A slower answer for an earlier name shouldn't overwrite the current one.
        if (latest.current !== name) return
        if (!res.ok) return setStatus({ kind: "error" })
        setStatus(data.available ? { kind: "available" } : { kind: "unavailable", reason: data.reason ?? "That name is taken" })
      } catch {
        if (latest.current === name) setStatus({ kind: "error" })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [name])

  const claim = (e: React.FormEvent) => {
    e.preventDefault()
    if (status.kind !== "available") return inputRef.current?.focus()
    saveClaimedUsername(name)
    router.push(session === "authenticated" ? "/me" : "/auth/signup")
  }

  return (
    <section className="bg-[#f5f5f5] px-4 pb-28 pt-8 sm:pb-36" aria-labelledby="claim-heading">
      <div className="mx-auto max-w-5xl border-t border-neutral-300 pt-16 sm:pt-24">
        <h2 id="claim-heading" className="text-[17px] text-neutral-500">
          Your portfolio is one name away.
        </h2>

        <form onSubmit={claim} noValidate className="mt-6">
          <label htmlFor="claim-name" className="sr-only">
            Choose your username
          </label>
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex cursor-text flex-wrap items-baseline text-[2.6rem] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[4.5rem] lg:text-[5.5rem]"
          >
            <span className="text-neutral-300">presssence.me/</span>
            <input
              ref={inputRef}
              id="claim-name"
              value={name}
              onChange={(e) => setName(clean(e.target.value))}
              placeholder="yourname"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={20}
              size={Math.max(name.length, 8)}
              aria-describedby="claim-status"
              aria-invalid={status.kind === "unavailable"}
              className="min-w-0 max-w-full bg-transparent text-black caret-black outline-none placeholder:text-black/15"
            />
          </div>
          <div className="mt-2 h-px w-full bg-neutral-300" aria-hidden />

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p id="claim-status" aria-live="polite" className="flex min-h-6 items-center gap-2 text-[15px]">
              {status.kind === "idle" && <span className="text-neutral-500">Free, and you can change it later.</span>}
              {status.kind === "checking" && (
                <span className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking
                </span>
              )}
              {status.kind === "available" && (
                <span className="flex items-center gap-2 font-medium text-black">
                  <Check className="h-4 w-4" aria-hidden /> presssence.me/{name} is yours to take.
                </span>
              )}
              {status.kind === "unavailable" && (
                <span className="flex items-center gap-2 text-neutral-600">
                  <X className="h-4 w-4" aria-hidden /> {status.reason}
                </span>
              )}
              {status.kind === "error" && <span className="text-neutral-600">Couldn&apos;t check right now. Try again.</span>}
            </p>

            <div className="flex items-center gap-5">
              {session !== "authenticated" && (
                <Link href="/auth/login" className="text-[15px] text-neutral-500 transition-colors hover:text-black">
                  I have an account
                </Link>
              )}
              <button
                type="submit"
                aria-disabled={status.kind !== "available"}
                className={`h-12 rounded-full px-7 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f5] ${
                  status.kind === "available" ? "bg-black text-white hover:bg-neutral-800" : "bg-neutral-200 text-neutral-500"
                }`}
              >
                Claim it
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
