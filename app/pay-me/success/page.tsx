"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f3460]">
      <GlitterBackground />
      <RainBackground />
      <div className="z-10 w-full max-w-md">
        <Card className="w-full bg-card/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Payment Successful!</CardTitle>
            <CardDescription className="text-white">Your payment has been processed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {sessionId && (
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-sm text-white/70">Session ID:</p>
                <p className="text-xs text-white font-mono break-all">{sessionId}</p>
              </div>
            )}
            <p className="text-white text-sm">Thank you for your payment. You will receive a confirmation shortly.</p>
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
