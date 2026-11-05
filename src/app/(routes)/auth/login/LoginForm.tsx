"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFields, LoginSchemaFrontend } from "@/lib/validations"
import {
  Field,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
} from "@/components/auth/fields"

/** NextAuth redirects here with ?error=<code> when OAuth sign-in fails. */
const OAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email already has an account with a password. Sign in with your email and password instead.",
  AccessDenied: "Google sign-in was cancelled.",
  Callback: "Google sign-in didn't complete. Try again.",
  OAuthCallback: "Google sign-in didn't complete. Try again.",
}

export default function LoginForm({
  callbackUrl,
  oauthError,
}: {
  callbackUrl: string
  oauthError: string | null
}) {
  const [errorMessage, setErrorMessage] = useState(
    oauthError ? OAUTH_ERRORS[oauthError] ?? "Sign-in failed. Try again." : ""
  )
  // Stays true after success so the button doesn't flash back while navigating.
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(LoginSchemaFrontend) })
  const pending = isSubmitting || redirecting

  const onSubmit = async ({ email, password }: LoginFields) => {
    setErrorMessage("")
    const result = await signIn("credentials", { redirect: false, email, password })
    if (result?.error) {
      setErrorMessage(
        result.error === "CredentialsSignin" ? "Invalid email or password" : result.error
      )
      return
    }
    setRedirecting(true)
    router.replace(callbackUrl)
    router.refresh()
  }

  const signupHref =
    callbackUrl !== "/me" ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/signup"

  return (
    <>
      <GoogleButton callbackUrl={callbackUrl} />
      <OrDivider />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
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
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormError message={errorMessage} />
        <div className="pt-2">
          <SubmitButton pending={pending}>
            {pending ? "Signing in" : "Sign in"}
          </SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-[15px] text-neutral-500">
        New to Presssence?{" "}
        <Link
          href={signupHref}
          className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
        >
          Create an account
        </Link>
      </p>
    </>
  )
}
