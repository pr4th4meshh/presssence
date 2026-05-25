import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import PrimaryButton from "@/components/ui/primary-button"
import { FiEdit3, FiCheck, FiX } from "react-icons/fi"
import "react-loading-skeleton/dist/skeleton.css"
import { ProfileData } from "@/types"

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
    } catch {
      // fail silently — user will see the value revert
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
          headers: { "Content-Type": "application/json" },
        }
      )
      const data = await response.json()
      setUserId(data)
    } catch {
      // silently fail
    }
  }

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/user?username=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      setUserData(data)
    } catch {
      // silently fail
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
    <div className="py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="relative group">
            {!userData?.image ? (
              <ImageLoadingSkeleton />
            ) : (
              <Image
                src={userData?.image || '/qp_default_avatar0.jpg'}
                alt={`${fullName}'s Profile Picture`}
                width={400}
                height={400}
                className="rounded-2xl object-cover w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] shadow-2xl dark:shadow-black/60 border dark:border-neutral-700 border-gray-200"
                priority
              />
            )}
            {isOwner && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl transition-all duration-300 flex items-center justify-center">
                <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg shadow-lg text-xs font-medium flex items-center gap-1.5">
                    <FiEdit3 size={12} />
                    Change photo
                  </div>
                </label>
              </div>
            )}
          </div>

          {file && (
            <div className="w-full max-w-[240px] space-y-2">
              <PrimaryButton
                title={isUploading ? "Uploading..." : "Save photo"}
                onClick={handleUpload}
                className="w-full text-sm"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-blue-500 text-xs text-center">Uploading...</p>
              )}
              {uploadStatus && (
                <p className="text-green-500 text-xs text-center">{uploadStatus}</p>
              )}
              {uploadError && (
                <p className="text-red-500 text-xs text-center">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
          {isOwner && (
            <p className="text-xs dark:text-neutral-500 text-gray-400 font-medium uppercase tracking-widest">
              Click any field to edit
            </p>
          )}
          <EditableField
            value={fullName}
            onSave={(value) => handleSaveField('fullName', value)}
            isOwner={isOwner}
            className="portfolio-name text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            placeholder="Your Full Name"
            maxLength={50}
          />

          <EditableField
            value={profession}
            onSave={(value) => handleSaveField('profession', value)}
            isOwner={isOwner}
            className="portfolio-profession text-xl md:text-2xl dark:text-blue-400 text-blue-600 font-medium"
            placeholder="Your Profession"
            maxLength={100}
          />

          <EditableField
            value={headline}
            onSave={(value) => handleSaveField('headline', value)}
            isOwner={isOwner}
            className="portfolio-headline text-base md:text-lg dark:text-gray-300 text-gray-600 leading-relaxed max-w-xl"
            placeholder="A short bio or tagline about yourself"
            multiline={true}
            maxLength={200}
          />
        </div>
      </div>
    </div>
  )
}

export default PortfolioHero