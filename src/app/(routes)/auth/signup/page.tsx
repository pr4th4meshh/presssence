import type { Metadata } from "next"
import { safeCallbackUrl } from "@/lib/validations"
import SignupForm from "./SignupForm"

export const metadata: Metadata = { title: "Create your portfolio" }

interface SignupPageProps {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  // New accounts have no portfolio yet, so the default /me sends them to onboarding.
  const { callbackUrl } = await searchParams
  return <SignupForm callbackUrl={safeCallbackUrl(callbackUrl)} />
}
