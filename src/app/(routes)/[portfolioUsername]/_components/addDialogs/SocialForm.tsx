"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { Check, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { socialIcons } from "../portfolioSocials/SocialMediaIcons"
import { fetchCurrent, normalizeUrl, savePortfolio, type CurrentPortfolio } from "./api"

type Platform = keyof typeof socialIcons

const PLATFORMS: Array<{ id: Platform; label: string; prefix: string; hosts: string[] }> = [
  { id: "github", label: "GitHub", prefix: "github.com/", hosts: ["github.com"] },
  { id: "linkedin", label: "LinkedIn", prefix: "linkedin.com/in/", hosts: ["linkedin.com"] },
  { id: "twitter", label: "X / Twitter", prefix: "x.com/", hosts: ["x.com", "twitter.com"] },
  { id: "instagram", label: "Instagram", prefix: "instagram.com/", hosts: ["instagram.com"] },
  { id: "youtube", label: "YouTube", prefix: "youtube.com/@", hosts: ["youtube.com", "youtu.be"] },
  { id: "medium", label: "Medium", prefix: "medium.com/@", hosts: ["medium.com"] },
  { id: "dribbble", label: "Dribbble", prefix: "dribbble.com/", hosts: ["dribbble.com"] },
  { id: "behance", label: "Behance", prefix: "behance.net/", hosts: ["behance.net"] },
  { id: "figma", label: "Figma", prefix: "figma.com/@", hosts: ["figma.com"] },
  { id: "awwwards", label: "Awwwards", prefix: "awwwards.com/", hosts: ["awwwards.com"] },
  { id: "spotify", label: "Spotify", prefix: "open.spotify.com/user/", hosts: ["open.spotify.com", "spotify.com"] },
  { id: "website", label: "Website", prefix: "", hosts: [] },
]

/** Any link from a site we don't recognise is saved as the personal website. */
function detectPlatform(url: string): Platform {
  const host = new URL(url).hostname.replace(/^www\./, "")
  const match = PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)))
  return match?.id ?? "website"
}

interface SocialFormProps {
  username: string
  initialLinks: Record<string, unknown> | undefined
  onSaved: (socialMedia: CurrentPortfolio["socialMedia"]) => void
  onDone: () => void
}

export default function SocialForm({ username, initialLinks, onSaved, onDone }: SocialFormProps) {
  const [value, setValue] = useState("")
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [added, setAdded] = useState<Set<string>>(
    () =>
      new Set(
        Object.entries(initialLinks ?? {})
          .filter(([key, v]) => key !== "order" && typeof v === "string" && v.trim())
          .map(([key]) => key)
      )
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const caretToEnd = useRef(false)

  // After a site chip fills the field, put the caret at the end before the
  // next keystroke can land in front of the prefix.
  useLayoutEffect(() => {
    if (!caretToEnd.current) return
    caretToEnd.current = false
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }, [value])

  const url = normalizeUrl(value)
  const platform = url ? detectPlatform(url) : null
  const meta = PLATFORMS.find((p) => p.id === platform)
  const replacing = platform ? added.has(platform) : false
  const error = touched && value.trim() && !url ? "That doesn't look like a link. Try something like github.com/you." : null
  const Icon = platform ? socialIcons[platform] : Globe

  const prefill = (p: (typeof PLATFORMS)[number]) => {
    setValue(p.prefix ? `https://${p.prefix}` : "https://")
    setTouched(false)
    caretToEnd.current = true
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!url || !platform) return
    setSaving(true)
    try {
      const current = await fetchCurrent(username)
      const links: Record<string, string> = {}
      for (const [key, v] of Object.entries(current.socialMedia ?? {})) {
        if (key !== "order" && typeof v === "string" && v.trim()) links[key] = v
      }
      links[platform] = url
      await savePortfolio(username, { socialLinks: links })
      // Read back so the page gets the saved order along with the links.
      const updated = await fetchCurrent(username).catch(() => null)
      onSaved(updated?.socialMedia ?? links)
      setAdded(new Set(Object.keys(links)))
      setValue("")
      setTouched(false)
      toast.success(replacing ? `${meta?.label} link updated` : `${meta?.label} link added`)
      inputRef.current?.focus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that link.")
    } finally {
      setSaving(false)
    }
  }

  const status = useMemo(() => {
    if (error) return <span className="text-red-600">{error}</span>
    if (!url || !meta) return <span>Paste any profile link. We&apos;ll work out which site it&apos;s from.</span>
    if (platform === "website") return <span>We&apos;ll show this as your website.</span>
    return (
      <span>
        <span className="font-medium text-foreground">{meta.label}</span>
        {replacing ? " is already on your page. Saving replaces the current link." : " detected."}
      </span>
    )
  }, [error, url, meta, platform, replacing])

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor="social-url" className="mb-1.5 block text-sm font-medium">
          Profile link
        </label>
        <div
          className={`flex h-11 items-center gap-2.5 rounded-xl border bg-background px-3 transition-colors focus-within:ring-2 focus-within:ring-foreground/10 ${
            error ? "border-red-500" : "border-border focus-within:border-foreground"
          }`}
        >
          <Icon className={`h-4 w-4 shrink-0 ${platform ? "text-foreground" : "text-muted-foreground"}`} aria-hidden />
          <input
            ref={inputRef}
            id="social-url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="github.com/yourname"
            autoComplete="url"
            inputMode="url"
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby="social-url-status"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p id="social-url-status" aria-live="polite" className="mt-1.5 text-sm text-muted-foreground">
          {status}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Or start from a site</p>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {PLATFORMS.map((p) => {
            const PlatformIcon = socialIcons[p.id]
            const isAdded = added.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => prefill(p)}
                className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
                  platform === p.id ? "border-foreground bg-muted" : "border-border"
                }`}
              >
                <PlatformIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{p.label}</span>
                {isAdded && (
                  <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-green-600" aria-label="added" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onDone} disabled={saving}>
          Done
        </Button>
        <Button type="submit" className="flex-1" disabled={saving || !url}>
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {replacing ? "Replace link" : "Add link"}
        </Button>
      </div>
    </form>
  )
}
