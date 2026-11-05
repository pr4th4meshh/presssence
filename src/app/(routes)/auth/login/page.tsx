import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import PortfolioPreview from "@/components/auth/PortfolioPreview"
import { getDemoProfile } from "@/lib/demoProfile"
import { safeCallbackUrl } from "@/lib/validations"
import LoginForm from "./LoginForm"

export const metadata: Metadata = { title: "Sign in" }

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string; reset?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ callbackUrl, error, reset }, demo] = await Promise.all([searchParams, getDemoProfile()])

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to edit your portfolio."
      aside={
        <>
          <PortfolioPreview
            username={demo.username}
            name={demo.fullName}
            profession={demo.profession}
            headline={demo.headline}
            photo={demo.photo}
            skills={demo.skills}
            projects={demo.projects}
          />
          <p className="mt-6 text-sm text-neutral-500">
            A real portfolio made with Presssence.{" "}
            <Link
              href={`/${demo.username}`}
              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
            >
              Visit it
            </Link>
          </p>
        </>
      }
    >
      <LoginForm
        callbackUrl={safeCallbackUrl(callbackUrl)}
        oauthError={error ?? null}
        passwordReset={reset === "1"}
      />
    </AuthShell>
  )
}
