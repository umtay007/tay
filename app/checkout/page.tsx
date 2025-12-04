"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

type PaymentMethod = "applePay" | "googlePay" | "cashAppPay"

export default function CheckoutPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const router = useRouter()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    if (value === "" || (!isNaN(Number.parseFloat(value)) && isFinite(Number(value)))) {
      setAmount(value)
    }
  }

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)
    setSelectedMethod(paymentMethod)

    try {
      const response = await fetch("/api/create-square-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          paymentMethod, // Send selected payment method
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
      setSelectedMethod(null)
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
            <CardDescription className="text-white/80">Enter amount and choose payment method</CardDescription>
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

            <div className="space-y-3">
              <Label className="text-white text-lg">Choose Payment Method</Label>

              <Button
                onClick={() => handlePayment("applePay")}
                className="w-full h-14 text-lg bg-black hover:bg-black/80"
                disabled={loading}
              >
                {loading && selectedMethod === "applePay" ? "Processing..." : "Pay with Apple Pay"}
              </Button>

              <Button
                onClick={() => handlePayment("googlePay")}
                className="w-full h-14 text-lg bg-white text-black hover:bg-white/90"
                disabled={loading}
              >
                {loading && selectedMethod === "googlePay" ? "Processing..." : "Pay with Google Pay"}
              </Button>

              <Button
                onClick={() => handlePayment("cashAppPay")}
                className="w-full h-14 text-lg bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading && selectedMethod === "cashAppPay" ? "Processing..." : "Pay with Cash App"}
              </Button>
            </div>

            <div className="text-xs text-white/60 text-center">
              Secure payment powered by Square. Your payment information is encrypted and secure.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
