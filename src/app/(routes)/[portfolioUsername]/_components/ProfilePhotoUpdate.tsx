"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import Image from 'next/image'

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string
  onPhotoUpdate: (newPhotoUrl: string) => void
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ currentPhotoUrl, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl)
  const { data: session } = useSession()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const storageRef = ref(storage, `profile-photos/${session?.user?.id}`)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)
      
      setPhotoUrl(downloadUrl)
      onPhotoUpdate(downloadUrl)

      // Update the user's profile photo URL in your database
      await fetch('/api/user/update-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: downloadUrl }),
      })
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Image
        src={photoUrl || '/default-avatar.png'}
        alt="Profile Photo"
        width={100}
        height={100}
        className="rounded-full"
      />
      <button className="relative">
        {uploading ? 'Uploading...' : 'Change Photo'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </button>
    </div>
  )
}

export default ProfilePhotoUpload