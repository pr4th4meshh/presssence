import type { Metadata } from "next"
import AuthShell from "@/components/auth/AuthShell"
import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata: Metadata = { title: "Reset your password" }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new one."
    >
      <ForgotPasswordForm defaultEmail={typeof email === "string" ? email.slice(0, 254) : ""} />
    </AuthShell>
  )
}
