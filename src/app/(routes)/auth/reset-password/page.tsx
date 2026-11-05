import type { Metadata } from "next"
import Link from "next/link"
import AuthShell from "@/components/auth/AuthShell"
import { prisma } from "@/lib/prisma"
import { findResetToken, RESET_TOKEN_TTL_MINUTES } from "@/lib/passwordReset"
import ResetPasswordForm from "./ResetPasswordForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
  // The token is in the URL; don't pass it on to other sites in the Referer header.
  referrer: "no-referrer",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const found = typeof token === "string" ? await findResetToken(token) : null
  const user = found
    ? await prisma.user.findUnique({ where: { id: found.userId }, select: { email: true } })
    : null

  if (!token || !user?.email) {
    return (
      <AuthShell
        title="This link has expired"
        subtitle={`Reset links work once and expire after ${RESET_TOKEN_TTL_MINUTES} minutes. Ask for a new one and use the latest email.`}
      >
        <Link
          href="/auth/forgot-password"
          className="flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 text-[15px] font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f5]"
        >
          Send a new link
        </Link>
        <p className="mt-8 text-[15px]">
          <Link
            href="/auth/login"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
          >
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle={`For ${user.email}. You'll be signed in as soon as it's saved.`}
    >
      <ResetPasswordForm token={token} email={user.email} />
    </AuthShell>
  )
}
