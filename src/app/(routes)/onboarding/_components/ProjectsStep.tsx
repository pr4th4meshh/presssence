import { UseFormRegister, FieldErrors, Control, useFieldArray } from "react-hook-form"
import { FormData } from "@/lib/zod"
import { useState } from "react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProjectsStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  control: Control<FormData>
}

export default function ProjectsStep({ register, errors, control }: ProjectsStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  })

  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const storageRef = ref(storage, `projects/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(prev => ({ ...prev, [index]: progress }))
      },
      (error) => {
        console.error("Error uploading image:", error)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          control._formValues.projects[index].coverImage = downloadURL
        })
      }
    )
  }

  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto customFormScrollbar">
      <h2 className="text-lg font-semibold">Projects</h2>
      {fields.map((item, index) => (
        <div key={item.id} className="space-y-2 p-4 border border-input rounded-md">
          <h3 className="text-xl font-bold text-center text-blue-500 dark:text-blue-300 mb-3 uppercase">
            Project {index + 1}
          </h3>
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.title`} className="block text-sm font-medium">
              Project Title
            </Label>
            <Input
              id={`projects.${index}.title`}
              placeholder="Project Title"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              {...register(`projects.${index}.title` as const)}
            />
            {errors.projects?.[index]?.title && (
              <p className="text-sm text-red-500">{errors.projects[index].title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.description`} className="block text-sm font-medium">
              Project Description
            </Label>
            <Textarea
              id={`projects.${index}.description`}
              placeholder="Describe your project"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              {...register(`projects.${index}.description` as const)}
            />
            {errors.projects?.[index]?.description && (
              <p className="text-sm text-red-500">{errors.projects[index].description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.link`} className="block text-sm font-medium">
              Project Link
            </Label>
            <Input
              id={`projects.${index}.link`}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              {...register(`projects.${index}.link` as const)}
            />
            {errors.projects?.[index]?.link && (
              <p className="text-sm text-red-500">{errors.projects[index].link.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.timeline`} className="block text-sm font-medium">
              Project Timeline
            </Label>
            <Input
              id={`projects.${index}.timeline`}
              type="date"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              {...register(`projects.${index}.timeline` as const)}
            />
            {errors.projects?.[index]?.timeline && (
              <p className="text-sm text-red-500">{errors.projects[index].timeline.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`projects.${index}.coverImage`} className="block text-sm font-medium">
              Cover Image
            </Label>
            <Input
              id={`projects.${index}.coverImage`}
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverImageUpload(e, index)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
              <p className="text-sm text-blue-500">Uploading... {uploadProgress[index].toFixed(0)}%</p>
            )}
          </div>
          <Button
            type="button"
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={() => remove(index)}
          >
            Remove Project
          </Button>
        </div>
      ))}
      <Button
        type="button"
        className="w-full px-3 py-2 border border-input rounded-md dark:bg-white dark:text-black text-white bg-black hover:bg-accent focus:outline-none"
        onClick={() => append({ title: "", description: "", link: "", timeline: "" })}
      >
        Add Another Project
      </Button>
    </div>
  )
}