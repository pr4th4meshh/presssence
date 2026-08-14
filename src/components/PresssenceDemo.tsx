import { getDemoProfile } from "@/lib/demoProfile"
import PresssenceDemoView from "./PresssenceDemoView"

// Marketing copy, not live data — the landing page shouldn't hit the database
// on every request.
export const revalidate = 3600

export default async function PresssenceDemo() {
  return <PresssenceDemoView data={await getDemoProfile()} />
}
