import { Input } from "@/components/ui/input"
import React from "react"

const ImageUpload = ({
  selectedFile,
  setSelectedFile,
  setImagePreviews,
  imagePreviews,
  index,
}: {
  selectedFile: File | null
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>
  setImagePreviews: React.Dispatch<React.SetStateAction<(string | null)[]>>
  imagePreviews: (string | null)[]
  index: number
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFile) return;
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updatedPreviews = [...imagePreviews]
        updatedPreviews[index] = reader.result as string
        setImagePreviews(updatedPreviews)
        setSelectedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="block w-full p-2 border border-gray-300 rounded-md"
    />
  )
}

export default ImageUpload