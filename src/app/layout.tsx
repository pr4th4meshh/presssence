import { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { NextAuthSessionProvider, Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"

// testing commits because changed the repo name
const poppins = localFont({
  src: [
    {
      path: "./fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Presssence",
  description: "Create your portfolio in minutes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <NextAuthSessionProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
        <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={`${poppins.variable} antialiased`}>
          <Providers>
            {/* <ServerNavbar /> */}
            {children}
          </Providers>
          <Toaster position="top-center" />
        </body>
      </html>
    </NextAuthSessionProvider>
  )
}
