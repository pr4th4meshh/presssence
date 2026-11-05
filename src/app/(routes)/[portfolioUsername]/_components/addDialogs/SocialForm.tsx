"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Check, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { socialIcons } from "../portfolioSocials/SocialMediaIcons"
import { fetchCurrent, normalizeUrl, readSocials, updateSocials, type SocialState } from "./api"
import { PLATFORMS, detectPlatform, platformLabel, type Platform } from "./platforms"

interface SocialFormProps {
  username: string
  initialLinks: Record<string, unknown> | undefined
  /** When given, the form edits this one link instead of adding new ones. */
  editing?: { platform: string; url: string }
  onSaved: (socials: SocialState) => void
  onDone: () => void
}

export default function SocialForm({ username, initialLinks, editing, onSaved, onDone }: SocialFormProps) {
  const [value, setValue] = useState(editing?.url ?? "")
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [added, setAdded] = useState<Set<string>>(() => new Set(Object.keys(readSocials(initialLinks).links)))
  const inputRef = useRef<HTMLInputElement>(null)
  const caretToEnd = useRef(Boolean(editing))

  // The page's copy can be out of date; check what's actually saved.
  useEffect(() => {
    let cancelled = false
    fetchCurrent(username)
      .then((current) => !cancelled && setAdded(new Set(Object.keys(readSocials(current.socialMedia).links))))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [username])

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
  const detected = url ? detectPlatform(url) : null
  // When editing, the link stays on its platform. A personal website can be any domain.
  const platform: Platform | null = editing ? (editing.platform as Platform) : detected
  const wrongSite = Boolean(editing && detected && editing.platform !== "website" && detected !== editing.platform)
  const replacing = !editing && platform ? added.has(platform) : false
  const unchanged = Boolean(editing && url === normalizeUrl(editing.url))

  const error = !touched || !value.trim()
    ? null
    : !url
      ? "That doesn't look like a link. Try something like github.com/you."
      : wrongSite
        ? `That's a ${platformLabel(detected!)} link. Use a ${platformLabel(editing!.platform)} link here, or add it with Add a link.`
        : null
  const Icon = platform ? socialIcons[platform] ?? Globe : Globe

  const prefill = (p: (typeof PLATFORMS)[number]) => {
    setValue(p.prefix ? `https://${p.prefix}` : "https://")
    setTouched(false)
    caretToEnd.current = true
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!url || !platform || wrongSite) return
    if (unchanged) return onDone()
    setSaving(true)
    try {
      const next = await updateSocials(username, (s) => ({
        links: { ...s.links, [platform]: url },
        order: s.order.includes(platform) ? s.order : [...s.order, platform],
      }))
      onSaved(next)
      setAdded(new Set(Object.keys(next.links)))
      const label = platformLabel(platform)
      if (editing) {
        toast.success(`${label} link updated`)
        onDone()
        return
      }
      toast.success(replacing ? `${label} link updated` : `${label} link added`)
      setValue("")
      setTouched(false)
      inputRef.current?.focus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save that link.")
    } finally {
      setSaving(false)
    }
  }

  const status = useMemo(() => {
    if (error) return <span className="text-red-600">{error}</span>
    if (editing) return <span>Paste the new link. Visitors see the change straight away.</span>
    if (!url || !platform) return <span>Paste any profile link. We&apos;ll work out which site it&apos;s from.</span>
    if (platform === "website") return <span>We&apos;ll show this as your website.</span>
    return (
      <span>
        <span className="font-medium text-foreground">{platformLabel(platform)}</span>
        {replacing ? " is already on your page. Saving replaces the current link." : " detected."}
      </span>
    )
  }, [error, editing, url, platform, replacing])

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor="social-url" className="mb-1.5 block text-sm font-medium">
          {editing ? `${platformLabel(editing.platform)} link` : "Profile link"}
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

      {!editing && (
        <div>
          <p className="mb-2 text-sm font-medium">Or start from a site</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {PLATFORMS.map((p) => {
              const PlatformIcon = socialIcons[p.id]
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
                  {added.has(p.id) && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-green-600" aria-label="added" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onDone} disabled={saving}>
          {editing ? "Cancel" : "Done"}
        </Button>
        <Button type="submit" className="flex-1" disabled={saving || !url || wrongSite}>
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {editing ? "Save changes" : replacing ? "Replace link" : "Add link"}
        </Button>
      </div>
    </form>
  )
}
