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
  title: {
    default: "Presssence — Build Your Portfolio in Minutes",
    template: "%s | Presssence",
  },
  description:
    "Presssence is a free, open-source portfolio builder. Get a live, editable portfolio at presssence.me/yourname in minutes. No code required.",
  keywords: [
    "portfolio builder",
    "developer portfolio",
    "personal website",
    "portfolio website",
    "free portfolio",
    "presssence",
  ],
  authors: [{ name: "Prathamesh", url: "https://github.com/pr4th4meshh" }],
  creator: "Prathamesh",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Presssence",
    title: "Presssence — Build Your Portfolio in Minutes",
    description:
      "Free, open-source portfolio builder. Live at presssence.me/yourname. No code required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Presssence — Build Your Portfolio in Minutes",
    description: "Free portfolio builder. Live at presssence.me/yourname.",
    creator: "@pr4th4meshh",
  },
  robots: {
    index: true,
    follow: true,
  },
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
