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
      <div className="">
        <div className="dark:text-white text-black p-2 relative rounded-lg hover:shadow-md transition-all duration-200 text-sm">
          {skill}
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="relative" ref={wrapperRef}>
        <div className="relative my-1">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="dark:text-white border-2 border-blue-500 text-black p-2 rounded-lg w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
            placeholder="Enter skill name"
            maxLength={50}
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <div
        className="dark:text-white text-black border-b border-dark py-2 px-2 relative hover:rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 uppercase text-sm"
        onClick={() => setIsEditing(true)}
      >
        {skill}
        <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      </div>
      <Button
        onClick={() => onRemove(index)}
        className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
      >
        <FiTrash2 size={10} />
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
  isOwner = true,
}: PortfolioSkillsProps) => {
  const [skills, setSkills] = useState<string[]>(
    skillsAndFeatures?.features || []
  )
  const params = useParams()

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
        console.error("API Error:", errorData.message);
        throw new Error(errorData.message || "Failed to update skills");
      }
  
      const data = await res.json();
      console.log("Skills saved successfully:", data);
      toast.info("Skills saved successfully.");
    } catch (error) {
      console.error("Error updating skills:", error);
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
    skills.length > 0 && (
      <div className="container mx-auto px-4 py-8">
        <h1 className="pb-4 text-xl uppercase dark:text-light text-dark font-medium">
          skills:
        </h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills" direction="vertical">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-col gap-1"
              >
                {skills.map((skill: string, index: number) => (
                  <Draggable
                    key={skill} // or key={`${skill}-${index}`}
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
    )
  )
}

export default PortfolioSkills
