"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import { ForgotPasswordFields, ForgotPasswordSchema } from "@/lib/validations"
import { Field, FormError, SubmitButton } from "@/components/auth/fields"

const RESEND_COOLDOWN_SECONDS = 30

const linkClass =
  "font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"

export default function ForgotPasswordForm({ defaultEmail }: { defaultEmail: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const request = async (email: string) => {
    setErrorMessage("")
    const res = await fetch("/api/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErrorMessage(data.message ?? "Something went wrong. Try again.")
      return false
    }
    setSentTo(email.trim())
    setCooldown(RESEND_COOLDOWN_SECONDS)
    return true
  }

  if (sentTo) {
    return (
      <div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <MailCheck className="h-6 w-6 text-neutral-900" aria-hidden />
          <h2 className="mt-3 font-semibold text-neutral-900">Check your email</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-500" role="status">
            If there&apos;s an account for <span className="font-medium text-neutral-900">{sentTo}</span>,
            we&apos;ve sent it a link to reset the password. The link expires in 60 minutes.
          </p>
        </div>

        <FormError message={errorMessage} />

        <p className="mt-6 text-[15px] text-neutral-500">
          Nothing there? Check your spam folder, or{" "}
          {cooldown > 0 ? (
            <span>send it again in {cooldown}s.</span>
          ) : (
            <button
              type="button"
              disabled={resending}
              onClick={async () => {
                setResending(true)
                await request(sentTo)
                setResending(false)
              }}
              className={linkClass}
            >
              {resending ? "sending" : "send it again"}
            </button>
          )}
        </p>
        <p className="mt-3 text-[15px] text-neutral-500">
          Wrong email?{" "}
          <button type="button" onClick={() => setSentTo(null)} className={linkClass}>
            Use a different one
          </button>
        </p>

        <p className="mt-8 text-[15px]">
          <Link href="/auth/login" className={linkClass}>
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(({ email }) => request(email))} noValidate className="space-y-4">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormError message={errorMessage} />
        <div className="pt-2">
          <SubmitButton pending={isSubmitting}>{isSubmitting ? "Sending link" : "Send reset link"}</SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-[15px] text-neutral-500">
        Remembered it?{" "}
        <Link href="/auth/login" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </>
  )
}
