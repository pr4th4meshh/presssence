"use client"

import { Button } from "@/components/ui/button"
import type { FormData as PortfolioFormData } from "@/lib/validations"
import { AlertCircle, FileUp, Loader2, Sparkles, X } from "lucide-react"
import { useRef, useState } from "react"
import type { UseFormSetValue } from "react-hook-form"
import { toast } from "sonner"

/** Mirrors ResumeExtractionSchema on the server. */
type Extraction = {
  fullName: string
  profession: string
  headline: string
  skills: string[]
  workExperience: Array<{
    company: string
    role: string
    startDate: string
    endDate?: string
    location?: string
    description?: string
  }>
  projects: Array<{ title: string; description: string; link?: string; timeline?: string }>
  socialLinks: Partial<Record<"github" | "linkedin" | "twitter" | "website", string>>
}

interface ResumeImportProps {
  setValue: UseFormSetValue<PortfolioFormData>
  /**
   * Fires after the form is populated. Needed because two pieces of onboarding
   * state live outside react-hook-form: skills (submitted from a
   * `selectedFeatures` useState, not the form value) and work experience
   * (no form field — POSTed separately once the portfolio row exists).
   */
  onApplied?: (extraction: Extraction) => void
}

/**
 * Upload, review, then apply. The review step is deliberate: auto-filling would
 * be one click faster, but the model will occasionally get a title or date
 * wrong, and a user who never saw the extraction can't know what to check.
 */
export default function ResumeImport({ setValue, onApplied }: ResumeImportProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle")
  const [extraction, setExtraction] = useState<Extraction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setStatus("loading")
    setError(null)

    const body = new FormData()
    body.append("file", file)

    try {
      const res = await fetch("/api/ai/resume-import", { method: "POST", body })
      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? "Import failed")
        setStatus("idle")
        return
      }

      setExtraction(json.data)
      setStatus("ready")
    } catch {
      setError("Could not reach the server. Check your connection and try again.")
      setStatus("idle")
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError("That file is larger than 4MB.")
      return
    }
    upload(file)
  }

  // Only overwrite fields the model actually found something for.
  function applyToForm() {
    if (!extraction) return

    if (extraction.fullName) setValue("fullName", extraction.fullName)
    if (extraction.profession) setValue("profession", extraction.profession.slice(0, 50))
    if (extraction.headline) setValue("headline", extraction.headline.slice(0, 160))
    if (extraction.skills.length) setValue("features", extraction.skills)

    if (extraction.projects.length) {
      setValue(
        "projects",
        extraction.projects.map((p) => ({
          title: p.title,
          description: p.description,
          link: p.link ?? "",
          timeline: p.timeline ?? "",
          coverImage: "",
        }))
      )
    }

    const socials = Object.fromEntries(
      Object.entries(extraction.socialLinks).filter(([, v]) => Boolean(v))
    )
    if (Object.keys(socials).length) {
      setValue("socialLinks", socials as PortfolioFormData["socialLinks"])
    }

    onApplied?.(extraction)

    toast.success("Resume applied", {
      description: "Review each step — AI extraction is a starting point, not gospel.",
    })
    setStatus("idle")
    setExtraction(null)
  }

  if (status === "ready" && extraction) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Here&apos;s what we found
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Check it over before applying — anything wrong is easier to fix now.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus("idle")
              setExtraction(null)
            }}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Discard extraction"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Name" value={extraction.fullName} />
          <Row label="Title" value={extraction.profession} />
          <Row label="Headline" value={extraction.headline} />
          {extraction.skills.length > 0 && (
            <div>
              <dt className="text-neutral-500">Skills ({extraction.skills.length})</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {extraction.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
                  >
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {extraction.workExperience.length > 0 && (
            <div>
              <dt className="text-neutral-500">Experience</dt>
              <dd className="mt-1 space-y-1">
                {extraction.workExperience.map((w, i) => (
                  <div key={`${w.company}-${i}`}>
                    <span className="font-medium">{w.role}</span> at {w.company}
                    <span className="text-neutral-500">
                      {" "}
                      · {w.startDate} – {w.endDate ?? "Present"}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
          )}
          {extraction.projects.length > 0 && (
            <div>
              <dt className="text-neutral-500">Projects</dt>
              <dd className="mt-1 space-y-1">
                {extraction.projects.map((p, i) => (
                  <div key={`${p.title}-${i}`}>
                    <span className="font-medium">{p.title}</span>
                    {p.timeline ? <span className="text-neutral-500"> · {p.timeline}</span> : null}
                  </div>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex gap-2">
          <Button type="button" onClick={applyToForm} className="flex-1">
            Apply to my portfolio
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("idle")
              setExtraction(null)
            }}
          >
            Discard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => status !== "loading" && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20"
            : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700"
        } ${status === "loading" ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {status === "loading" ? (
          <>
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-violet-500" />
            <p className="text-sm font-medium">Reading your resume…</p>
            <p className="mt-1 text-xs text-neutral-500">This usually takes 5–10 seconds.</p>
          </>
        ) : (
          <>
            <FileUp className="mb-2 h-6 w-6 text-neutral-400" />
            <p className="text-sm font-medium">Skip the typing — upload your resume</p>
            <p className="mt-1 text-xs text-neutral-500">PDF, TXT or MD · up to 4MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
