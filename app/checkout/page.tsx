"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

type PaymentMethod = "card" | "digital-wallets" | "cash-app" | "ach" | "gift-card"

export default function CheckoutPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const paymentsRef = useRef<any>(null)
  const cardRef = useRef<any>(null)
  const applePayRef = useRef<any>(null)
  const googlePayRef = useRef<any>(null)
  const cashAppPayRef = useRef<any>(null)
  const achRef = useRef<any>(null)
  const giftCardRef = useRef<any>(null)

  useEffect(() => {
    const initializeSquare = async () => {
      if (!window.Square) {
        const script = document.createElement("script")
        script.src = "https://web.squarecdn.com/v1/square.js"
        script.async = true
        document.head.appendChild(script)

        script.onload = async () => {
          if (!window.Square) return
          try {
            const payments = window.Square.payments(
              process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
              process.env.SQUARE_LOCATION_ID!,
            )
            paymentsRef.current = payments
            await initializeAllPaymentMethods(payments)
          } catch (error) {
            console.error("Error initializing Square payments:", error)
          }
        }
      } else if (!paymentsRef.current) {
        try {
          const payments = window.Square.payments(
            process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
            process.env.SQUARE_LOCATION_ID!,
          )
          paymentsRef.current = payments
          await initializeAllPaymentMethods(payments)
        } catch (error) {
          console.error("Error initializing Square payments:", error)
        }
      }
    }

    initializeSquare()
  }, [])

  const initializeAllPaymentMethods = async (payments: any) => {
    try {
      // Initialize Card
      if (!cardRef.current) {
        const card = await payments.card()
        await card.attach("#card-container")
        cardRef.current = card
      }

      // Initialize Apple Pay
      if (!applePayRef.current) {
        try {
          const applePay = await payments.applePay({
            amount: "1.00",
            currencyCode: "USD",
          })
          await applePay.attach("#apple-pay-button")
          applePayRef.current = applePay
        } catch (err) {
          console.log("Apple Pay not available")
        }
      }

      // Initialize Google Pay
      if (!googlePayRef.current) {
        try {
          const googlePay = await payments.googlePay({
            amount: "1.00",
            currencyCode: "USD",
          })
          await googlePay.attach("#google-pay-button")
          googlePayRef.current = googlePay
        } catch (err) {
          console.log("Google Pay not available")
        }
      }

      // Initialize Cash App Pay
      if (!cashAppPayRef.current) {
        try {
          const cashAppPay = await payments.cashAppPay({
            redirectURL: `${window.location.origin}/checkout`,
            referenceId: crypto.randomUUID(),
          })
          await cashAppPay.attach("#cash-app-button")
          cashAppPayRef.current = cashAppPay
        } catch (err) {
          console.log("Cash App Pay not available")
        }
      }

      // Initialize ACH
      if (!achRef.current) {
        try {
          const ach = await payments.ach()
          await ach.attach("#ach-container")
          achRef.current = ach
        } catch (err) {
          console.log("ACH not available")
        }
      }

      // Initialize Gift Card
      if (!giftCardRef.current) {
        try {
          const giftCard = await payments.giftCard()
          await giftCard.attach("#gift-card-container")
          giftCardRef.current = giftCard
        } catch (err) {
          console.log("Gift Card not available")
        }
      }
    } catch (error) {
      console.error("Error initializing payment methods:", error)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    if (value === "" || (!isNaN(Number.parseFloat(value)) && isFinite(Number(value)))) {
      setAmount(value)
    }
  }

  const buildVerificationDetails = () => {
    return {
      amount: amount || "1.00",
      currencyCode: "USD",
      intent: "CHARGE",
      billingContact: {
        givenName: "John",
        familyName: "Doe",
        email: "[[email protected]](/cdn-cgi/l/email-protection)",
        phone: "1234567890",
        addressLines: ["123 Main St"],
        city: "San Francisco",
        state: "CA",
        countryCode: "US",
        postalCode: "94103",
      },
      customerInitiated: true,
      sellerKeyedIn: false,
    }
  }

  const processPayment = async (token: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: token,
          amount: Number.parseFloat(amount || "1.00"),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment failed")
      }

      router.push("/checkout/success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed")
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)

    // Try to tokenize with the first available payment method
    try {
      const verificationDetails = buildVerificationDetails()

      // Try Card first
      if (cardRef.current) {
        const tokenResult = await cardRef.current.tokenize(verificationDetails)
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      // Try ACH
      if (achRef.current) {
        const tokenResult = await achRef.current.tokenize(verificationDetails)
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      // Try Gift Card
      if (giftCardRef.current) {
        const tokenResult = await giftCardRef.current.tokenize()
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      // Try Apple Pay
      if (applePayRef.current) {
        const tokenResult = await applePayRef.current.tokenize()
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      // Try Google Pay
      if (googlePayRef.current) {
        const tokenResult = await googlePayRef.current.tokenize()
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      // Try Cash App
      if (cashAppPayRef.current) {
        const tokenResult = await cashAppPayRef.current.tokenize({
          amount: amount || "1.00",
        })
        if (tokenResult.status === "OK") {
          await processPayment(tokenResult.token)
          return
        }
      }

      throw new Error("Please fill out a payment method")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <GlitterBackground />
      <RainBackground />

      <div className="z-10 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Secure Checkout</h1>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Complete Your Payment</CardTitle>
            <CardDescription className="text-white/80">
              Enter amount and choose any payment method below
            </CardDescription>
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

            <div className="space-y-6">
              {/* Card Payment */}
              <div className="space-y-2">
                <Label className="text-white">Card Payment</Label>
                <div id="card-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
              </div>

              {/* Digital Wallets */}
              <div className="space-y-2">
                <Label className="text-white">Digital Wallets</Label>
                <div className="space-y-3">
                  <div id="apple-pay-button" className="w-full min-h-[48px]"></div>
                  <div id="google-pay-button" className="w-full min-h-[48px]"></div>
                </div>
              </div>

              {/* Cash App */}
              <div className="space-y-2">
                <Label className="text-white">Cash App Pay</Label>
                <div id="cash-app-button" className="w-full min-h-[48px]"></div>
              </div>

              {/* ACH */}
              <div className="space-y-2">
                <Label className="text-white">Bank Account (ACH)</Label>
                <div id="ach-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
              </div>

              {/* Gift Card */}
              <div className="space-y-2">
                <Label className="text-white">Gift Card</Label>
                <div id="gift-card-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
              </div>
            </div>

            <Button onClick={handlePayment} className="w-full h-14 text-lg" disabled={loading}>
              {loading ? "Processing..." : "Confirm and Pay"}
            </Button>

            <div className="text-xs text-white/60 text-center">
              Secure payment powered by Square. Your payment information is encrypted and secure.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
