import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/serverAuth"
import { prisma } from "@/lib/prisma"
import SettingsView from "./SettingsView"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
}

export default async function SettingsPage() {
  const session = await getAuthSession()
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/settings")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      password: true,
      accounts: { select: { provider: true } },
      portfolio: { select: { username: true } },
    },
  })
  if (!user) redirect("/auth/login")

  const signInMethods = [
    ...(user.password ? ["Email and password"] : []),
    ...user.accounts.map((a) => (a.provider === "google" ? "Google" : a.provider)),
  ]

  return (
    <SettingsView
      name={user.name ?? ""}
      email={user.email ?? ""}
      signInMethods={signInMethods}
      username={user.portfolio?.username ?? null}
    />
  )
}
