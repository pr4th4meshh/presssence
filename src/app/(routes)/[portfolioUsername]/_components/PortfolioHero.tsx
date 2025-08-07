import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import PrimaryButton from "@/components/ui/primary-button"
import EditButton from "./EditButton"
import { RiDoubleQuotesL } from "react-icons/ri"
import "react-loading-skeleton/dist/skeleton.css"
import InputField from "./portfolioHero/InputField"
import TextAreaField from "./portfolioHero/TextAreaField"
import ThemeSelect from "./portfolioHero/ThemeSelect"

interface IUser {
  image: string
  name: string
  email: string
}

interface IProfileData {
  fullName: string
  profession: string
  headline: string
  theme: string
  userId: string
}

const PortfolioHero = ({ profileData }: IProfileData) => {
  const params = useParams()
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profileData?.fullName || "")
  const [profession, setProfession] = useState(profileData?.profession || "")
  const [headline, setHeadline] = useState(profileData?.headline || "")
  const [theme, setTheme] = useState(profileData?.theme || "modern")
  const [file, setFile] = useState(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userData, setUserData] = useState<IUser | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
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
        setUserData(prevData => ({ ...prevData, image: downloadURL }))
        setUploadStatus("Profile image updated successfully! \n Save Changes to see the changes.")
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const updatedPortfolio = {
      fullName,
      profession,
      headline,
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
        setIsEditing(false)
      } else {
        alert(data.message || "Failed to update portfolio")
      }
    } catch (error) {
      console.error("Error updating portfolio:", error)
      alert("An error occurred while updating the portfolio")
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
                src={userData?.image || '/default-profile-picture.jpg'}
                alt={`${fullName}'s Profile Picture`}
                width={400}
                height={400}
                className="rounded-full object-cover w-[250px] sm:w-[300px] h-[250px] sm:h-[300px] border-2 dark:border-white border-black"
                priority
              />
            )}
          </div>
          {isEditing && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4"
                disabled={isUploading}
              />
              {file && (
                <PrimaryButton
                  title={isUploading ? "Uploading..." : "Upload profile picture"}
                  onClick={handleUpload}
                  className="bg-orange-500 text-white mt-2 w-full max-w-full border-orange-200"
                  disabled={isUploading}
                />
              )}
              {isUploading && <p className="text-blue-500 mt-2">Uploading image...</p>}
              {uploadStatus && <p className="text-green-500 mt-2 whitespace-pre text-center">{uploadStatus}</p>}
              {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
              <PrimaryButton
                title="Cancel Editing"
                onClick={() => setIsEditing(false)}
                className="w-full max-w-full border border-red-500 bg-transparent text-black dark:text-white transition-colors duration-300 mt-2"
                disabled={isUploading}
              />
            </div>
          )}
        </div>

        <div className="w-full sm:w-2/3 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField id="fullName" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <InputField id="profession" label="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
              <TextAreaField id="headline" label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
              <ThemeSelect value={theme} onChange={(e) => setTheme(e.target.value)} />
              <PrimaryButton title="Save Changes" type="submit" className="w-full" />
            </form>
          ) : (
            <div className="space-y-6 flex flex-col sm:justify-normal justify-center sm:items-start items-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">
                {fullName}
              </h1>
              <p className="text-3xl md:text-4xl text-black dark:text-white">
                {profession}
              </p>
              <p className="text-xl md:text-2xl flex italic dark:text-white text-black text-center">
                <RiDoubleQuotesL className="mr-2" /> {headline}
              </p>
              {session?.user?.id === profileData?.userId && (
                <EditButton
                  className="mt-4 flex self-end mr-2"
                  onClick={() => setIsEditing(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PortfolioHero