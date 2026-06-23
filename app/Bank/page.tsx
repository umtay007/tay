"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

export default function BankPage() {
  const router = useRouter()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-black via-slate-900 to-green-950 overflow-hidden">
      <GlitterBackground glitterColor="rgb(29, 78, 216)" rainColor="rgba(29, 78, 216, 0.3)" />

      <div className="w-full max-w-md relative z-10">
        <Button variant="ghost" className="mb-4 text-white hover:bg-white/10" onClick={() => router.push("/pay-me")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment Options
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">Select Bank Transfer Method</h1>

        <div className="space-y-4">
          <Card
            className="cursor-pointer hover:scale-105 transition-transform bg-white/10 backdrop-blur-md border-white/20"
            onClick={() => router.push("/usa")}
          >
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center justify-between">
                ACH / RTP (USD)
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  $
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-xs mt-1">Instant to 1 business day</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:scale-105 transition-transform bg-white/10 backdrop-blur-md border-white/20"
            onClick={() => router.push("/wire")}
          >
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center justify-between">
                Wire Transfer (USD)
                <div className="h-10 w-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  $
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-xs mt-1">Domestic & International Wire</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
