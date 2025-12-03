"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"
import { AlertCircle } from "lucide-react"
import { PayPalIcon, VenmoIcon } from "@/components/ui/icons"
import { loadStripe } from "@stripe/stripe-js"
import AnimatedText from "@/components/animated-text"
import SpotifyWidget from "@/components/spotify-widget"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// PayPal client ID
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""

type SpotifyData = {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumImageUrl?: string
  songUrl?: string
  progressMs?: number
  durationMs?: number
}

export default function PayMePage() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cashapp" | "wallets" | "paypal" | "venmo">("cashapp")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [spotifyData, setSpotifyData] = useState<SpotifyData>({ isPlaying: false })
  const [localProgress, setLocalProgress] = useState(0)
  const [currentSongUrl, setCurrentSongUrl] = useState<string | undefined>(undefined)
  const [pageViews, setPageViews] = useState<number | null>(null)
  const hasIncrementedViews = useRef(false)

  // Check if there was a canceled payment
  const canceled = searchParams.get("canceled") === "true"

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    if (value === "" || (!isNaN(Number.parseFloat(value)) && isFinite(Number(value)))) {
      setAmount(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms of service")
      return
    }

    // For PayPal, redirect to PayPal.me
    if (paymentMethod === "paypal") {
      window.open("https://www.paypal.me/TrystanClifton67", "_blank")
      return
    }

    // For Venmo, redirect to Venmo profile
    if (paymentMethod === "venmo") {
      window.open("https://venmo.com/u/ttj804", "_blank")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For Cash App and Wallets, use Stripe
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment session")
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error("Failed to create checkout session")
      }

      // Redirect to Stripe Checkout URL
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchSpotify = async () => {
      try {
        const response = await fetch("/api/spotify")
        const data = await response.json()
        setSpotifyData(data)
        if (data.songUrl !== currentSongUrl) {
          setCurrentSongUrl(data.songUrl)
          setLocalProgress(data.progressMs || 0)
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error)
      }
    }

    fetchSpotify()
    const spotifyInterval = setInterval(fetchSpotify, 10000)

    const progressInterval = setInterval(() => {
      setLocalProgress((prev) => {
        if (!spotifyData.isPlaying || !spotifyData.durationMs) return prev
        const newProgress = prev + 1000
        return newProgress <= spotifyData.durationMs ? newProgress : prev
      })
    }, 1000)

    // Only increment views once per session
    const incrementPageViews = async () => {
      if (hasIncrementedViews.current) {
        return
      }
      hasIncrementedViews.current = true

      try {
        const response = await fetch("/api/views?page=pay_me_views")
        const data = await response.json()
        setPageViews(data.views)
      } catch (error) {
        console.error("Error fetching page views:", error)
      }
    }

    incrementPageViews()

    return () => {
      clearInterval(spotifyInterval)
      clearInterval(progressInterval)
    }
  }, [spotifyData.isPlaying, spotifyData.durationMs, currentSongUrl])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgb(0, 0, 0), rgb(0, 0, 51), rgb(0, 0, 153))" }}
    >
      <GlitterBackground />
      <RainBackground />

      <SpotifyWidget spotifyData={spotifyData} localProgress={localProgress} formatTime={formatTime} />

      <div className="fixed bottom-4 right-4 bg-slate-900/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="text-white font-semibold text-base">
            {pageViews !== null ? pageViews.toLocaleString() : "..."}
          </span>
        </div>
      </div>

      <div className="z-10 w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 text-center relative">
          {/* Added AnimatedText component */}
          <AnimatedText>Pay Me</AnimatedText>
        </h1>
        <Card className="w-full bg-card/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">Quick Payment</CardTitle>
            <CardDescription className="text-center text-white">
              Fast and secure payments via multiple methods
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {canceled && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 text-white p-3 rounded-xl text-sm">
                  Your previous payment was canceled. Please try again.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="bg-white bg-opacity-20 text-black placeholder-white/60 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value as "cashapp" | "wallets" | "paypal" | "venmo")
                    setError(null)
                  }}
                  className="flex flex-col space-y-2"
                >
                  <label
                    htmlFor="cashapp"
                    className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <RadioGroupItem value="cashapp" id="cashapp" className="text-white" />
                    <span className="text-white cursor-pointer flex-1">Cash App</span>
                    <div className="h-6 w-6 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                      $
                    </div>
                  </label>
                  <label
                    htmlFor="wallets"
                    className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <RadioGroupItem value="wallets" id="wallets" className="text-white" />
                    <span className="text-white cursor-pointer flex-1">Google Pay / Apple Pay</span>
                    <div className="flex">
                      <svg className="h-6 w-6 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.25 4C4.45 4 3 5.45 3 7.25V16.75C3 18.55 4.45 20 6.25 20H17.75C19.55 20 21 18.55 21 16.75V7.25C21 5.45 19.55 4 17.75 4H6.25Z"
                          fill="black"
                        />
                        <path
                          d="M10.54 6.49C10.21 6.89 9.73 7.22 9.25 7.15C9.18 6.67 9.44 6.15 9.74 5.8C10.07 5.4 10.59 5.09 11.13 5.09C11.18 5.6 10.87 6.09 10.54 6.49Z"
                          fill="white"
                        />
                      </svg>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 11.5C13.1046 11.5 14 10.6046 14 9.5C14 8.39543 13.1046 7.5 12 7.5C10.8954 7.5 10 8.39543 10 9.5C10 10.6046 10.8954 11.5 12 11.5Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M19.77 12.66C19.77 12.24 19.74 11.77 19.69 11.31H12V13.96H16.43C16.22 14.99 15.57 15.85 14.59 16.39V18.29H17.27C18.7 16.94 19.77 14.95 19.77 12.66Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 20C14.2 20 16.05 19.25 17.27 18.29L14.59 16.39C13.93 16.83 13.06 17.1 12 17.1C9.91 17.1 8.14 15.66 7.5 13.69H4.72V15.65C5.9 18.2 8.73 20 12 20Z"
                          fill="#34A853"
                        />
                        <path
                          d="M7.5 13.69C7.33 13.25 7.23 12.78 7.23 12.3C7.23 11.82 7.33 11.35 7.5 10.91V8.95H4.72C4.26 9.96 4 11.11 4 12.3C4 13.49 4.26 14.64 4.72 15.65L7.5 13.69Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 7.5C13.19 7.5 14.27 7.93 15.09 8.72L17.47 6.34C16.05 5.01 14.2 4.2 12 4.2C8.73 4.2 5.9 6 4.72 8.55L7.5 10.51C8.14 8.54 9.91 7.5 12 7.5Z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                  </label>
                  <label
                    htmlFor="paypal"
                    className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <RadioGroupItem value="paypal" id="paypal" className="text-white" />
                    <span className="text-white cursor-pointer flex-1">PayPal</span>
                    <PayPalIcon className="h-6 w-6" />
                  </label>
                  <label
                    htmlFor="venmo"
                    className="flex items-center space-x-2 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/15 transition-colors"
                  >
                    <RadioGroupItem value="venmo" id="venmo" className="text-white" />
                    <span className="text-white cursor-pointer flex-1">Venmo</span>
                    <VenmoIcon className="h-6 w-6" />
                  </label>
                </RadioGroup>
              </div>

              {(paymentMethod === "paypal" || paymentMethod === "venmo") && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-sm text-white">
                  <p>
                    <strong>Note:</strong> You will be redirected to {paymentMethod === "paypal" ? "PayPal" : "Venmo"}{" "}
                    to complete your payment.
                  </p>
                </div>
              )}

              <div className="bg-black/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-white" />
                  <h3 className="text-white font-semibold">Terms of Service</h3>
                </div>
                <ul className="space-y-2 text-sm text-white list-disc pl-5">
                  <li>Payments have to be sent by you</li>
                  <li>Payments must be sent with balance and not from a linked card</li>
                  <li>DO NOT USE THE CARD OPTION - IT IS JUST A PLACEHOLDER FOR APPLE PAY</li>
                  <li>
                    You must provide a screen recording of you sending the payment (Discord/Telegram chats must be shown
                    within the screen recording)
                  </li>
                  <li>No sussy business</li>
                  <li>
                    Payments sent from a 3rd party must be in a gc with me to confirm everything is right and the deal
                    went smooth (Basically a middleman)
                  </li>
                </ul>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="rounded border-gray-500 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="terms" className="text-white text-sm">
                    I agree to the terms of service
                  </Label>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-xl text-sm">{error}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loading || !termsAccepted || !amount || Number.parseFloat(amount) <= 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                {loading ? "Processing..." : `Pay with ${getPaymentMethodName(paymentMethod)}`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  )
}

function getPaymentMethodName(method: string): string {
  switch (method) {
    case "cashapp":
      return "Cash App"
    case "wallets":
      return "Google Pay/Apple Pay"
    case "paypal":
      return "PayPal"
    case "venmo":
      return "Venmo"
    default:
      return method
  }
}
