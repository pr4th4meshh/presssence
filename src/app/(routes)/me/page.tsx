import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/serverAuth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Stable "my portfolio" entry point. Sends signed-in users to their portfolio,
 * or to onboarding if they haven't made one, so links and post-login redirects
 * don't need to know which state the user is in.
 */
export default async function MePage() {
  const session = await getAuthSession()
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/me")

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: session.user.id },
    select: { username: true },
  })

  redirect(portfolio ? `/${portfolio.username}` : "/onboarding")
}
