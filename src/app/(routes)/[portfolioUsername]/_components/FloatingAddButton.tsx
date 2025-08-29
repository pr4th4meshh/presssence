"use client"

import type React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Star, Briefcase, Check, X } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Portal from "@/components/Portal"
import SharePresssenceButton from "./SharePresssenceButton"

type AddItemType = "social" | "feature" | "project"

interface IProject {
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

interface FloatingDockProps {
  userId: string
  socialMediaLinks: { [key: string]: string | string[] } | undefined
  features: string[] | undefined
  projects: IProject[] | undefined
  onUpdate: (type: AddItemType, newData: any) => void
  refetchData: () => void
}

const FloatingAddButton = ({ socialMediaLinks, features, projects, onUpdate, refetchData }: FloatingDockProps) => {
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
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()

  const detectSocialPlatform = (url: string): string | null => {
    const urlLower = url.toLowerCase()
    if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) return "twitter"
    if (urlLower.includes("instagram.com")) return "instagram"
    if (urlLower.includes("linkedin.com")) return "linkedin"
    if (urlLower.includes("github.com")) return "github"
    if (urlLower.includes("youtube.com")) return "youtube"
    if (urlLower.includes("medium.com")) return "medium"
    if (urlLower.includes("dribbble.com")) return "dribbble"
    if (urlLower.includes("behance.net")) return "behance"
    if (urlLower.includes("figma.com")) return "figma"
    if (urlLower.includes("awwwards.com")) return "awwwards"
    if (urlLower.includes("open.spotify.com")) return "spotify"
    return null
  }

  const handleAdd = async () => {
    if (!addType) return
    setIsLoading(true)

    try {
      let updatedData
      if (addType === "social") {
        const detectedPlatform = detectSocialPlatform(newSocialLink)
        if (!detectedPlatform) {
          toast.info("Could not detect social media platform. Please check the URL.")
          setIsLoading(false)
          return
        }
        if (socialMediaLinks && socialMediaLinks[detectedPlatform]) {
          toast.info("This social media platform already exists.")
          setIsLoading(false)
          return
        }
        updatedData = { ...socialMediaLinks, [detectedPlatform]: newSocialLink }
      } else if (addType === "feature") {
        updatedData = [...(features || []), newItem]
      } else if (addType === "project") {
        updatedData = [...(projects || []), newProject]
      }

      const response = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [addType === "social" ? "socialLinks" : addType === "feature" ? "features" : "projects"]: updatedData,
        }),
      })

      if (response.ok) {
        onUpdate(addType, updatedData)
        setAddType(null)
        setNewItem("")
        setNewSocialLink("")
        setNewProject({ title: "", description: "", link: "", timeline: "", coverImage: "" })
        toast.success(`New ${addType} added successfully.`)
        refetchData()
      } else throw new Error("Failed to update")
    } catch (error) {
      console.error(`Error adding ${addType}:`, error)
      toast.error(`Failed to add new ${addType}.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const storageRef = ref(storage, `projects/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setImageUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      },
      (error) => {
        console.error("Error uploading image:", error)
        toast.error("Failed to upload image")
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          setNewProject((p) => ({ ...p, coverImage: downloadURL }))
          setImageUploadProgress(0)
        } catch (err) {
          console.error("Failed to get download URL:", err)
          toast.error("Failed to get image URL")
        }
      },
    )
  }

  const dockItems = [
    { type: "social" as AddItemType, icon: Users, label: "Social", tooltip: "Add Social Media" },
    { type: "feature" as AddItemType, icon: Star, label: "Skills", tooltip: "Add Skills/Features" },
    { type: "project" as AddItemType, icon: Briefcase, label: "Project", tooltip: "Add Project" },
  ]

  const handleDockClick = (type: AddItemType) => {
    if (addType === type) {
      setAddType(null) // close if same button clicked
    } else {
      setAddType(type) // open modal for this button
    }
  }
  
  return (
    <>
      {/* Background Overlay */}
      <AnimatePresence>
        {addType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setAddType(null)} />
        )}
      </AnimatePresence>

      {/* Add Form Modal */}
      <AnimatePresence>
      {addType && (
        <Portal >
          
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 flex items-end justify-center z-50 bottom-24" // margin above dock
    >
            <div className="bg-light dark:bg-dark rounded-2xl shadow-2xl border p-6 min-w-[400px] max-w-[500px]">
              <h3 className="text-xl font-semibold mb-6">Add {dockItems.find((i) => i.type === addType)?.label}</h3>

              <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="space-y-4">
                {addType === "social" && (
                  <div>
                    <Label>Social Media URL</Label>
                    <Input type="url" value={newSocialLink} onChange={(e) => setNewSocialLink(e.target.value)}
                      className="w-full bg-light dark:bg-dark" placeholder="https://twitter.com/username" required />
                    {newSocialLink && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs mt-2 flex items-center gap-2">
                        <Check size={12} /> Detected: {detectSocialPlatform(newSocialLink) || "Unknown platform"}
                      </motion.p>
                    )}
                  </div>
                )}

                {addType === "feature" && (
                  <div>
                    <Label>Skill or Feature</Label>
                    <Input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                      className="w-full bg-light dark:bg-dark" placeholder="e.g., React, UI/UX Design" required />
                  </div>
                )}

                {addType === "project" && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                      <Label>Project Title</Label>
                      <Input type="text" value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full bg-light dark:bg-dark" placeholder="Enter project title" required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="w-full bg-light dark:bg-dark" placeholder="Enter project description" rows={3} required />
                    </div>
                    <div>
                      <Label>Project Link</Label>
                      <Input type="url" value={newProject.link}
                        onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                        className="w-full bg-light dark:bg-dark" placeholder="https://project-url.com" required />
                    </div>
                    <div>
                      <Label>Timeline</Label>
                      <Input type="date" value={newProject.timeline}
                        onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })}
                        className="w-full bg-light dark:bg-dark" required />
                    </div>
                    <div>
                      <Label>Cover Image</Label>
                      <div className="relative">
                        <Input type="file" accept="image/*" onChange={handleCoverImageUpload}
                          className="w-full bg-light dark:bg-dark" />
                        {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                          <motion.div initial={{ width: 0 }} animate={{ width: `${imageUploadProgress}%` }}
                            className="absolute bottom-0 left-0 h-1 bg-dark rounded-full" />
                        )}
                      </div>
                      {newProject.coverImage && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                          <Image src={newProject.coverImage} alt="Cover preview"
                            className="w-24 h-24 object-cover rounded-lg border" height={96} width={96} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setAddType(null)}
                    className="flex-1 bg-light dark:bg-dark" disabled={isLoading}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-dark text-white dark:bg-light dark:text-black"
                    disabled={isLoading}>
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : `Add ${dockItems.find((i) => i.type === addType)?.label}`}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

        </Portal>
        )}
      </AnimatePresence>

      {/* Dock Buttons */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <motion.div className="bg-light dark:bg-dark rounded-2xl shadow-2xl border dark:border-white border-black p-2">
          <div className="flex items-center gap-2">
          <motion.div initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <SharePresssenceButton />
            </motion.div>
            {dockItems.map((item, index) => {
              const isActive = addType === item.type
              return (
                <motion.button key={item.type} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  onClick={() => handleDockClick(item.type)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group
                    ${isActive ? "bg-red-500 text-white" : "bg-light dark:bg-dark text-black dark:text-white"}`}
                  whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  title={item.tooltip}>
                  {isActive ? <X size={18} /> : <item.icon size={18} className="group-hover:scale-110 transition-transform duration-200" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default FloatingAddButton
