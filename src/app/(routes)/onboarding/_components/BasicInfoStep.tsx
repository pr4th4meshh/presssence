import { useState, useEffect } from "react"
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormData } from "@/lib/zod"
import { useDebounce } from "@/hooks/useDebounce"
import { PiSpinner } from "react-icons/pi"

interface BasicInfoStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export default function BasicInfoStep({ register, errors, watch, setValue }: BasicInfoStepProps) {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [checkingUsernameLoading, setCheckingUsernameLoading] = useState(false)

  const checkingUsername = watch("username")
  const debouncedValue = useDebounce(checkingUsername)

  useEffect(() => {
    const checkUsernameAvailability = async (username: string) => {
      if (!username || username.length <= 2) return
      setCheckingUsernameLoading(true)
      try {
        const res = await fetch("/api/checkUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        })
        const data = await res.json()
        setIsUsernameAvailable(res.ok ? data.available : true)
      } catch (error) {
        console.error(error)
        setIsUsernameAvailable(false)
      } finally {
        setCheckingUsernameLoading(false)
      }
    }

    checkUsernameAvailability(debouncedValue)
  }, [debouncedValue])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="username" className="block text-sm font-medium">Choose your username</label>
          {checkingUsernameLoading && <PiSpinner className="animate-spin text-xl" />}
          {!checkingUsernameLoading && isUsernameAvailable && checkingUsername?.length > 2 && (
            <p className="text-sm text-green-500">Username available!</p>
          )}
          {!checkingUsernameLoading && !isUsernameAvailable && (
            <p className="text-sm text-red-500">Username unavailable or already taken</p>
          )}
        </div>
        <input
          id="username"
          placeholder="Choose your username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("username")}
          onChange={(e) => setValue("username", e.target.value.toLowerCase())}
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        <p className="text-sm text-gray-500">
          This will be your profile URL: presssence.me/{watch("username") || "yourname"}
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium">Full Name</label>
        <input
          id="fullName"
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("fullName")}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
      </div>
    </div>
  )
}