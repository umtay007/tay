"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Smartphone, Building2, Gift, DollarSign } from "lucide-react"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

type PaymentMethod = "card" | "digital-wallets" | "cash-app" | "ach" | "gift-card"

export default function CheckoutPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>("card")
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
          } catch (error) {
            console.error("[v0] Error initializing Square payments:", error)
          }
        }
      } else if (!paymentsRef.current) {
        try {
          const payments = window.Square.payments(
            process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
            process.env.SQUARE_LOCATION_ID!,
          )
          paymentsRef.current = payments
        } catch (error) {
          console.error("[v0] Error initializing Square payments:", error)
        }
      }
    }

    initializeSquare()
  }, [])

  useEffect(() => {
    const initializeCard = async () => {
      if (activePaymentMethod === "card" && paymentsRef.current && !cardRef.current) {
        try {
          const card = await paymentsRef.current.card()
          await card.attach("#card-container")
          cardRef.current = card
        } catch (error) {
          console.error("[v0] Error initializing card:", error)
          setError("Failed to initialize card payment")
        }
      }
    }

    initializeCard()
  }, [activePaymentMethod])

  useEffect(() => {
    const initializeDigitalWallets = async () => {
      if (activePaymentMethod === "digital-wallets" && paymentsRef.current) {
        try {
          // Initialize Apple Pay
          if (!applePayRef.current) {
            const applePay = await paymentsRef.current.applePay({
              amount: amount || "1.00",
              currencyCode: "USD",
            })
            const applePayButton = document.getElementById("apple-pay-button")
            if (applePayButton) {
              await applePay.attach("#apple-pay-button")
              applePayRef.current = applePay
            }
          }

          // Initialize Google Pay
          if (!googlePayRef.current) {
            const googlePay = await paymentsRef.current.googlePay({
              amount: amount || "1.00",
              currencyCode: "USD",
            })
            const googlePayButton = document.getElementById("google-pay-button")
            if (googlePayButton) {
              await googlePay.attach("#google-pay-button")
              googlePayRef.current = googlePay
            }
          }
        } catch (error) {
          console.error("[v0] Error initializing digital wallets:", error)
        }
      }
    }

    initializeDigitalWallets()
  }, [activePaymentMethod, amount])

  useEffect(() => {
    const initializeCashAppPay = async () => {
      if (activePaymentMethod === "cash-app" && paymentsRef.current && !cashAppPayRef.current) {
        try {
          const cashAppPay = await paymentsRef.current.cashAppPay({
            redirectURL: `${window.location.origin}/checkout`,
            referenceId: crypto.randomUUID(),
          })
          await cashAppPay.attach("#cash-app-button")
          cashAppPayRef.current = cashAppPay
        } catch (error) {
          console.error("[v0] Error initializing Cash App Pay:", error)
        }
      }
    }

    initializeCashAppPay()
  }, [activePaymentMethod])

  useEffect(() => {
    const initializeACH = async () => {
      if (activePaymentMethod === "ach" && paymentsRef.current && !achRef.current) {
        try {
          const ach = await paymentsRef.current.ach()
          await ach.attach("#ach-container")
          achRef.current = ach
        } catch (error) {
          console.error("[v0] Error initializing ACH:", error)
          setError("ACH payment method not available")
        }
      }
    }

    initializeACH()
  }, [activePaymentMethod])

  useEffect(() => {
    const initializeGiftCard = async () => {
      if (activePaymentMethod === "gift-card" && paymentsRef.current && !giftCardRef.current) {
        try {
          const giftCard = await paymentsRef.current.giftCard()
          await giftCard.attach("#gift-card-container")
          giftCardRef.current = giftCard
        } catch (error) {
          console.error("[v0] Error initializing gift card:", error)
          setError("Gift card payment not available")
        }
      }
    }

    initializeGiftCard()
  }, [activePaymentMethod])

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

  const handleCardPayment = async () => {
    if (!cardRef.current) {
      setError("Card payment not initialized")
      return
    }

    try {
      const verificationDetails = buildVerificationDetails()
      const tokenResult = await cardRef.current.tokenize(verificationDetails)

      if (tokenResult.status === "OK") {
        await processPayment(tokenResult.token)
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || "Failed to tokenize card")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Card payment failed")
    }
  }

  const handleDigitalWalletPayment = async (walletType: "apple" | "google") => {
    const walletRef = walletType === "apple" ? applePayRef : googlePayRef
    if (!walletRef.current) {
      setError(`${walletType === "apple" ? "Apple" : "Google"} Pay not initialized`)
      return
    }

    try {
      const tokenResult = await walletRef.current.tokenize()
      if (tokenResult.status === "OK") {
        await processPayment(tokenResult.token)
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || "Failed to tokenize wallet")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Digital wallet payment failed")
    }
  }

  const handleCashAppPayment = async () => {
    if (!cashAppPayRef.current) {
      setError("Cash App Pay not initialized")
      return
    }

    try {
      const tokenResult = await cashAppPayRef.current.tokenize({
        amount: amount || "1.00",
      })

      if (tokenResult.status === "OK") {
        await processPayment(tokenResult.token)
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || "Failed to tokenize Cash App")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cash App payment failed")
    }
  }

  const handleACHPayment = async () => {
    if (!achRef.current) {
      setError("ACH not initialized")
      return
    }

    try {
      const verificationDetails = buildVerificationDetails()
      const tokenResult = await achRef.current.tokenize(verificationDetails)

      if (tokenResult.status === "OK") {
        await processPayment(tokenResult.token)
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || "Failed to tokenize ACH")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ACH payment failed")
    }
  }

  const handleGiftCardPayment = async () => {
    if (!giftCardRef.current) {
      setError("Gift card not initialized")
      return
    }

    try {
      const tokenResult = await giftCardRef.current.tokenize()
      if (tokenResult.status === "OK") {
        await processPayment(tokenResult.token)
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || "Failed to tokenize gift card")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gift card payment failed")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    switch (activePaymentMethod) {
      case "card":
        await handleCardPayment()
        break
      case "ach":
        await handleACHPayment()
        break
      case "gift-card":
        await handleGiftCardPayment()
        break
      default:
        setError("Please select a payment method")
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
            <CardDescription className="text-white/80">Choose your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="bg-white/20 text-white placeholder-white/60 border-white/30"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm">{error}</div>
              )}

              <Tabs value={activePaymentMethod} onValueChange={(v) => setActivePaymentMethod(v as PaymentMethod)}>
                <TabsList className="grid w-full grid-cols-5 bg-white/10">
                  <TabsTrigger value="card" className="data-[state=active]:bg-white/20">
                    <CreditCard className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="digital-wallets" className="data-[state=active]:bg-white/20">
                    <Smartphone className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="cash-app" className="data-[state=active]:bg-white/20">
                    <DollarSign className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="ach" className="data-[state=active]:bg-white/20">
                    <Building2 className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="gift-card" className="data-[state=active]:bg-white/20">
                    <Gift className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="text-white/90 text-sm mb-2">Enter your card details</div>
                  <div id="card-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : "Pay with Card"}
                  </Button>
                </TabsContent>

                <TabsContent value="digital-wallets" className="space-y-4">
                  <div className="text-white/90 text-sm mb-2">Choose your digital wallet</div>
                  <div className="space-y-3">
                    <div
                      id="apple-pay-button"
                      className="w-full"
                      onClick={() => handleDigitalWalletPayment("apple")}
                    ></div>
                    <div
                      id="google-pay-button"
                      className="w-full"
                      onClick={() => handleDigitalWalletPayment("google")}
                    ></div>
                  </div>
                </TabsContent>

                <TabsContent value="cash-app" className="space-y-4">
                  <div className="text-white/90 text-sm mb-2">Pay with Cash App</div>
                  <div id="cash-app-button" className="w-full" onClick={handleCashAppPayment}></div>
                </TabsContent>

                <TabsContent value="ach" className="space-y-4">
                  <div className="text-white/90 text-sm mb-2">Connect your bank account</div>
                  <div id="ach-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : "Pay with Bank Account"}
                  </Button>
                </TabsContent>

                <TabsContent value="gift-card" className="space-y-4">
                  <div className="text-white/90 text-sm mb-2">Enter your gift card details</div>
                  <div id="gift-card-container" className="bg-white/10 p-4 rounded-lg min-h-[120px]"></div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : "Pay with Gift Card"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="text-xs text-white/60 text-center">
                Secure payment powered by Square. Your payment information is encrypted and secure.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
