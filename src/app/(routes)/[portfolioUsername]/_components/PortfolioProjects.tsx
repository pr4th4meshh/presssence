import React, { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FiEdit3, FiX, FiTrash2 } from "react-icons/fi"
import { storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import ProjectCard from "./ProjectCard"
import PrimaryButton from "@/components/ui/primary-button"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

// Individual Editable Project Component
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

  // Auto-save after 3 seconds of no keystrokes
  useEffect(() => {
    if (isEditing && JSON.stringify(editProject) !== JSON.stringify(project)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [editProject, project, isEditing, index, onSave])

  const handleInputChange = (field: keyof IProject, value: string) => {
    setEditProject(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
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
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Project</h3>
            <button
              onClick={() => {
                setEditProject(project)
                setIsEditing(false)
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editProject.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project title"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={editProject.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Project description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link
              </label>
              <input
                type="url"
                value={editProject.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timeline
              </label>
              <input
                type="date"
                value={editProject.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  <button
                    onClick={handleUploadImage}
                    disabled={uploading}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploading ? `Uploading ${uploadProgress.toFixed(0)}%` : 'Upload Image'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isSaving && (
            <div className="absolute flex items-center -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
              <span className="mr-1">Saving</span>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <div 
        className="cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <ProjectCard project={project} />
      </div>
    </div>
  )
}



const PortfolioProjects = ({
  initialProjects,
}: {
  initialProjects: { projects: IProject[]; userId: string }
}) => {
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
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projects: updatedProjects }),
        }
      )

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

  const isAGrid = projects.length > 1

  return (
    projects.length > 0 && (
      <div className="py-32 container mx-auto px-4">
        <h1 className="text-center pb-10 text-2xl uppercase">Projects</h1>

        <div
          className={`${
            isAGrid
              ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
              : "flex flex-col justify-center items-center space-y-4"
          }`}
        >
          {projects.map((project: IProject, index: number) => (
            <EditableProject
              key={project.id || index}
              project={project}
              index={index}
              onSave={handleUpdateProject}
              onRemove={handleRemoveProject}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>
    )
  )
}

export default PortfolioProjects
