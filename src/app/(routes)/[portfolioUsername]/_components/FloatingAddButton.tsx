"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { FaPlus, FaTimes } from "react-icons/fa"
import Toast from "@/components/PopupToast"
import BorderStyleButton from "@/components/ui/border-button"
import { IoAdd, IoClose } from "react-icons/io5"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type AddItemType = "social" | "feature" | "project"
interface IProject {
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

interface FloatingAddButtonProps {
  userId: string
  socialMediaLinks: { [key: string]: string | string[] } | undefined
  features: string[] | undefined
  projects: IProject[] | undefined
  onUpdate: (type: AddItemType, newData: any) => void
  refetchData: () => void
}

const FloatingAddButton = ({
  socialMediaLinks,
  features,
  projects,
  onUpdate,
  refetchData,
}: FloatingAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [addType, setAddType] = useState<AddItemType | null>(null)
  const [newItem, setNewItem] = useState("")
  const [newSocialLink, setNewSocialLink] = useState("")
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    link: "",
    timeline: "",
    coverImage: "",
  })
  const [toast, setToast] = useState({ message: "", visible: false })
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const params = useParams()

  let progress = 0

  const showToast = (message: string) => {
    setToast({ message, visible: true })
  }

  const hideToast = () => {
    setToast({ message: "", visible: false })
  }

  // Smart social media platform detection
  const detectSocialPlatform = (url: string): string | null => {
    const urlLower = url.toLowerCase()
    
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter'
    if (urlLower.includes('instagram.com') || urlLower.includes('insta')) return 'instagram'
    if (urlLower.includes('linkedin.com') || urlLower.includes('linkedin')) return 'linkedin'
    if (urlLower.includes('github.com') || urlLower.includes('github')) return 'github'
    if (urlLower.includes('youtube.com') || urlLower.includes('youtube')) return 'youtube'
    if (urlLower.includes('medium.com') || urlLower.includes('medium')) return 'medium'
    if (urlLower.includes('dribbble.com') || urlLower.includes('dribbble')) return 'dribbble'
    if (urlLower.includes('behance.net') || urlLower.includes('behance')) return 'behance'
    if (urlLower.includes('figma.com') || urlLower.includes('figma')) return 'figma'
    if (urlLower.includes('awwwards.com') || urlLower.includes('awwwards')) return 'awwwards'
    
    return null
  }

  const handleAdd = async () => {
    if (!addType) return

    try {
      let updatedData
      if (addType === "social") {
        const detectedPlatform = detectSocialPlatform(newSocialLink)
        if (!detectedPlatform) {
          showToast("Could not detect social media platform. Please check the URL.")
          return
        }
        
        if (socialMediaLinks && socialMediaLinks[detectedPlatform]) {
          showToast("This social media platform already exists.")
          return
        }
        
        updatedData = { ...socialMediaLinks, [detectedPlatform]: newSocialLink }
      } else if (addType === "feature") {
        updatedData = [...(features || []), newItem]
      } else if (addType === "project") {
        updatedData = [...(projects || []), newProject]
      }

      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [addType === "social"
              ? "socialLinks"
              : addType === "feature"
              ? "features"
              : "projects"]: updatedData,
          }),
        }
      )

      if (response.ok) {
        onUpdate(addType, updatedData)
        setIsOpen(false)
        setNewItem("")
        setNewSocialLink("")
        setNewProject({
          title: "",
          description: "",
          link: "",
          timeline: "",
          coverImage: "",
        })
        showToast(`New ${addType} added successfully.`)
        refetchData()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      console.error(`Error adding ${addType}:`, error)
      showToast(`Failed to add new ${addType}.`)
    }
  }

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const storageRef = ref(storage, `projects/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setImageUploadProgress(progress)
        },
        (error) => {
          console.error("Error uploading image:", error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setNewProject((prevProject) => ({
              ...prevProject,
              coverImage: downloadURL,
            }))
          } catch (err) {
            console.error("Failed to get download URL:", err)
          }
        }
      )
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-10">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80">
            {!addType ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Item</h3>
                <Button
                  onClick={() => setAddType("social")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Add Social Media
                </Button>
                <Button
                  onClick={() => setAddType("feature")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Add Skill/Feature
                </Button>
                <Button
                  onClick={() => setAddType("project")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Add Project
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAdd()
                }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add {addType === "social" ? "Social Media" : addType === "feature" ? "Skill/Feature" : "Project"}
                  </h3>
                  <Button
                    type="button"
                    onClick={() => setAddType(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes size={16} />
                  </Button>
                </div>

                {addType === "social" && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Social Media URL
                    </Label>
                    <Input
                      type="url"
                      value={newSocialLink}
                      onChange={(e) => setNewSocialLink(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username or https://instagram.com/username"
                      required
                    />
                    {newSocialLink && (
                      <p className="text-xs text-gray-500 mt-1">
                        Detected platform: {detectSocialPlatform(newSocialLink) || "Unknown"}
                      </p>
                    )}
                  </div>
                )}

                {addType === "feature" && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Skill or Feature
                    </Label>
                    <Input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., React, UI/UX Design, Project Management"
                      required
                    />
                  </div>
                )}

                {addType === "project" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Project Title
                      </Label>
                      <Input
                        type="text"
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            title: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project title"
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Description
                      </Label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project description"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Project Link
                      </Label>
                      <Input
                        type="url"
                        value={newProject.link}
                        onChange={(e) =>
                          setNewProject({ ...newProject, link: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://project-url.com"
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Timeline
                      </Label>
                      <Input
                        type="date"
                        value={newProject.timeline}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            timeline: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Cover Image
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {newProject.coverImage && (
                        <Image
                          src={newProject.coverImage}
                          alt="Cover preview"
                          className="mt-2 w-32 h-32 object-cover border rounded-lg dark:border-white border-black"
                          height={128}
                          width={128}
                        />
                      )}
                      {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                        <div className="mt-2 text-sm text-gray-500">
                          Uploading... {imageUploadProgress.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    onClick={() => setAddType(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add {addType === "social" ? "Social" : addType === "feature" ? "Skill" : "Project"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
        <BorderStyleButton
          onClick={() => setIsOpen(!isOpen)}
          title={
            isOpen ? (
              <div className="flex items-center text-sm">
                Close <IoClose className="ml-2" />
              </div>
            ) : (
              <div className="flex items-center text-sm">
                Add <IoAdd className="ml-2" />
              </div>
            )
          }
        />
      </div>
      {toast.visible && <Toast message={toast.message} onClose={hideToast} />}
    </>
  )
}

export default FloatingAddButton
