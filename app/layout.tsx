import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Tay wacky and goofy website",
  description: "Welcome to my site FUCK NIGGA",
  icons: {
    icon: "/images/image.png",
  },
  openGraph: {
    title: "Tay wacky and goofy website",
    description: "Welcome to my site FUCK NIGGA",
    images: [
      {
        url: "/images/stitch-embed.png",
        width: 400,
        height: 400,
        alt: "Stitch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tay wacky and goofy website",
    description: "Welcome to my site FUCK NIGGA",
    images: ["/images/stitch-embed.png"],
  },
    generator: 'v0.app'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body
        className="bg-black min-h-[100dvh]"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {children}
      </body>
    </html>
  )
}
