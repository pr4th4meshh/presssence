"use client"

import { useState, useEffect } from "react"
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { useDebounce } from "@/hooks/useDebounce"
import { PiSpinner } from "react-icons/pi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, User, AtSign } from "lucide-react"

interface BasicInfoStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export default function BasicInfoStep({ register, errors, watch, setValue }: BasicInfoStepProps) {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true)
  const [checkingUsernameLoading, setCheckingUsernameLoading] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  const checkingUsername = watch("username")
  const fullName = watch("fullName")
  const debouncedValue = useDebounce(checkingUsername)

  useEffect(() => {
    const checkUsernameAvailability = async (username: string) => {
      if (!username || username.length <= 2) {
        setHasChecked(false)
        return
      }
      setCheckingUsernameLoading(true)
      setHasChecked(false)
      try {
        const res = await fetch("/api/checkUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        })
        const data = await res.json()
        setIsUsernameAvailable(res.ok ? data.available : true)
        setHasChecked(true)
      } catch (error) {
        console.error(error)
        setIsUsernameAvailable(false)
        setHasChecked(true)
      } finally {
        setCheckingUsernameLoading(false)
      }
    }

    checkUsernameAvailability(debouncedValue)
  }, [debouncedValue])

  const initials = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : null

  return (
    <div className="space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {initials ? initials : <User size={24} />}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{fullName || "Your Name"}</p>
          <p className="text-xs text-muted-foreground truncate">
            presssence.me/<span className="text-blue-500 font-medium">{checkingUsername || "yourname"}</span>
          </p>
        </div>
      </div>

      {/* Username field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium flex items-center gap-1.5">
          <AtSign size={14} />
          Username
        </Label>
        <div className="relative">
          <Input
            id="username"
            placeholder="yourname"
            autoComplete="off"
            autoFocus
            className="pr-10"
            {...register("username")}
            onChange={(e) => setValue("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsernameLoading && (
              <PiSpinner className="animate-spin text-muted-foreground" />
            )}
            {!checkingUsernameLoading && hasChecked && isUsernameAvailable && (
              <CheckCircle2 size={16} className="text-green-500" />
            )}
            {!checkingUsernameLoading && hasChecked && !isUsernameAvailable && (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
        </div>

        {/* Status message */}
        <div className="h-4">
          {!checkingUsernameLoading && hasChecked && isUsernameAvailable && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle2 size={11} /> Username is available
            </p>
          )}
          {!checkingUsernameLoading && hasChecked && !isUsernameAvailable && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <XCircle size={11} /> Username is taken or unavailable
            </p>
          )}
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* URL preview pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 w-fit text-xs text-muted-foreground border border-border/40">
          <span>presssence.me/</span>
          <span className={`font-medium ${checkingUsername?.length > 2 && hasChecked && isUsernameAvailable ? "text-green-500" : "text-foreground"}`}>
            {checkingUsername || "yourname"}
          </span>
        </div>
      </div>

      {/* Full name field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
          <User size={14} />
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>
    </div>
  )
}
