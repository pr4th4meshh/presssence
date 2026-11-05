import Hero from "@/components/Hero"
import PresssenceDemo from "@/components/PresssenceDemo"
import LandingSections from "@/components/LandingSections"
import { getDemoProfile } from "@/lib/demoProfile"

export const revalidate = 3600

export default async function Home() {
  // Shared with PresssenceDemo via React cache(), so this is one query.
  const demo = await getDemoProfile()
  const { username, fullName, photo } = demo

  return (
    <div>
      <Hero demoProfile={{ username, fullName, photo }} />
      <PresssenceDemo />
      <LandingSections
        demo={{
          username: demo.username,
          fullName: demo.fullName,
          profession: demo.profession,
          headline: demo.headline,
          photo: demo.photo,
          skills: demo.skills,
          projects: demo.projects,
        }}
      />
    </div>
  )
}
