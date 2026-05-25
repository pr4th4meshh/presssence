"use client"

import { registerUser } from "@/actions/registerUser"
import SigninWGoogle from "@/components/SigninWGoogle"
import BorderStyleButton from "@/components/ui/border-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormFields, SignupSchemaFrontend } from "@/lib/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { PiSpinner } from "react-icons/pi"

const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState("")
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(SignupSchemaFrontend),
  })
  const router = useRouter()

  const handleOnSubmit = async (data: FormFields) => {
    setErrorMessage("")
    try {
      const { name, email, password } = data
      const response = await registerUser(name, email, password, "")
      if (response?.error) {
        setErrorMessage(response.error)
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-foreground mb-6">
            Presssence
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your portfolio</h1>
          <p className="text-muted-foreground text-sm">Free forever. No credit card required.</p>
        </div>

        <div className="w-full p-8 bg-card border border-border shadow-xl rounded-2xl">
          <SigninWGoogle className="w-full text-sm mb-4" />

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form className="flex flex-col space-y-4" onSubmit={handleSubmit(handleOnSubmit)}>
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Full name
              </Label>
              <Input id="name" type="text" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
              title={isSubmitting ? <PiSpinner className="animate-spin text-xl" /> : "Create account"}
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            />
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
