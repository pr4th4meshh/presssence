import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/serverAuth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/onboarding")
  }

  const existing = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    select: { username: true },
  })

  if (existing) {
    redirect(`/${existing.username}`)
  }

  return children
}
