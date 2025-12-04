"use client"

import { useEffect, useState } from "react"

export default function PayMe2Page() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const response = await fetch("/api/create-square-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 250 }),
        })

        if (!response.ok) {
          throw new Error("Failed to create checkout")
        }

        const { url } = await response.json()
        window.location.href = url
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load checkout")
        setLoading(false)
      }
    }

    createAndRedirect()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl">Redirecting to checkout...</div>
    </div>
  )
}
