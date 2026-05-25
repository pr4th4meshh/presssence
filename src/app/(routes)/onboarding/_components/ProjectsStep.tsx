"use client"

import { UseFormRegister, FieldErrors, Control, useFieldArray, UseFormWatch } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { useState } from "react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Link2,
  Calendar,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"

interface ProjectsStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  control: Control<FormData>
  watch: UseFormWatch<FormData>
}

export default function ProjectsStep({ register, errors, control, watch }: ProjectsStepProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "projects" })
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>({})
  const [expandedIndex, setExpandedIndex] = useState<number>(0)

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress((prev) => ({ ...prev, [index]: progress }))
      },
      (error) => console.error("Upload error:", error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          control._formValues.projects[index].coverImage = url
          setUploadedImages((prev) => ({ ...prev, [index]: url }))
          setUploadProgress((prev) => ({ ...prev, [index]: 0 }))
        })
      }
    )
  }

  const handleAdd = () => {
    append({ title: "", description: "", link: "", timeline: "" })
    setExpandedIndex(fields.length)
  }

  const handleRemove = (index: number) => {
    remove(index)
    setUploadedImages((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
    setExpandedIndex(Math.max(0, expandedIndex - 1))
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {fields.length === 0 ? "Add at least one project" : `${fields.length} project${fields.length > 1 ? "s" : ""} added`}
        </p>
        {fields.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAdd}
            className="h-7 text-xs gap-1"
          >
            <Plus size={12} />
            Add project
          </Button>
        )}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-border/60 text-center cursor-pointer hover:border-border hover:bg-muted/20 transition-colors"
          onClick={handleAdd}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <FolderOpen size={22} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Add your first project</p>
          <p className="text-xs text-muted-foreground mt-1">Showcase your best work</p>
          <Button type="button" size="sm" className="mt-4 gap-1.5">
            <Plus size={14} />
            New project
          </Button>
        </motion.div>
      )}

      {/* Project cards */}
      <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-0.5 customFormScrollbar">
        <AnimatePresence>
          {fields.map((item, index) => {
            const isExpanded = expandedIndex === index
            const title = watch(`projects.${index}.title`)
            const coverImage = uploadedImages[index]

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="border rounded-xl overflow-hidden bg-background shadow-sm"
              >
                {/* Card header — click to collapse/expand */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  {/* Cover thumbnail or placeholder */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center border border-border/50">
                    {coverImage ? (
                      <Image src={coverImage} alt="" width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <FolderOpen size={16} className="text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {title || <span className="text-muted-foreground">Project {index + 1}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isExpanded ? "Click to collapse" : "Click to edit"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded form */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`projects.${index}.title`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Project Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`projects.${index}.title`}
                            placeholder="e.g. Portfolio Builder SaaS"
                            {...register(`projects.${index}.title` as const)}
                          />
                          {errors.projects?.[index]?.title && (
                            <p className="text-xs text-red-500">{errors.projects[index].title.message}</p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <Label htmlFor={`projects.${index}.description`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Description
                          </Label>
                          <Textarea
                            id={`projects.${index}.description`}
                            placeholder="What did you build? What problem does it solve? What tech did you use?"
                            className="resize-none"
                            rows={3}
                            {...register(`projects.${index}.description` as const)}
                          />
                          {errors.projects?.[index]?.description && (
                            <p className="text-xs text-red-500">{errors.projects[index].description.message}</p>
                          )}
                        </div>

                        {/* Link + Date row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor={`projects.${index}.link`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Link2 size={11} /> Project URL
                            </Label>
                            <Input
                              id={`projects.${index}.link`}
                              placeholder="https://..."
                              {...register(`projects.${index}.link` as const)}
                            />
                            {errors.projects?.[index]?.link && (
                              <p className="text-xs text-red-500">{errors.projects[index].link.message}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor={`projects.${index}.timeline`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Calendar size={11} /> Date
                            </Label>
                            <Input
                              id={`projects.${index}.timeline`}
                              type="date"
                              {...register(`projects.${index}.timeline` as const)}
                            />
                            {errors.projects?.[index]?.timeline && (
                              <p className="text-xs text-red-500">{errors.projects[index].timeline.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Cover image */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <ImageIcon size={11} /> Cover Image
                            <span className="ml-auto normal-case text-muted-foreground font-normal">Optional</span>
                          </Label>

                          {coverImage ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                              <Image
                                src={coverImage}
                                alt="Cover"
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover rounded-lg border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                  <ExternalLink size={11} /> Uploaded successfully
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setUploadedImages((prev) => { const n = { ...prev }; delete n[index]; return n })}
                                  className="text-xs text-muted-foreground hover:text-red-500 mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <label
                                htmlFor={`cover-${index}`}
                                className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-border/60 hover:border-border hover:bg-muted/20 transition-colors cursor-pointer"
                              >
                                <ImageIcon size={18} className="text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Click to upload image</span>
                              </label>
                              <input
                                id={`cover-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleCoverImageUpload(e, index)}
                              />
                              {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress[index])}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-blue-500 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress[index]}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add button (when there are already projects) */}
      {fields.length > 0 && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border/50 text-sm text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/20 transition-colors"
        >
          <Plus size={14} />
          Add another project
        </button>
      )}
    </div>
  )
}
