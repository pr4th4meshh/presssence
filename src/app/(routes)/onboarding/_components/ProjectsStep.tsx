"use client"

import { UseFormRegister, FieldErrors, Control, useFieldArray, UseFormWatch } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { useState } from "react"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
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
  FolderOpen,
  Check,
  Loader2,
  X,
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
  const [uploading, setUploading] = useState<Set<number>>(new Set())
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>({})
  const [expandedIndex, setExpandedIndex] = useState<number>(0)

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading((prev) => new Set(prev).add(index))
    try {
      const url = await uploadToCloudinary(file, "presssence/projects")
      control._formValues.projects[index].coverImage = url
      setUploadedImages((prev) => ({ ...prev, [index]: url }))
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading((prev) => { const next = new Set(prev); next.delete(index); return next })
    }
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
    setExpandedIndex(Math.max(0, index - 1))
  }

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index)
  }

  return (
    <div className="space-y-3">
      {/* Counter row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {fields.length === 0
            ? "Add at least one project"
            : `${fields.length} project${fields.length > 1 ? "s" : ""} added`}
        </p>
        {fields.length > 0 && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={12} />
            Add project
          </button>
        )}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAdd}
          className="w-full flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-border/60 text-center hover:border-border hover:bg-muted/20 transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center mb-3">
            <FolderOpen size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Add your first project</p>
          <p className="text-xs text-muted-foreground mt-1">Showcase your best work to recruiters</p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background">
            <Plus size={12} />
            New project
          </div>
        </motion.button>
      )}

      {/* Project cards */}
      <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-0.5 customFormScrollbar">
        <AnimatePresence initial={false}>
          {fields.map((item, index) => {
            const isExpanded = expandedIndex === index
            const title = watch(`projects.${index}.title`)
            const coverImage = uploadedImages[index]
            const isUploading = uploading.has(index)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="border border-border rounded-xl overflow-hidden bg-background"
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Thumbnail or index badge */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center border border-border/50">
                    {coverImage ? (
                      <Image src={coverImage} alt="" width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Title / subtitle — clickable to toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium truncate">
                      {title || <span className="text-muted-foreground font-normal">Untitled project</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{isExpanded ? "Collapse" : "Edit details"}</p>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(index)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={15} />
                      </motion.div>
                    </button>
                  </div>
                </div>

                {/* Expanded form */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="form"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 space-y-4 border-t border-border/50">
                        {/* Title */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="e.g. Portfolio Builder SaaS"
                            {...register(`projects.${index}.title` as const)}
                          />
                          {errors.projects?.[index]?.title && (
                            <p className="text-xs text-red-500">{errors.projects[index].title.message}</p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Description
                          </Label>
                          <Textarea
                            placeholder="What did you build? What problem does it solve?"
                            className="resize-none text-sm"
                            rows={3}
                            {...register(`projects.${index}.description` as const)}
                          />
                          {errors.projects?.[index]?.description && (
                            <p className="text-xs text-red-500">{errors.projects[index].description.message}</p>
                          )}
                        </div>

                        {/* Link + Date */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Link2 size={10} /> URL
                            </Label>
                            <Input
                              placeholder="https://..."
                              {...register(`projects.${index}.link` as const)}
                            />
                            {errors.projects?.[index]?.link && (
                              <p className="text-xs text-red-500">{errors.projects[index].link.message}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Calendar size={10} /> Date
                            </Label>
                            <Input
                              type="date"
                              {...register(`projects.${index}.timeline` as const)}
                            />
                          </div>
                        </div>

                        {/* Cover image */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <ImageIcon size={10} /> Cover Image
                            <span className="ml-auto normal-case font-normal text-muted-foreground/70">Optional</span>
                          </Label>

                          {coverImage ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                              <Image
                                src={coverImage}
                                alt="Cover"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-md border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                  <Check size={11} /> Uploaded
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setUploadedImages((prev) => { const n = { ...prev }; delete n[index]; return n })}
                                className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`cover-${index}`}
                              className="relative flex flex-col items-center justify-center h-[72px] rounded-lg border-2 border-dashed border-border/60 hover:border-border hover:bg-muted/20 transition-colors cursor-pointer"
                            >
                              {isUploading ? (
                                <div className="flex flex-col items-center gap-1.5">
                                  <Loader2 size={18} className="text-muted-foreground animate-spin" />
                                  <span className="text-xs text-muted-foreground">Uploading…</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <ImageIcon size={16} className="text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Click to upload</span>
                                </div>
                              )}
                              <input
                                id={`cover-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => handleCoverImageUpload(e, index)}
                              />
                            </label>
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

      {/* Add another */}
      {fields.length > 0 && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border/50 text-sm text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/20 transition-colors"
        >
          <Plus size={13} />
          Add another project
        </button>
      )}
    </div>
  )
}
