"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerUser } from "@/actions/registerUser"
import { FormFields, SignupSchemaFrontend } from "@/lib/validations"
import AuthShell from "@/components/auth/AuthShell"
import PortfolioPreview from "@/components/auth/PortfolioPreview"
import {
  Field,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
} from "@/components/auth/fields"

/** What onboarding will likely suggest; the real username is chosen there. */
function suggestUsername(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "yourname"
}

export default function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const [errorMessage, setErrorMessage] = useState("")
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(SignupSchemaFrontend) })
  const pending = isSubmitting || redirecting
  const name = watch("name")?.trim() ?? ""

  const onSubmit = async ({ name, email, password }: FormFields) => {
    setErrorMessage("")
    try {
      const response = await registerUser(name, email, password)
      if (response?.error) {
        setErrorMessage(response.error)
        return
      }
      // Sign straight in rather than making a new user type it all again.
      const result = await signIn("credentials", { redirect: false, email, password })
      setRedirecting(true)
      router.replace(result?.error ? "/auth/login" : callbackUrl)
      router.refresh()
    } catch {
      setErrorMessage("Couldn't reach the server. Check your connection and try again.")
    }
  }

  const loginHref =
    callbackUrl !== "/me" ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/login"

  return (
    <AuthShell
      title="Create your portfolio"
      subtitle="It's free. You'll have a live link in a few minutes."
      aside={
        <>
          <PortfolioPreview username={suggestUsername(name)} name={name} draft />
          <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-neutral-500">
            This is your page. You&apos;ll pick your URL and add your work, skills and links next.
          </p>
        </>
      }
    >
      <GoogleButton callbackUrl={callbackUrl} />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field
          id="name"
          label="Name"
          autoComplete="name"
          autoFocus
          placeholder="Ada Lovelace"
          error={errors.name?.message}
          {...register("name")}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register("password")}
        />
        <FormError message={errorMessage} />
        <div className="pt-2">
          <SubmitButton pending={pending}>
            {pending ? "Creating account" : "Create account"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-[15px] text-neutral-500">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
