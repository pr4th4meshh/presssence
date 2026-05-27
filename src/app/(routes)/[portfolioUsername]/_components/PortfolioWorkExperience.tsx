"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FiTrash2, FiEdit3, FiX, FiCheck } from "react-icons/fi"
import { Briefcase, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { WorkExperience } from "@/types"

function formatDate(value: string) {
  if (!value) return ""
  const [year, month] = value.split("-")
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

interface EntryFormState {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
  location: string
}

const emptyForm: EntryFormState = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
  location: "",
}

const EntryForm = ({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: EntryFormState
  onSave: (data: EntryFormState) => void
  onCancel: () => void
  isSaving: boolean
}) => {
  const [form, setForm] = useState(initial)
  const set = (field: keyof EntryFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="rounded-2xl border border-blue-400 bg-card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Company *</Label>
          <Input value={form.company} onChange={set("company")} placeholder="Acme Corp" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Role *</Label>
          <Input value={form.role} onChange={set("role")} placeholder="Senior Engineer" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Start Date *</Label>
          <Input type="month" value={form.startDate} onChange={set("startDate")} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">End Date <span className="normal-case font-normal">(leave blank for Present)</span></Label>
          <Input type="month" value={form.endDate} onChange={set("endDate")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Location</Label>
        <Input value={form.location} onChange={set("location")} placeholder="San Francisco, CA" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
        <Textarea value={form.description} onChange={set("description")} placeholder="What did you do here?" rows={3} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1" disabled={isSaving || !form.company || !form.role || !form.startDate} onClick={() => onSave(form)}>
          {isSaving ? "Saving…" : <><FiCheck size={13} className="mr-1.5" />Save</>}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
          <FiX size={13} className="mr-1.5" />Cancel
        </Button>
      </div>
    </div>
  )
}

interface PortfolioWorkExperienceProps {
  initialExperiences: WorkExperience[]
  userId: string
}

const PortfolioWorkExperience = ({ initialExperiences, userId }: PortfolioWorkExperienceProps) => {
  const [experiences, setExperiences] = useState<WorkExperience[]>(initialExperiences)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: session } = useSession()
  const params = useParams<{ portfolioUsername: string }>()
  const isOwner = session?.user?.id === userId

  if (!isOwner && experiences.length === 0) return null

  const handleAdd = async (form: EntryFormState) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/work-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, portfolioUsername: params.portfolioUsername }),
      })
      if (!res.ok) throw new Error()
      const created: WorkExperience = await res.json()
      setExperiences((prev) => [...prev, created])
      setIsAdding(false)
      toast.success("Experience added")
    } catch {
      toast.error("Failed to add experience")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (id: string, form: EntryFormState) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/work-experience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const updated: WorkExperience = await res.json()
      setExperiences((prev) => prev.map((e) => (e.id === id ? updated : e)))
      setEditingId(null)
      toast.success("Experience updated")
    } catch {
      toast.error("Failed to update experience")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/work-experience/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setExperiences((prev) => prev.filter((e) => e.id !== id))
      toast.success("Experience removed")
    } catch {
      toast.error("Failed to remove experience")
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(experiences)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setExperiences(reordered)
    await Promise.all(
      reordered.map((e, i) =>
        fetch(`/api/work-experience/${e.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: i }),
        })
      )
    )
  }

  return (
    <div className="section-border py-10 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Experience
        </h2>
        {isOwner && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6">
          <EntryForm
            initial={emptyForm}
            onSave={handleAdd}
            onCancel={() => setIsAdding(false)}
            isSaving={isSaving}
          />
        </div>
      )}

      {experiences.length === 0 && !isAdding ? (
        isOwner ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Briefcase size={28} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">No experience added yet.</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={() => setIsAdding(true)}>
              Add experience
            </Button>
          </div>
        ) : null
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="work-experience">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <Draggable
                      key={exp.id}
                      draggableId={exp.id}
                      index={index}
                      isDragDisabled={!isOwner || editingId === exp.id}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative pl-8 group/entry transition-all ${snapshot.isDragging ? "opacity-90 scale-[1.01]" : ""}`}
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 border-border bg-background flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                          </div>

                          {editingId === exp.id ? (
                            <EntryForm
                              initial={{
                                company: exp.company,
                                role: exp.role,
                                startDate: exp.startDate,
                                endDate: exp.endDate ?? "",
                                description: exp.description ?? "",
                                location: exp.location ?? "",
                              }}
                              onSave={(form) => handleUpdate(exp.id, form)}
                              onCancel={() => setEditingId(null)}
                              isSaving={isSaving}
                            />
                          ) : (
                            <div className="rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="project-card-title font-semibold text-base leading-snug">{exp.role}</p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                    <span className="project-card-desc text-sm font-medium">{exp.company}</span>
                                    {exp.location && (
                                      <>
                                        <span className="project-card-date text-xs">·</span>
                                        <span className="project-card-date text-xs flex items-center gap-1">
                                          <MapPin size={10} />
                                          {exp.location}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <p className="project-card-date text-xs mt-1">
                                    {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : "Present"}
                                  </p>
                                  {exp.description && (
                                    <p className="project-card-desc text-sm mt-2 leading-relaxed">{exp.description}</p>
                                  )}
                                </div>

                                {isOwner && (
                                  <div className="flex gap-1 opacity-0 group-hover/entry:opacity-100 transition-opacity shrink-0">
                                    <button
                                      onClick={() => setEditingId(exp.id)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                      <FiEdit3 size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(exp.id)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                      <FiTrash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}

export default PortfolioWorkExperience
