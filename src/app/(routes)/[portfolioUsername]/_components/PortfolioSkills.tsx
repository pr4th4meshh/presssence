import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FiEdit3, FiCheck, FiX, FiTrash2 } from "react-icons/fi"

// Individual Editable Skill Component
const EditableSkill = ({ 
  skill, 
  index, 
  onSave, 
  onRemove, 
  isOwner 
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
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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
      <div className="text-center">
        <div className="dark:text-white border border-gray-500 text-black p-3 relative rounded-2xl mx-5 hover:shadow-lg transition-all duration-200">
          {skill}
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="text-center relative" ref={wrapperRef}>
        <div className="relative">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="dark:text-white border-2 border-blue-500 text-black p-3 rounded-2xl mx-5 w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            placeholder="Enter skill name"
            maxLength={50}
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div className="text-center group"> 
      <div 
        className="dark:text-white border border-gray-500 text-black p-3 relative rounded-2xl mx-5 hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsEditing(true)}
      >
        {skill}
        <div className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 rounded-full mr-2">
            <FiEdit3 size={14} />
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
      >
        <FiTrash2 size={12} />
      </button>
    </div>
  )
}



const PortfolioSkills = ({ skillsAndFeatures }: any) => {
  const [skills, setSkills] = useState(skillsAndFeatures?.features || [])
  const { data: session } = useSession()
  const params = useParams()
  
  const isOwner = session?.user?.id === skillsAndFeatures?.userId

  const handleRemoveSkill = async (indexToRemove: number) => {
    const updatedSkills = skills.filter((_: string, index: number) => index !== indexToRemove)
    await handleSaveSkills(updatedSkills)
  }

  const handleUpdateSkill = async (index: number, newValue: string) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = newValue
    await handleSaveSkills(updatedSkills)
  }

  const handleSaveSkills = async (updatedSkills: string[]) => {
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ features: updatedSkills }),
        }
      )

      if (response.ok) {
        setSkills(updatedSkills)
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to update skills")
      }
    } catch (error) {
      console.error("Error updating skills:", error)
      throw error
    }
  }



  return (
    skills.length > 0 && (
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.map((skill: string, index: number) => (
            <EditableSkill
              key={index}
              skill={skill}
              index={index}
              onSave={handleUpdateSkill}
              onRemove={handleRemoveSkill}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>
    )
  )
}

export default PortfolioSkills