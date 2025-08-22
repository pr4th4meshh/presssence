import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import PrimaryButton from "@/components/ui/primary-button"
import { FiEdit3, FiCheck, FiX } from "react-icons/fi"
import "react-loading-skeleton/dist/skeleton.css"
import { ProfileData } from "@/utils/interfaces"

interface IUser {
  image: string
  name: string
  email: string
}

interface IProfileData {
  fullName?: string
  profession?: string
  headline?: string
  theme?: string
  userId?: string
}

// Individual Editable Component
const EditableField = ({
  value,
  onSave,
  isOwner,
  className = "",
  placeholder = "Click to edit",
  multiline = false,
  maxLength = 100
}: {
  value: string
  onSave: (newValue: string) => Promise<void>
  isOwner: boolean
  className?: string
  placeholder?: string
  multiline?: boolean
  maxLength?: number
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (!isEditing) return

    if (saveTimeout.current) clearTimeout(saveTimeout.current)

    saveTimeout.current = setTimeout(() => {
      if (editValue.trim() !== value.trim()) {
        saveChanges()
      } else {
        setIsEditing(false)
      }
    }, 3000)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [editValue])

  // Detect outside clicks
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        saveChanges()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing, editValue])

  const saveChanges = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (editValue.trim() !== value.trim()) {
        await onSave(editValue.trim())
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    }

    if (e.key === "Enter") {
      e.preventDefault()
      saveChanges()
    }
  }

  if (!isOwner) {
    return <div className={className}>{value || placeholder}</div>
  }

  return (
    <div ref={wrapperRef}>
      {isEditing ? (
        multiline ? (
          <input
            ref={(el) => {
              inputRef.current = el
              if (el) el.focus()
            }}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${className} w-auto lg:w-[650px] bg-transparent border-2 border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 resize-none`}
            placeholder={placeholder}
            maxLength={maxLength}
          
          />
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el
              if (el) el.focus()
            }}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${className} bg-transparent border-2 border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        )
      ) : (
        <div
          className={`${className} group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1 transition-all duration-200 -mx-2`}
          onClick={() => setIsEditing(true)}
        >
          {value || placeholder}
          <div className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1 rounded-full mr-2">
              <FiEdit3 size={14} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


const PortfolioHero = ({ profileData }: { profileData: ProfileData | null }) => {
  const params = useParams()
  const { data: session, update } = useSession()
  const [fullName, setFullName] = useState(profileData?.fullName || "")
  const [profession, setProfession] = useState(profileData?.profession || "")
  const [headline, setHeadline] = useState(profileData?.headline || "")
  const [theme, setTheme] = useState(profileData?.theme || "modern")
  const [file, setFile] = useState<File | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<IUser | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const isOwner = session?.user?.id === profileData?.userId

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const getUserId = async () => {
    try {
      const response = await fetch(
        `/api/portfolio/get-user-id?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const data = await response.json()
      setUserId(data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/user?username=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUserId()
  }, [params.portfolioUsername])

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const storageRef = ref(
      storage,
      `profile_images/${session?.user?.id}_${file.name}`
    )
    try {
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const response = await fetch("/api/user/update-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoUrl: downloadURL }),
      })

      const data = await response.json()
      if (response.ok) {
        update({ ...session, user: { ...session?.user, image: downloadURL } })
        setUserData(prevData => prevData ? { ...prevData, image: downloadURL } : null)
        setUploadStatus("Profile image updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update profile image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      setFile(null)
    }
  }

  const handleSaveField = async (field: string, value: string) => {
    const updatedPortfolio = {
      fullName: field === 'fullName' ? value : fullName,
      profession: field === 'profession' ? value : profession,
      headline: field === 'headline' ? value : headline,
      theme,
    }

    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPortfolio),
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Update local state
        if (field === 'fullName') setFullName(value)
        if (field === 'profession') setProfession(value)
        if (field === 'headline') setHeadline(value)
      } else {
        throw new Error(data.message || "Failed to update portfolio")
      }
    } catch (error) {
      console.error("Error updating portfolio:", error)
      throw error
    }
  }

  const ImageLoadingSkeleton = () => {
    return (
      <div className="w-[250px] sm:w-[300px] h-[250px] sm:h-[300px] bg-gray-400 rounded-full animate-pulse" />
    )
  }

  return (
    <div className="container mx-auto px-4 py-20 md:py-24">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-12">
        <div className="w-full sm:w-1/3 flex flex-col items-center space-y-6">
          <div className="relative group">
            {!userData?.image ? (
              <ImageLoadingSkeleton />
            ) : (
              <Image
                src={userData?.image || '/qp_default_avatar0.jpg'}
                alt={`${fullName}'s Profile Picture`}
                width={400}
                height={400}
                className="rounded-full object-cover w-[250px] sm:w-[300px] h-[250px] sm:h-[300px] border-2 dark:border-white border-black"
                priority
              />
            )}
            {isOwner && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                    <FiEdit3 size={20} />
                  </div>
                </label>
              </div>
            )}
          </div>
          
          {file && (
            <div className="w-full max-w-xs">
              <PrimaryButton
                title={isUploading ? "Uploading..." : "Upload profile picture"}
                onClick={handleUpload}
                className="bg-orange-500 text-white w-full border-orange-200"
                disabled={isUploading}
              />
              {isUploading && <p className="text-blue-500 mt-2 text-center">Uploading image...</p>}
              {uploadStatus && <p className="text-green-500 mt-2 text-center">{uploadStatus}</p>}
              {uploadError && <p className="text-red-500 mt-2 text-center">{uploadError}</p>}
            </div>
          )}
        </div>

        <div className="w-full sm:w-2/3 space-y-6">
          <div className="space-y-6 flex flex-col sm:justify-normal justify-center sm:items-start items-center">
            <EditableField
              value={fullName}
              onSave={(value) => handleSaveField('fullName', value)}
              isOwner={isOwner}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100"
              placeholder="Enter your full name"
              maxLength={50}
            />
            
            <EditableField
              value={profession}
              onSave={(value) => handleSaveField('profession', value)}
              isOwner={isOwner}
              className="text-3xl md:text-4xl text-black dark:text-white"
              placeholder="Enter your profession"
              maxLength={100}
            />
            
            <EditableField
              value={headline}
              onSave={(value) => handleSaveField('headline', value)}
              isOwner={isOwner}
              className="text-xl md:text-2xl italic dark:text-white text-black text-center flex items-center"
              placeholder="Write a compelling headline"
              multiline={true}
              maxLength={200}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioHero