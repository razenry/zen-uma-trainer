import type { Metadata } from "next"
import { Outfit, Space_Grotesk } from "next/font/google"
import "./globals.css"
import Providers from "@/components/providers"

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Zen Uma Trainer - Uma Musume Global Assistant",
  description: "An advanced training simulator, AI training advisor, skill optimizer, and race analyzer for Uma Musume Global players. Optimize your training runs and builds.",
  keywords: "uma musume, uma musume global, training simulator, build planner, skill optimizer, race analyzer, tracen academy",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased text-foreground bg-background`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
