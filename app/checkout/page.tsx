"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

export default function CheckoutPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    if (value === "" || (!isNaN(Number.parseFloat(value)) && isFinite(Number(value)))) {
      setAmount(value)
    }
  }

  const handlePayment = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-square-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment failed")
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No payment URL received")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <GlitterBackground />
      <RainBackground />

      <div className="z-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Secure Checkout</h1>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Complete Your Payment</CardTitle>
            <CardDescription className="text-white/80">Enter amount and confirm payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white text-lg">
                Amount (USD)
              </Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                className="bg-white/20 text-white placeholder-white/60 border-white/30 text-xl h-14"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm">{error}</div>
            )}

            <Button
              onClick={handlePayment}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm and Pay"}
            </Button>

            <div className="text-xs text-white/60 text-center">
              Secure payment powered by Square. Supports Apple Pay, Google Pay, and Cash App.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
