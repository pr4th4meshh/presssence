import React, { useState } from "react"
import PrimaryButton from "@/components/ui/primary-button"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { Input } from "@/components/ui/input"

interface ImageUploadProps {
  currentImageUrl: string | null
  onImageUpload: (newImageUrl: string) => void
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
}) => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const storageRef = ref(storage, `profile_images/${file.name}`)
    try {
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      onImageUpload(downloadURL)
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  return (
    <div className="relative group">
      {!currentImageUrl ? (
        <div className="w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gray-400 rounded-full animate-pulse" />
      ) : (
        <Image
          height={400}
          width={400}
          src={currentImageUrl}
          alt="Profile"
          className="rounded-full object-cover w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] border-2 dark:border-white border-black"
        />
      )}
      {file && (
        <PrimaryButton
          title="Upload profile picture"
          onClick={handleUpload}
          className="bg-orange-500 text-white mt-2 w-full max-w-full border-orange-200"
        />
      )}
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-4"
      />
    </div>
  )
}

export default ImageUpload
