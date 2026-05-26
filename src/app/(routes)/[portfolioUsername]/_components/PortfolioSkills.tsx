"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { FiTrash2 } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd"
import { useParams } from "next/navigation"
import { toast } from "sonner"

// Individual Editable Skill Component
const EditableSkill = ({
  skill,
  index,
  onSave,
  onRemove,
  isOwner,
}: {
  skill: string
  index: number
  onSave: (index: number, newValue: string) => Promise<void>
  onRemove: (index: number) => void
  isOwner: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(skill)
  const [isSaving, setIsSaving] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleSave = async () => {
    if (editValue.trim() === skill.trim()) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(index, editValue.trim())
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving skill:", error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        handleSave()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing, editValue])

  useEffect(() => {
    if (!isEditing) return

    if (saveTimeout.current) clearTimeout(saveTimeout.current)

    saveTimeout.current = setTimeout(() => {
      if (editValue.trim() !== skill.trim()) {
        handleSave()
      } else {
        setIsEditing(false)
      }
    }, 3000)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [editValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(skill)
      setIsEditing(false)
    }

    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOwner) {
    return (
      <span className="skill-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium dark:bg-neutral-800 bg-gray-100 dark:text-gray-200 text-gray-700 border dark:border-neutral-700 border-gray-200">
        {skill}
      </span>
    )
  }

  if (isEditing) {
    return (
      <div className="relative" ref={wrapperRef}>
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="border-2 border-blue-500 text-sm px-3 py-1 h-8 rounded-full w-32 bg-transparent focus:outline-none"
          placeholder="Skill name"
          maxLength={50}
          autoFocus
        />
      </div>
    )
  }

  return (
    <div className="group relative flex items-center gap-1">
      <span
        className="skill-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium dark:bg-neutral-800 bg-gray-100 dark:text-gray-200 text-gray-700 border dark:border-neutral-700 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {skill}
      </span>
      <Button
        onClick={() => onRemove(index)}
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
      >
        <FiTrash2 size={8} />
      </Button>
    </div>
  )
}

interface PortfolioSkillsProps {
  skillsAndFeatures: {
    features: string[]
    userId?: string
  }
  isOwner?: boolean
}

const PortfolioSkills = ({
  skillsAndFeatures,
  isOwner = false,
}: PortfolioSkillsProps) => {
  const [skills, setSkills] = useState<string[]>(
    skillsAndFeatures?.features || []
  )
  const params = useParams()

  useEffect(() => {
    setSkills(skillsAndFeatures?.features || [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(skillsAndFeatures?.features)])

  const handleRemoveSkill = async (indexToRemove: number) => {
    const updatedSkills = skills.filter((_, index) => index !== indexToRemove)
    setSkills(updatedSkills)
    await handleSaveSkills(updatedSkills)
  }

  const handleUpdateSkill = async (index: number, newValue: string) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = newValue
    await handleSaveSkills(updatedSkills)
  }

  const handleSaveSkills = async (updatedSkills: string[]) => {
    try {
      setSkills(updatedSkills);
  
      const res = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...skillsAndFeatures,
          features: updatedSkills,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update skills");
      }

      await res.json();
      toast.success("Skills updated.");
    } catch {
      toast.error("Failed to update skills.");
    }
  };
  
  

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return // if item isnt dropped at a valid position return back to original position
    const items = Array.from(skills)
    const [reorderdItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderdItem)

    setSkills(items)
    if (isOwner) await handleSaveSkills(items)
  }

  return (
    skills.length > 0 ? (
      <div className="section-border py-10 border-t dark:border-neutral-800 border-gray-100">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest dark:text-neutral-500 text-gray-400 mb-4">
          Skills &amp; Technologies
        </h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-2"
              >
                {skills.map((skill: string, index: number) => (
                  <Draggable
                    key={skill}
                    draggableId={`${skill}-${index}`}
                    index={index}
                    isDragDisabled={!isOwner}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <EditableSkill
                          skill={skill}
                          index={index}
                          onSave={handleUpdateSkill}
                          onRemove={handleRemoveSkill}
                          isOwner={isOwner}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    ) : null
  )
}

export default PortfolioSkills
