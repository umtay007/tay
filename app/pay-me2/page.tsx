"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PayMe2Page() {
  const [amount, setAmount] = useState("250")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async (paymentMethod: "cashApp" | "applePay" | "googlePay") => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-square-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checkout")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-6 bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Pay Me</h1>
          <p className="text-zinc-400">Choose your payment method</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-zinc-800 border-zinc-700 text-white"
              min="1"
              step="0.01"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handlePayment("cashApp")}
              disabled={loading || !amount}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Processing..." : "Pay with Cash App"}
            </Button>

            <Button
              onClick={() => handlePayment("applePay")}
              disabled={loading || !amount}
              className="w-full bg-white hover:bg-gray-100 text-black"
            >
              {loading ? "Processing..." : "Pay with Apple Pay"}
            </Button>

            <Button
              onClick={() => handlePayment("googlePay")}
              disabled={loading || !amount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Processing..." : "Pay with Google Pay"}
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>
      </div>
    </div>
  )
}
