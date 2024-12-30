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
  socialMediaLinks: Record<string, string> | undefined
  features: string[] | undefined
  projects: IProject[] | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleAdd = async () => {
    if (!addType) return

    try {
      let updatedData
      if (addType === "social") {
        if (socialMediaLinks && socialMediaLinks[newItem]) {
          showToast("This social media link already exists.")
          return
        }
        updatedData = { ...socialMediaLinks, [newItem]: newSocialLink }
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
      // Show some UI feedback here if needed (uploading...)
      const storageRef = ref(storage, `projects/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      // Monitor the upload progress (optional)
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setImageUploadProgress(progress)
        },
        (error) => {
          console.error("Error uploading image:", error)
          // Show an error toast or feedback if required
        },
        async () => {
          // After successful upload, get the download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

            // Set the cover image URL in the project
            setNewProject((prevProject) => ({
              ...prevProject,
              coverImage: downloadURL, // Set the image URL
            }))
          } catch (err) {
            console.error("Failed to get download URL:", err)
          }
        }
      )
    }
  }

  const availablePlatforms = [
    "twitter",
    "linkedin",
    "github",
    "website",
    "behance",
    "figma",
    "awwwards",
    "dribbble",
    "medium",
    "youtube",
    "instagram",
  ].filter((platform) => !(socialMediaLinks && socialMediaLinks[platform]))

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-black dark:shadow-white shadow-black rounded-lg shadow-md border dark:border-white border-black p-4 w-72">
            {!addType ? (
              <div className="space-y-2">
                <button
                  onClick={() => setAddType("social")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Add Social Media
                </button>
                <button
                  onClick={() => setAddType("feature")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Add Feature
                </button>
                <button
                  onClick={() => setAddType("project")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Add Project
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAdd()
                }}
                className="space-y-4"
              >
                {addType === "social" && (
                  <>
                    <div>
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Social Media Platform
                      </label>
                      <select
                        id="platform"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a platform</option>
                        {availablePlatforms.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="socialLink"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Social Media Link
                      </label>
                      <input
                        type="url"
                        id="socialLink"
                        value={newSocialLink}
                        onChange={(e) => setNewSocialLink(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter social media link"
                      />
                    </div>
                  </>
                )}
                {addType === "feature" && (
                  <div>
                    <label
                      htmlFor="feature"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      New Feature
                    </label>
                    <input
                      type="text"
                      id="feature"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter a new feature or skill"
                    />
                  </div>
                )}
                {addType === "project" && (
                  <>
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Project Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter project title"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Project Description
                      </label>
                      <textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="link"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Project Link
                      </label>
                      <input
                        type="url"
                        id="link"
                        value={newProject.link}
                        onChange={(e) =>
                          setNewProject({ ...newProject, link: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter project link"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="timeline"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Project Timeline
                      </label>
                      <input
                        type="date"
                        id="timeline"
                        value={newProject.timeline}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            timeline: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="coverImage"
                        className="block text-sm font-medium"
                      >
                        Cover Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverImageUpload(e)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {newProject.coverImage && (
                        <Image
                          src={newProject.coverImage}
                          alt="Cover preview"
                          className="mt-2 w-[150px] h-[150px] object-cover border rounded-xl dark:border-white border-black"
                          height={200}
                          width={200}
                        />
                      )}
                    </div>
                    {imageUploadProgress > 0 && (
                      <h1>Uploading image.. {imageUploadProgress}%</h1>
                    )}
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddType(null)}
                    className="inline-flex items-center w-full px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaTimes className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center w-full px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-black dark:border-white border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    Add {addType}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        <BorderStyleButton
          onClick={() => setIsOpen(!isOpen)}
          title={
            isOpen ? (
              <h1 className="flex items-center text-sm sm:text-lg">
                Close <IoClose className="ml-2" />
              </h1>
            ) : (
              <h1 className="flex items-center text-xs sm:text-lg sm:flex-row flex-col sm:p-0 p-1">
                Add <br className="sm:hidden block" /> Items{" "}
                <IoAdd className="ml-2 sm:block hidden" />
              </h1>
            )
          }
        />
      </div>
      {toast.visible && <Toast message={toast.message} onClose={hideToast} />}
    </>
  )
}

export default FloatingAddButton
