"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { FiTrash2, FiPlus } from "react-icons/fi"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
import { Photo } from "@/types"

const MAX_PHOTOS = 8
const GAP = 8

const SIZES = [
  { w: 1, h: 1, label: "1×1" },
  { w: 2, h: 1, label: "2×1" },
  { w: 1, h: 2, label: "1×2" },
  { w: 2, h: 2, label: "2×2" },
] as const

// pixel size of a cell that spans `units` grid units
function px(units: number, cellSize: number) {
  return units * cellSize + (units - 1) * GAP
}

interface PortfolioGalleryProps {
  initialPhotos: Photo[]
  userId: string
}

export default function PortfolioGallery({ initialPhotos, userId }: PortfolioGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(
    [...initialPhotos]
      .map((p) => ({ ...p, w: Math.min(Math.max(p.w, 1), 2), h: Math.min(Math.max(p.h, 1), 2) }))
      .sort((a, b) => a.x - b.x)
  )
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cols, setCols] = useState(4)
  const [cellSize, setCellSize] = useState(200)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const params = useParams<{ portfolioUsername: string }>()
  const { data: session } = useSession()
  const isOwner = session?.user?.id === userId

  useEffect(() => {
    const el = gridContainerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth
      const c = w < 480 ? 2 : 4
      const size = Math.floor((w - (c - 1) * GAP) / c)
      setCols(c)
      setCellSize(size)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const persist = async (next: Photo[]) => {
    await fetch("/api/photos/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioUsername: params.portfolioUsername,
        // x stores the order index; y unused
        layout: next.map((p, i) => ({ id: p.id, x: i, y: 0, w: p.w, h: p.h })),
      }),
    })
  }

  // ── drag-to-reorder ──────────────────────────────────────────────────────────
  const onDragStart = (id: string) => setDragId(id)

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setOverId(id)
  }

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setOverId(null)
    if (!dragId || dragId === targetId) { setDragId(null); return }
    const next = [...photos]
    const from = next.findIndex((p) => p.id === dragId)
    const to = next.findIndex((p) => p.id === targetId)
    ;[next[from], next[to]] = [next[to], next[from]]
    setPhotos(next)
    persist(next)
    setDragId(null)
  }

  const onDragEnd = () => { setDragId(null); setOverId(null) }

  // ── resize ───────────────────────────────────────────────────────────────────
  const handleResize = (id: string, w: number, h: number) => {
    const next = photos.map((p) => (p.id === id ? { ...p, w, h } : p))
    setPhotos(next)
    persist(next)
  }

  // ── upload ───────────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = URL.createObjectURL(file)
    setPreviewUrl(blob)
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, "presssence/gallery")
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url, w: 1, h: 1,
          x: photos.length, y: 0,
          portfolioUsername: params.portfolioUsername,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
      const photo: Photo = await res.json()
      setPhotos((prev) => [...prev, { ...photo, w: 1, h: 1 }])
      toast.success("Photo added")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      URL.revokeObjectURL(blob); setPreviewUrl(null); setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      const next = photos.filter((p) => p.id !== id)
      setPhotos(next)
      persist(next)
      toast.success("Photo removed")
    } catch { toast.error("Failed to remove photo") }
  }

  if (!isOwner && photos.length === 0) return null

  return (
    <div className="section-border py-10 border-t border-border">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Gallery
        </h2>
        {isOwner && photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            + Add
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* empty state */}
      {photos.length === 0 && !uploading ? (
        isOwner ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <ImageIcon size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">No photos yet.</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={() => fileInputRef.current?.click()}>
              <FiPlus size={11} /> Add photo
            </Button>
          </div>
        ) : null
      ) : (
        <div
          ref={gridContainerRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridAutoRows: `${cellSize}px`,
            gridAutoFlow: "row dense",
            gap: GAP,
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              draggable={isOwner}
              onDragStart={() => onDragStart(photo.id)}
              onDragOver={(e) => onDragOver(e, photo.id)}
              onDrop={(e) => onDrop(e, photo.id)}
              onDragEnd={onDragEnd}
              style={{
                gridColumn: `span ${photo.w}`,
                gridRow: `span ${photo.h}`,
                width: px(photo.w, cellSize),
                height: px(photo.h, cellSize),
                transition: "width 300ms ease, height 300ms ease, opacity 200ms ease",
              }}
              className={`group/photo relative overflow-hidden rounded-2xl border bg-muted cursor-grab active:cursor-grabbing
                ${dragId === photo.id ? "opacity-40" : "opacity-100"}
                ${overId === photo.id && dragId !== photo.id ? "border-blue-400" : "border-border"}
              `}
            >
              <Image
                src={photo.url}
                alt="Gallery photo"
                fill
                className="object-cover pointer-events-none"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {isOwner && (
                <>
                  {/* delete */}
                  <button
                    draggable={false}
                    onClick={() => handleDelete(photo.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center bg-black/60 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <FiTrash2 size={12} />
                  </button>

                  {/* size picker */}
                  <div
                    draggable={false}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                  >
                    {SIZES.map((s) => (
                      <button
                        key={s.label}
                        draggable={false}
                        onClick={() => handleResize(photo.id, s.w, s.h)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
                          photo.w === s.w && photo.h === s.h
                            ? "bg-white text-black"
                            : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* uploading preview */}
          {uploading && previewUrl && (
            <div
              style={{ gridColumn: "span 1", gridRow: "span 1", width: cellSize, height: cellSize }}
              className="relative overflow-hidden rounded-2xl border border-blue-400 border-dashed"
            >
              <Image src={previewUrl} alt="Uploading…" fill className="object-cover opacity-60" unoptimized />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      )}

      {isOwner && photos.length >= MAX_PHOTOS && (
        <p className="text-xs text-muted-foreground text-center mt-4">Maximum {MAX_PHOTOS} photos reached.</p>
      )}
    </div>
  )
}
