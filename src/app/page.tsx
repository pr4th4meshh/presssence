import Hero from "@/components/Hero"
import PresssenceDemo from "@/components/PresssenceDemo"
import { getDemoProfile } from "@/lib/demoProfile"

export const revalidate = 3600

export default async function Home() {
  // Shared with PresssenceDemo via React cache(), so this is one query.
  const { username, fullName, photo } = await getDemoProfile()

  return (
    <div>
      <Hero demoProfile={{ username, fullName, photo }} />
      <PresssenceDemo />
    </div>
  )
}
