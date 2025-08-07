import Hero from "@/components/Hero"
import { getUserFromToken } from "@/hooks/getUser"
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  // let user, error

  // try {
  //   // Call the function to extract the user
  //   user = await getUserFromToken()
  // } catch (err) {
  //   error = "You are not logged in."
  // }
  const {getUser} = getKindeServerSession();
  const user = await getUser();
  console.log(user)
  
  console.log(user);
  console.log(user)
  return (
    <div className="">
      <Hero />
    </div>
  )
}
