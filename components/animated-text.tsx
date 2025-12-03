import type React from "react"

export default function AnimatedText({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block transition-transform duration-200 hover:scale-110 cursor-default">{children}</span>
  )
}
