"use client"

import { useSession } from 'next-auth/react'
import Head from 'next/head'

export default function DynamicHead() {

    const {data: session} = useSession()
//   if (isLoading || error || !profile) {
//     return null
//   }

  return (
    <Head>
      <title>{session?.user.name} | Presssence</title>
      <meta property="og:title" content="My page title" key="title" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={session?.user.image || '/favicon.ico'}
      />
    </Head>
  )
}