"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FormFields, LoginFields, LoginSchemaFrontend } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import BorderStyleButton from "@/components/ui/border-button"
import SigninWGoogle from "@/components/SigninWGoogle"
import { PiSpinner } from "react-icons/pi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState("")
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(LoginSchemaFrontend),
  })
  const router = useRouter()

  const handleOnSubmit = async (data: LoginFields) => {
    const { email, password } = data
    const result = await signIn("credentials", { redirect: false, email, password })
    if (result?.error) {
      setErrorMessage(result?.error)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-foreground mb-6">
            Presssence
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
        </div>

        <div className="w-full p-8 bg-card border border-border shadow-xl rounded-2xl">
          <SigninWGoogle className="w-full text-sm mb-4" />

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit(handleOnSubmit)}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email address
              </Label>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
              </div>
            )}

            <BorderStyleButton
              title={isSubmitting ? <PiSpinner className="animate-spin text-xl" /> : "Sign in"}
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            />
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
