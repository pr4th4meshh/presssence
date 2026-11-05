"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProjectCard from "./ProjectCard"
import ProjectForm, { type ExistingProject } from "./addDialogs/ProjectForm"
import { openAddDialog } from "./addDialogEvents"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
  position?: number
}

const normalize = (p: ExistingProject): IProject => ({
  ...p,
  description: p.description ?? "",
  link: p.link ?? "",
  timeline: p.timeline ?? "",
  coverImage: p.coverImage ?? "",
})

const PortfolioProjects = ({
  initialProjects,
}: {
  initialProjects: { projects: IProject[]; userId: string }
}) => {
  const [projects, setProjects] = useState<IProject[]>(initialProjects.projects)
  const [editing, setEditing] = useState<IProject | null>(null)
  const { data: session } = useSession()
  const params = useParams<{ portfolioUsername: string }>()

  const isOwner = session?.user?.id === initialProjects.userId

  useEffect(() => {
    setProjects(initialProjects.projects)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialProjects.projects)])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return

    const reordered = Array.from(projects)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    const withPositions = reordered.map((project, index) => ({ ...project, position: index }))

    const previous = projects
    setProjects(withPositions)
    try {
      const res = await fetch(`/api/portfolio?portfolioUsername=${encodeURIComponent(params.portfolioUsername)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: withPositions }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setProjects(previous)
      toast.error("Couldn't save the new order. Try again.")
    }
  }

  if (projects.length === 0) {
    if (!isOwner) return null
    return (
      <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest dark:text-neutral-500 text-gray-400 mb-4">
          Projects
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">Show visitors what you have built.</p>
          <button
            type="button"
            onClick={() => openAddDialog("project")}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            + Add a project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest dark:text-neutral-500 text-gray-400">
          Projects
        </h2>
        {isOwner && (
          <p className="text-xs text-muted-foreground">
            Click a project to edit{projects.length > 1 ? ", drag to reorder" : ""}
          </p>
        )}
      </div>

      {isOwner ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {projects.map((project, index) => (
                  <Draggable key={project.id || index} draggableId={project.id || String(index)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={(e) => {
                          // Links inside the card should still open, not start editing.
                          if ((e.target as HTMLElement).closest("a")) return
                          setEditing(project)
                        }}
                        className={`group/edit relative h-full cursor-pointer rounded-2xl ${
                          snapshot.isDragging ? "opacity-90 shadow-2xl" : ""
                        }`}
                      >
                        <ProjectCard project={project} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditing(project)
                          }}
                          aria-label={`Edit ${project.title}`}
                          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover/edit:opacity-100 [@media(hover:none)]:opacity-100"
                        >
                          <Pencil className="h-3 w-3" aria-hidden />
                          Edit
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <div key={project.id || index} className="group h-full">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[520px] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit project</DialogTitle>
                <DialogDescription>Changes show on your page when you save.</DialogDescription>
              </DialogHeader>
              <ProjectForm
                key={editing.id}
                username={params.portfolioUsername}
                project={editing}
                onSaved={(updated) => setProjects(updated.map(normalize))}
                onDone={() => setEditing(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortfolioProjects
