"use client"

import type React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { AtSign, Zap, FolderOpen, Check, X, Palette } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import SharePresssenceButton from "./SharePresssenceButton"
import LogoutButton from "@/components/LogoutButton"
import useIsOwner from "@/hooks/useIsOwner"

type AddItemType = "social" | "feature" | "project"

interface IProject {
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

const THEMES = [
  {
    id: "modern",
    label: "Modern",
    preview: "bg-gray-50 border-gray-200",
    dot: "bg-blue-500",
    desc: "Clean & minimal",
  },
  {
    id: "creative",
    label: "Creative",
    preview: "bg-purple-950 border-purple-700",
    dot: "bg-fuchsia-500",
    desc: "Vibrant & expressive",
  },
  {
    id: "professional",
    label: "Pro",
    preview: "bg-slate-950 border-slate-700",
    dot: "bg-amber-400",
    desc: "Sharp & refined",
  },
  {
    id: "bold",
    label: "Bold",
    preview: "bg-black border-zinc-700",
    dot: "bg-cyan-400",
    desc: "High contrast",
  },
]

interface FloatingDockProps {
  userId: string
  socialMediaLinks: { [key: string]: string | string[] } | undefined
  features: string[] | undefined
  projects: IProject[] | undefined
  onUpdate: (type: AddItemType, newData: any) => void
  refetchData: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

const FloatingAddButton = ({
  socialMediaLinks,
  features,
  projects,
  onUpdate,
  refetchData,
  currentTheme = "modern",
  onThemeChange,
}: FloatingDockProps) => {
  const [addType, setAddType] = useState<AddItemType | null>(null)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
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
    if (urlLower.includes("twitter.com") || urlLower.includes("x.com"))
      return "twitter"
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
          toast.info(
            "Could not detect social media platform. Please check the URL."
          )
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
        setAddType(null)
        setNewItem("")
        setNewSocialLink("")
        setNewProject({
          title: "",
          description: "",
          link: "",
          timeline: "",
          coverImage: "",
        })
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

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const storageRef = ref(storage, `projects/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setImageUploadProgress(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
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
      }
    )
  }

  const dockItems = [
    {
      type: "social" as AddItemType,
      icon: AtSign,
      label: "Social",
      tooltip: "Add Social Media",
    },
    {
      type: "feature" as AddItemType,
      icon: Zap,
      label: "Skills",
      tooltip: "Add Skill",
    },
    {
      type: "project" as AddItemType,
      icon: FolderOpen,
      label: "Project",
      tooltip: "Add Project",
    },
  ]

  const handleDockClick = (type: AddItemType) => {
    if (addType === type) {
      setAddType(null)
    } else {
      setAddType(type)
    }
  }

  const activeLabel = dockItems.find((i) => i.type === addType)?.label

  return (
    <>
      {/* Theme Picker Dialog */}
      <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {THEMES.map((t) => {
              const isActive = currentTheme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange?.(t.id)
                    setIsThemeOpen(false)
                  }}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                    isActive
                      ? "border-foreground ring-2 ring-foreground/20"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className={`rounded-lg h-14 w-full mb-2 border ${t.preview}`} />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${t.dot}`} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                      <Check size={11} className="text-background" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Form Dialog */}
      <Dialog open={!!addType} onOpenChange={(open) => !open && setAddType(null)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add {activeLabel}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAdd()
            }}
            className="space-y-4"
          >
            {addType === "social" && (
              <div>
                <Label>Social Media URL</Label>
                <Input
                  type="url"
                  value={newSocialLink}
                  onChange={(e) => setNewSocialLink(e.target.value)}
                  placeholder="https://twitter.com/username"
                  required
                />
                {newSocialLink && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs mt-2 flex items-center gap-2"
                  >
                    <Check size={12} /> Detected:{" "}
                    {detectSocialPlatform(newSocialLink) || "Unknown platform"}
                  </motion.p>
                )}
              </div>
            )}

            {addType === "feature" && (
              <div>
                <Label>Skill or Feature</Label>
                <Input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., React, UI/UX Design"
                  required
                />
              </div>
            )}

            {addType === "project" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Project Title</Label>
                  <Input
                    type="text"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    placeholder="Enter project title"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter project description"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label>Project Link</Label>
                  <Input
                    type="url"
                    value={newProject.link}
                    onChange={(e) =>
                      setNewProject({ ...newProject, link: e.target.value })
                    }
                    placeholder="https://project-url.com"
                    required
                  />
                </div>
                <div>
                  <Label>Timeline</Label>
                  <Input
                    type="date"
                    value={newProject.timeline}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        timeline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                    />
                    {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${imageUploadProgress}%` }}
                        className="absolute bottom-0 left-0 h-1 bg-foreground rounded-full"
                      />
                    )}
                  </div>
                  {newProject.coverImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3"
                    >
                      <Image
                        src={newProject.coverImage}
                        alt="Cover preview"
                        className="w-24 h-24 object-cover rounded-lg border"
                        height={96}
                        width={96}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddType(null)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  `Add ${activeLabel}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dock Buttons */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <motion.div className="bg-card border border-border rounded-2xl shadow-2xl p-2">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SharePresssenceButton />
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => setIsThemeOpen(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group bg-muted text-foreground"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Change Theme"
            >
              <Palette size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </motion.button>
            {dockItems.map((item, index) => {
              const isActive = addType === item.type
              return (
                <motion.button
                  key={item.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleDockClick(item.type)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-red-500 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.tooltip}
                >
                  {isActive ? (
                    <X size={18} />
                  ) : (
                    <item.icon
                      size={18}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  )}
                </motion.button>
              )
            })}
            {useIsOwner().isOwner && (
              <LogoutButton
                iconOnly
                className="w-12 h-12 rounded-xl"
              />
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default FloatingAddButton
