"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
import { fetchCurrent, normalizeUrl, savePortfolio } from "./api"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const TITLE_MAX = 100
const DESCRIPTION_MAX = 500

export interface ExistingProject {
  id?: string
  title: string
  description?: string | null
  link?: string | null
  timeline?: string | null
  coverImage?: string | null
  position?: number
}

interface ProjectFormProps {
  username: string
  /** When given, the form edits this project instead of adding a new one. */
  project?: ExistingProject
  onSaved: (projects: ExistingProject[]) => void
  onDone: () => void
}

/** "2025-03" and "2025-03-14" fit the month picker; anything else is free text from older entries. */
const toMonth = (timeline: string | null | undefined) =>
  timeline && /^\d{4}-\d{2}(-\d{2})?$/.test(timeline) ? timeline.slice(0, 7) : ""

type Errors = Partial<Record<"title" | "link" | "cover", string>>

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-background px-3 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/10 ${
    invalid ? "border-red-500" : "border-border focus:border-foreground"
  }`

function Counter({ value, max }: { value: number; max: number }) {
  if (value < max * 0.8) return null
  return (
    <span className={`text-xs tabular-nums ${value >= max ? "text-red-600" : "text-muted-foreground"}`}>
      {value}/{max}
    </span>
  )
}

export default function ProjectForm({ username, project, onSaved, onDone }: ProjectFormProps) {
  const editing = Boolean(project?.id)
  const [title, setTitle] = useState(project?.title ?? "")
  const [description, setDescription] = useState(project?.description ?? "")
  const [link, setLink] = useState(project?.link ?? "")
  const [month, setMonth] = useState(toMonth(project?.timeline))
  // Older projects may have a free-text timeline the month picker can't show.
  // Keep it unless the owner picks a month or clears it.
  const [legacyTimeline, setLegacyTimeline] = useState(
    project?.timeline && !toMonth(project.timeline) ? project.timeline : ""
  )
  const [cover, setCover] = useState<{ preview: string; url: string | null } | null>(
    project?.coverImage ? { preview: project.coverImage, url: project.coverImage } : null
  )
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const uploadId = useRef(0)

  const uploading = cover !== null && cover.url === null

  // Free the local preview when it's replaced, removed or the dialog closes.
  const previewUrl = cover?.preview
  useEffect(() => () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const pickImage = async (file: File | undefined) => {
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, cover: "Use a JPG, PNG, WebP or GIF image." }))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, cover: "That image is over 5 MB. Try a smaller one." }))
      return
    }
    setErrors((e) => ({ ...e, cover: undefined }))
    const id = ++uploadId.current
    const preview = URL.createObjectURL(file)
    setCover({ preview, url: null })
    try {
      const url = await uploadToCloudinary(file, "presssence/projects")
      // Ignore a finished upload if the image was removed or replaced meanwhile.
      if (id === uploadId.current) setCover({ preview, url })
    } catch {
      if (id === uploadId.current) {
        setCover(null)
        setErrors((e) => ({ ...e, cover: "The upload failed. Try again or skip the image." }))
      }
    }
  }

  const removeImage = () => {
    uploadId.current++
    setCover(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const validate = (): { errors: Errors; url: string } => {
    const next: Errors = {}
    if (!title.trim()) next.title = "Give your project a title."
    const url = link.trim() ? normalizeUrl(link) : ""
    if (url === null) next.link = "That doesn't look like a link. Try something like myapp.com."
    return { errors: next, url: url ?? "" }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { errors: next, url } = validate()
    setErrors((prev) => ({ ...next, cover: prev.cover }))
    if (next.title) {
      titleRef.current?.focus()
      return
    }
    if (next.link || uploading) return

    setSaving(true)
    try {
      const current = await fetchCurrent(username)
      const fields = {
        title: title.trim(),
        description: description.trim(),
        link: url,
        timeline: month || legacyTimeline,
        coverImage: cover?.url ?? "",
      }
      // Only this one project is sent. The server updates rows with an id,
      // creates rows without one, and leaves every other project as it is.
      if (editing) {
        const saved = current.projects.find((p) => p.id === project!.id)
        if (!saved) {
          // Deleted in another tab or device: show the real list instead of an error to puzzle over.
          onSaved(current.projects as ExistingProject[])
          toast.error("This project was already deleted, so there was nothing to save.")
          onDone()
          return
        }
        await savePortfolio(username, { projects: [{ id: project!.id, ...fields, position: saved.position }] })
      } else {
        const position = current.projects.reduce((max, p) => Math.max(max, p.position + 1), current.projects.length)
        await savePortfolio(username, { projects: [{ ...fields, position }] })
      }
      const updated = await fetchCurrent(username)
      onSaved(updated.projects as ExistingProject[])
      toast.success(editing ? "Changes saved" : `${fields.title} added`)
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your project.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!project?.id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" })
      // Already gone counts as done.
      if (!res.ok && res.status !== 404) throw new Error()
      const updated = await fetchCurrent(username)
      onSaved(updated.projects as ExistingProject[])
      toast.success(`${project.title} deleted`)
      onDone()
    } catch {
      toast.error("Couldn't delete this project. Try again.")
      setDeleting(false)
    }
  }

  const busy = saving || deleting

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="project-title" className="text-sm font-medium">
            Title
          </label>
          <Counter value={title.length} max={TITLE_MAX} />
        </div>
        <input
          ref={titleRef}
          id="project-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors((x) => ({ ...x, title: undefined }))
          }}
          maxLength={TITLE_MAX}
          placeholder="What's it called?"
          autoFocus
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "project-title-error" : undefined}
          className={`h-11 ${inputClass(Boolean(errors.title))}`}
        />
        {errors.title && (
          <p id="project-title-error" className="mt-1.5 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="project-description" className="text-sm font-medium">
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Counter value={description.length} max={DESCRIPTION_MAX} />
        </div>
        <textarea
          id="project-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={3}
          placeholder="What it does, and what you did on it"
          className={`resize-none py-2.5 ${inputClass(false)}`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <div>
          <label htmlFor="project-link" className="mb-1.5 block text-sm font-medium">
            Link <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="project-link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value)
              if (errors.link) setErrors((x) => ({ ...x, link: undefined }))
            }}
            onBlur={() => {
              if (!link.trim()) return
              const url = normalizeUrl(link)
              if (url) setLink(url)
              else setErrors((x) => ({ ...x, link: "That doesn't look like a link. Try something like myapp.com." }))
            }}
            inputMode="url"
            placeholder="myapp.com"
            aria-invalid={Boolean(errors.link)}
            aria-describedby={errors.link ? "project-link-error" : undefined}
            className={`h-11 ${inputClass(Boolean(errors.link))}`}
          />
        </div>
        <div>
          <label htmlFor="project-month" className="mb-1.5 block text-sm font-medium">
            Finished <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="project-month"
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value)
              setLegacyTimeline("")
            }}
            max={new Date().toISOString().slice(0, 7)}
            className={`h-11 ${inputClass(false)}`}
          />
        </div>
        {legacyTimeline && (
          <p className="-mt-2 text-sm text-muted-foreground sm:col-span-2">
            Saved as &ldquo;{legacyTimeline}&rdquo;. Pick a month to replace it, or{" "}
            <button type="button" onClick={() => setLegacyTimeline("")} className="underline underline-offset-2 hover:text-foreground">
              remove it
            </button>
            .
          </p>
        )}
        {errors.link && (
          <p id="project-link-error" className="-mt-2 text-sm text-red-600 sm:col-span-2">
            {errors.link}
          </p>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">
          Cover image <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        {cover ? (
          <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={cover.preview} alt="Cover preview" className="h-full w-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm text-white">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              pickImage(e.dataTransfer.files[0])
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition-colors hover:border-foreground/40 hover:bg-muted/50 focus-within:ring-2 focus-within:ring-foreground/10 ${
              errors.cover ? "border-red-500" : "border-border"
            }`}
          >
            <ImagePlus className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-sm">
              <span className="font-medium">Choose an image</span>
              <span className="text-muted-foreground"> or drop it here. JPG, PNG, WebP or GIF, up to 5 MB.</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              onChange={(e) => pickImage(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
        )}
        {errors.cover ? (
          <p className="mt-1.5 text-sm text-red-600">{errors.cover}</p>
        ) : (
          !cover && <p className="mt-1.5 text-sm text-muted-foreground">Without one, we make a cover from the title.</p>
        )}
      </div>

      {confirmingDelete ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:flex-row sm:items-center dark:border-red-900/50 dark:bg-red-950/30">
          <p className="flex-1 text-sm text-red-900 dark:text-red-200">
            Delete <span className="font-medium">{project?.title}</span>? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmingDelete(false)} disabled={deleting} autoFocus>
              Keep it
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={deleting}>
              {deleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Delete project
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 border-t border-border pt-4">
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
              className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4 sm:mr-1.5" aria-hidden />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Button type="button" variant="outline" className="flex-1" onClick={onDone} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={busy || uploading}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {uploading ? "Uploading image" : editing ? "Save changes" : "Add project"}
          </Button>
        </div>
      )}
    </form>
  )
}
