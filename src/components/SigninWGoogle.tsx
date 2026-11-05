"use client"
import React from "react"
import PrimaryButton from "./ui/primary-button"
import { signIn } from "next-auth/react"

interface ISigninWGoogle {
  className?: string
  callbackUrl?: string
  label?: string
}

const SigninWGoogle = ({ className, callbackUrl = "/me", label = "Sign in with Google" }: ISigninWGoogle) => {
  return (
    <PrimaryButton
      className={className}
      title={label}
      onClick={() => signIn("google", { callbackUrl })}
    />
  )
}

export default SigninWGoogle
