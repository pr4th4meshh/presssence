"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { fetchCurrent, updateFeatures } from "./api"

const SUGGESTIONS = [
  "React", "TypeScript", "Next.js", "Node.js", "Python", "Figma",
  "UI/UX", "Tailwind CSS", "PostgreSQL", "GraphQL", "AWS", "Docker",
]

const MAX_SKILL_LENGTH = 40

interface SkillsFormProps {
  username: string
  existing: string[]
  onSaved: (features: string[]) => void
  onDone: () => void
}

const key = (s: string) => s.trim().toLowerCase()

export default function SkillsForm({ username, existing: initialExisting, onSaved, onDone }: SkillsFormProps) {
  const [existing, setExisting] = useState(initialExisting)
  const [pending, setPending] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // The page's copy can be out of date; check what's actually saved.
  useEffect(() => {
    let cancelled = false
    fetchCurrent(username)
      .then((current) => !cancelled && setExisting(current.features ?? []))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [username])

  const taken = new Set([...existing, ...pending].map(key))

  /** Adds each comma-separated piece, skipping blanks and duplicates. */
  const stage = (raw: string) => {
    const pieces = raw.split(/[,\n]/).map((s) => s.trim().slice(0, MAX_SKILL_LENGTH)).filter(Boolean)
    const seen = new Set(taken)
    const fresh: string[] = []
    const dupes: string[] = []
    for (const piece of pieces) {
      if (seen.has(key(piece))) dupes.push(piece)
      else {
        seen.add(key(piece))
        fresh.push(piece)
      }
    }
    if (fresh.length) setPending((p) => [...p, ...fresh])
    setHint(dupes.length ? `${dupes.join(", ")} ${dupes.length === 1 ? "is" : "are"} already on your list.` : null)
    setDraft("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
      e.preventDefault()
      stage(draft)
    } else if (e.key === "Backspace" && !draft && pending.length) {
      setPending((p) => p.slice(0, -1))
    }
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (/[,\n]/.test(text)) {
      e.preventDefault()
      stage(draft + text)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Whatever is still typed counts too, so nobody loses a skill for not pressing Enter.
    const toAdd = draft.trim() ? [...pending, draft.trim().slice(0, MAX_SKILL_LENGTH)] : pending
    if (!toAdd.length) return
    setSaving(true)
    try {
      const merged = await updateFeatures(username, (current) => {
        const currentKeys = new Set(current.map(key))
        return [...current, ...toAdd.filter((s) => !currentKeys.has(key(s)))]
      })
      onSaved(merged)
      toast.success(toAdd.length === 1 ? `Added ${toAdd[0]}` : `Added ${toAdd.length} skills`)
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your skills.")
    } finally {
      setSaving(false)
    }
  }

  const count = pending.length + (draft.trim() ? 1 : 0)
  const suggestions = SUGGESTIONS.filter((s) => !taken.has(key(s)))

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor="skill-input" className="mb-1.5 block text-sm font-medium">
          Skills
        </label>
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex min-h-11 cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-1.5 transition-colors focus-within:border-foreground focus-within:ring-2 focus-within:ring-foreground/10"
        >
          {pending.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-foreground py-1 pl-2.5 pr-1 text-sm text-background"
            >
              {skill}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPending((p) => p.filter((s) => s !== skill))
                }}
                className="rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-background"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id="skill-input"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setHint(null)
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            maxLength={MAX_SKILL_LENGTH}
            placeholder={pending.length ? "Add another" : "e.g. React, Figma, Copywriting"}
            autoFocus
            aria-describedby="skill-hint"
            className="h-8 min-w-[8rem] flex-1 bg-transparent px-1 text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p id="skill-hint" aria-live="polite" className="mt-1.5 text-sm text-muted-foreground">
          {hint ?? "Press Enter or type a comma after each one. You can paste a list."}
        </p>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  stage(s)
                  inputRef.current?.focus()
                }}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
              >
                <Plus className="h-3 w-3" aria-hidden />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {existing.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Already on your page: {existing.slice(0, 8).join(", ")}
          {existing.length > 8 && ` and ${existing.length - 8} more`}
        </p>
      )}

      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={saving || count === 0}>
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {count > 1 ? `Add ${count} skills` : "Add skill"}
        </Button>
      </div>
    </form>
  )
}
