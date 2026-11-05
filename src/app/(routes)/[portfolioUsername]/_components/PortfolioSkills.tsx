"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { openAddDialog } from "./addDialogEvents"
import { updateFeatures } from "./addDialogs/api"

const MAX_SKILL_LENGTH = 40
const key = (s: string) => s.trim().toLowerCase()

const chipClass =
  "skill-badge inline-flex items-center rounded-full border text-sm font-medium dark:bg-neutral-800 bg-gray-100 dark:text-gray-200 text-gray-700 dark:border-neutral-700 border-gray-200"

/** Inline rename. Enter or clicking away saves, Escape cancels. */
function SkillEditor({
  skill,
  isTaken,
  onCommit,
  onCancel,
}: {
  skill: string
  isTaken: (value: string) => boolean
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(skill)
  const [error, setError] = useState<string | null>(null)
  const done = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  const cancel = () => {
    done.current = true
    onCancel()
  }

  /** Enter keeps the field open to fix a duplicate; clicking away drops the change instead. */
  const commit = (fromBlur: boolean) => {
    if (done.current) return
    const next = value.trim()
    if (!next || next === skill) return cancel()
    if (key(next) !== key(skill) && isTaken(next)) {
      if (fromBlur) {
        toast.error(`${next} is already on your list`)
        return cancel()
      }
      return setError(`${next} is already on your list`)
    }
    done.current = true
    onCommit(next)
  }

  return (
    <span className="relative inline-flex">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError(null)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit(false)
          } else if (e.key === "Escape") {
            e.preventDefault()
            cancel()
          }
        }}
        onBlur={() => commit(true)}
        maxLength={MAX_SKILL_LENGTH}
        size={Math.max(value.length, 4)}
        aria-label={`Rename ${skill}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "skill-edit-error" : undefined}
        className={`h-[30px] rounded-full border-2 bg-background px-3 text-sm font-medium outline-none ${
          error ? "border-red-500" : "border-foreground"
        }`}
      />
      {error && (
        <span
          id="skill-edit-error"
          role="alert"
          className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap rounded-md bg-red-600 px-2 py-1 text-xs text-white"
        >
          {error}
        </span>
      )}
    </span>
  )
}

interface PortfolioSkillsProps {
  skillsAndFeatures: { features: string[]; userId?: string }
  isOwner?: boolean
}

const PortfolioSkills = ({ skillsAndFeatures, isOwner = false }: PortfolioSkillsProps) => {
  const [skills, setSkills] = useState<string[]>(skillsAndFeatures?.features || [])
  const [editing, setEditing] = useState<string | null>(null)
  const params = useParams<{ portfolioUsername: string }>()
  const username = params.portfolioUsername

  useEffect(() => {
    setSkills(skillsAndFeatures?.features || [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(skillsAndFeatures?.features)])

  /**
   * Shows the change straight away, applies it to the saved list (not this
   * tab's copy), then shows the result. Rolls back if the save fails.
   */
  const apply = async (local: string[], change: (current: string[]) => string[], failure: string) => {
    const previous = skills
    setSkills(local)
    try {
      setSkills(await updateFeatures(username, change))
      return true
    } catch {
      setSkills(previous)
      toast.error(failure)
      return false
    }
  }

  const rename = (from: string, to: string) => {
    setEditing(null)
    apply(
      skills.map((s) => (s === from ? to : s)),
      (current) => (current.includes(from) ? current.map((s) => (s === from ? to : s)) : [...current, to]),
      `Couldn't rename ${from}. Try again.`
    )
  }

  const remove = async (skill: string) => {
    const index = skills.indexOf(skill)
    const ok = await apply(
      skills.filter((s) => s !== skill),
      (current) => current.filter((s) => s !== skill),
      `Couldn't remove ${skill}. Try again.`
    )
    if (!ok) return
    toast(`Removed ${skill}`, {
      action: {
        label: "Undo",
        onClick: () => {
          const restore = (list: string[]) => {
            if (list.some((s) => key(s) === key(skill))) return list
            const next = [...list]
            next.splice(Math.min(index, next.length), 0, skill)
            return next
          }
          apply(restore(skills.filter((s) => s !== skill)), restore, `Couldn't bring back ${skill}.`)
        },
      },
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const items = Array.from(skills)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    apply(
      items,
      // Keep the new order for skills this tab knows about; anything added elsewhere goes at the end.
      (current) => [...items.filter((s) => current.includes(s)), ...current.filter((s) => !items.includes(s))],
      "Couldn't save the new order. Try again."
    )
  }

  const header = (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="section-label text-xs font-semibold uppercase tracking-widest dark:text-neutral-500 text-gray-400">
        Skills &amp; Technologies
      </h2>
      {isOwner && skills.length > 0 && (
        <p className="hidden text-xs text-muted-foreground sm:block">
          Click a skill to rename{skills.length > 1 ? ", drag to reorder" : ""}
        </p>
      )}
    </div>
  )

  if (skills.length === 0) {
    if (!isOwner) return null
    return (
      <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
        {header}
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">List the tools and technologies you work with.</p>
          <button
            type="button"
            onClick={() => openAddDialog("feature")}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            + Add skills
          </button>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
        {header}
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill} className={`${chipClass} px-3 py-1`}>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
      {header}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="skills" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap items-center gap-2">
              {skills.map((skill, index) => (
                <Draggable key={skill} draggableId={`skill-${skill}`} index={index} isDragDisabled={editing !== null}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {editing === skill ? (
                        <SkillEditor
                          skill={skill}
                          isTaken={(value) => skills.some((s) => s !== skill && key(s) === key(value))}
                          onCommit={(value) => rename(skill, value)}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <span
                          className={`${chipClass} group/chip transition-colors hover:border-foreground/40 ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setEditing(skill)}
                            aria-label={`Rename ${skill}`}
                            className="rounded-l-full py-1 pl-3 pr-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                          >
                            {skill}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(skill)}
                            aria-label={`Remove ${skill}`}
                            className="mr-1 rounded-full p-0.5 text-muted-foreground opacity-40 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 group-hover/chip:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <button
                type="button"
                onClick={() => openAddDialog("feature")}
                aria-label="Add skills"
                className="inline-flex h-[30px] items-center gap-1 rounded-full border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default PortfolioSkills
