"use client"
import React from "react"
import PrimaryButton from "./ui/primary-button"
import { signIn } from "next-auth/react"

interface ISigninWGoogle {
  className?: string
}
const SigninWGoogle = ({className}: ISigninWGoogle) => {
  const handleSignIn = () => {
    signIn("google")
    console.log("clicked")
  }
  return <PrimaryButton className={className} title="Sign in with Google" onClick={handleSignIn} />
}

export default SigninWGoogle
