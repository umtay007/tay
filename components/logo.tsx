"use client"

import Image from "next/image"
import { useTheme } from "next-themes"

export default function Logo() {
  const { theme } = useTheme()

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0">
        {/* Stitch Background */}
        <Image src="/images/image.png" alt="Stitch" fill className="object-cover rounded-full opacity-30 blur-sm" />
      </div>

      <div className="relative z-10">
        {/* Glowing S */}
        <div className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">S</div>
      </div>
    </div>
  )
}
