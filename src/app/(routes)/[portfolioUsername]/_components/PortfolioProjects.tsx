import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaPlus } from "react-icons/fa"
import PrimaryButton from "@/components/ui/primary-button"
import EditButton from "./EditButton"
import { storage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import ProjectCard from "./ProjectCard"
import ProjectForm from "./ProjectForm"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

const PortfolioProjects = ({
  initialProjects,
}: {
  initialProjects: { projects: IProject[]; userId: string }
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [projects, setProjects] = useState<IProject[]>(initialProjects.projects)
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(
    new Array(initialProjects.projects.length).fill(null)
  )
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUploaded, setImageUploaded] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { data: session } = useSession()
  const params = useParams()

  let progress = 0

  const handleInputChange = (
    index: number,
    field: keyof IProject,
    value: string
  ) => {
    const updatedProjects = [...projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setProjects(updatedProjects)
  }

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: "", description: "", link: "", timeline: "" },
    ])
    setImagePreviews([...imagePreviews, null])
  }

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      // Preview the selected image
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedPreviews = [...imagePreviews]
        updatedPreviews[index] = reader.result as string // Set preview for the specific project
        setImagePreviews(updatedPreviews)
        setSelectedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async (index: number) => {
    if (!selectedFile) return

    setUploading(true)
    const storageRef = ref(storage, `/projects/${selectedFile.name}`)
    const uploadTask = uploadBytesResumable(storageRef, selectedFile)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error("Upload failed:", error)
        setUploading(false)
      },
      async () => {
        // Once the image is uploaded, get the download URL
        setImageUploaded(true)
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        const updatedProjects = [...projects]
        updatedProjects[index] = {
          ...updatedProjects[index],
          coverImage: downloadURL,
        }
        setProjects(updatedProjects)
        setUploading(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projects }),
        }
      )

      if (response.ok) {
        setIsEditing(false)
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update projects")
      }
    } catch (error) {
      console.error("Error updating projects:", error)
      alert("An error occurred while updating the projects")
    }
  }

  const isAGrid = projects.length > 1

  return (
    projects.length > 0 && (
      <div className="py-32 container mx-auto px-4">
        <h1 className="text-center pb-10 text-2xl uppercase">Projects</h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {projects.map((project, index) => (
              <div key={index}>
                <ProjectForm
                  project={project}
                  index={index}
                  handleInputChange={handleInputChange}
                  handleImageChange={handleImageChange}
                  handleUploadImage={handleUploadImage}
                  handleRemoveProject={handleRemoveProject}
                  imagePreviews={imagePreviews}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  imageUploaded={imageUploaded}
                />
              </div>
            ))}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-500"
              >
                <FaPlus className="mr-2" /> Add Project
              </button>
              <div className="flex space-x-2">
                <PrimaryButton
                  title="Cancel"
                  onClick={() => setIsEditing(false)}
                  className="bg-red-500 text-white"
                />
                <PrimaryButton title="Save Changes" type="submit" />
              </div>
            </div>
          </form>
        ) : (
          <div className="relative">
            <div
              className={`${
                isAGrid
                  ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
                  : "flex flex-col space-y-4"
              }`}
            >
              {projects.map((project: IProject) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {session?.user?.id === initialProjects.userId && (
              <EditButton
                className="float-right mt-5"
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        )}
      </div>
    )
  )
}

export default PortfolioProjects
