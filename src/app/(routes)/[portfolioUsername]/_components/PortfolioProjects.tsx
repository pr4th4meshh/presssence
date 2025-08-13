import React, { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FiEdit3, FiX, FiTrash2 } from "react-icons/fi"
import { storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import ProjectCard from "./ProjectCard"
import PrimaryButton from "@/components/ui/primary-button"
import { Button } from "@/components/ui/button"
import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
  position?: number
}

const EditableProject = ({ 
  project, 
  index, 
  onSave, 
  onRemove, 
  isOwner 
}: {
  project: IProject
  index: number
  onSave: (index: number, updatedProject: IProject) => Promise<void>
  onRemove: (index: number) => void
  isOwner: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editProject, setEditProject] = useState(project)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isEditing && JSON.stringify(editProject) !== JSON.stringify(project)) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      
      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true)
        try {
          await onSave(index, editProject)
        } catch (error) {
          console.error("Error saving project:", error)
        } finally {
          setIsSaving(false)
        }
      }, 1000)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [editProject, project, isEditing, index, onSave])

  const handleInputChange = (field: keyof IProject, value: string) => {
    setEditProject(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setSelectedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile) return

    setUploading(true)
    const storageRef = ref(storage, `/projects/${selectedFile.name}`)
    const uploadTask = uploadBytesResumable(storageRef, selectedFile)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error("Upload failed:", error)
        setUploading(false)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        setEditProject(prev => ({ ...prev, coverImage: downloadURL }))
        setUploading(false)
        setImagePreview(null)
        setSelectedFile(null)
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditProject(project)
      setIsEditing(false)
    }
  }

  if (!isOwner) {
    return (
      <div className="group">
        <ProjectCard project={project} />
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="relative w-max flex justify-center items-center">
        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Project</h3>
            <Button onClick={() => { setEditProject(project); setIsEditing(false) }}>
              <FiX size={20} />
            </Button>
          </div>
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                value={editProject.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editProject.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
              />
            </div>
            <div>
              <Label>Link</Label>
              <Input
                type="url"
                value={editProject.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <Label>Timeline</Label>
              <Input
                type="date"
                value={editProject.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <Label>Cover Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-2">
                  <Image height={128} width={128} src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  <Button onClick={handleUploadImage} disabled={uploading} className="mt-2">
                    {uploading ? `Uploading ${uploadProgress.toFixed(0)}%` : 'Upload Image'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          {isSaving && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-bl">
              Saving...
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="group relative cursor-pointer" onClick={() => setIsEditing(true)}>
      <ProjectCard project={project} />
    </div>
  )
}

const PortfolioProjects = ({ initialProjects }: { initialProjects: { projects: IProject[]; userId: string } }) => {
  const [projects, setProjects] = useState<IProject[]>(initialProjects.projects)
  const { data: session } = useSession()
  const params = useParams()

  const isOwner = session?.user?.id === initialProjects.userId

  const handleUpdateProject = async (index: number, updatedProject: IProject) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = updatedProject
    await handleSaveProjects(updatedProjects)
  }

  const handleRemoveProject = async (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index)
    await handleSaveProjects(updatedProjects)
  }

  const handleSaveProjects = async (updatedProjects: IProject[]) => {
    try {
      const response = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: updatedProjects }),
      })
      if (response.ok) {
        setProjects(updatedProjects)
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to update projects")
      }
    } catch (error) {
      console.error("Error updating projects:", error)
      throw error
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    
    const reordered = Array.from(projects)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    
    // Update positions based on new order
    const updatedWithPositions = reordered.map((project, index) => ({
      ...project,
      position: index
    }))
    
    setProjects(updatedWithPositions)
    if (isOwner) await handleSaveProjects(updatedWithPositions)
  }

  return (
    projects.length > 0 && (
      <div className="py-32 container mx-auto px-4">
        <h1 className="text-center pb-10 text-2xl uppercase">Projects</h1>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="projects"
            direction={projects.length > 1 ? "horizontal" : "vertical"}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={
                  projects.length > 1
                    ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
                    : "flex flex-col items-center space-y-4"
                }
              >
                {projects.map((project, index) => (
                  <Draggable
                    key={project.id || index}
                    draggableId={(project.id || index.toString()) + ""}
                    index={index}
                    isDragDisabled={!isOwner}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <EditableProject
                          project={project}
                          index={index}
                          onSave={handleUpdateProject}
                          onRemove={handleRemoveProject}
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

export default PortfolioProjects
