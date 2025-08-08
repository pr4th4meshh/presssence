import ClientPage from "./ClientPage"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: { portfolioUsername: string }
}): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/portfolio/get-user-id?portfolioUsername=${params.portfolioUsername}`,
    { cache: "no-store" }
  )
  const userId = await res.json()

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user?username=${userId}`,
    { cache: "no-store" }
  )

  const userData = await userRes.json()

  console.log("photu", userData)
  return {
    title: `${userData?.name || "Portfolio"}'s Presssence`,
    description: `Check out ${userData?.name || "this creator"}'s portfolio on Presssence.`,
    icons: {
        icon: `${userData.image || "favicon.ico"}`
    }
  }
}

export default ClientPage
