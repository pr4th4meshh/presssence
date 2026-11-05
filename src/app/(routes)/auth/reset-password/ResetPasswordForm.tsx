"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetPasswordFields, ResetPasswordSchema } from "@/lib/validations"
import { FormError, PasswordField, SubmitButton } from "@/components/auth/fields"

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [errorMessage, setErrorMessage] = useState("")
  const [expired, setExpired] = useState(false)
  // Stays true after success so the button doesn't flash back while navigating.
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({ resolver: zodResolver(ResetPasswordSchema) })
  const pending = isSubmitting || redirecting

  const onSubmit = async ({ password }: ResetPasswordFields) => {
    setErrorMessage("")
    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setExpired(res.status === 400 && /expired|used/.test(data.message ?? ""))
      setErrorMessage(data.message ?? "Something went wrong. Try again.")
      return
    }

    setRedirecting(true)
    const result = await signIn("credentials", { redirect: false, email: data.email, password })
    if (result?.error) {
      router.replace("/auth/login?reset=1")
      return
    }
    router.replace("/me")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Lets password managers save the new password against the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} hidden readOnly />
      <PasswordField
        id="password"
        label="New password"
        autoComplete="new-password"
        autoFocus
        hint="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        id="confirm"
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <FormError message={errorMessage} />
      {expired && (
        <p className="text-[15px]">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
          >
            Send a new link
          </Link>
        </p>
      )}
      <div className="pt-2">
        <SubmitButton pending={pending}>{pending ? "Saving" : "Save password"}</SubmitButton>
      </div>
    </form>
  )
}
