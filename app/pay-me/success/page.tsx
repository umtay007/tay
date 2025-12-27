"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RainBackground from "@/components/rain-background"
import GlitterBackground from "@/components/glitter-background"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const paymentMethod = searchParams.get("method")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [referral, setReferral] = useState("")

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("sessionId", sessionId || "N/A")
      formData.append("paymentMethod", paymentMethod || "Unknown")
      formData.append("referral", referral || "None")
      if (screenshot) {
        formData.append("screenshot", screenshot)
      }

      const response = await fetch("/api/payment-confirmation", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit confirmation")
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting confirmation:", error)
      alert("Failed to submit confirmation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
            <CardDescription className="text-white">
              {submitted
                ? "Your payment confirmation has been submitted."
                : "Please submit payment confirmation below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-sm text-white/70">Session ID:</p>
                <p className="text-xs text-white font-mono break-all">{sessionId}</p>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-white">
                    Payment Screenshot <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      required
                      className="bg-white/20 text-white border-white/30 file:bg-white/10 file:text-white file:border-0 file:rounded-lg"
                    />
                  </div>
                  {screenshotPreview && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                      <img
                        src={screenshotPreview || "/placeholder.svg"}
                        alt="Screenshot preview"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  <p className="text-xs text-white/60">
                    Upload a screenshot or screen recording showing proof of payment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral" className="text-white">
                    Who referred you? <span className="text-white/60">(If somebody did)</span>
                  </Label>
                  <Input
                    id="referral"
                    type="text"
                    placeholder="Enter referrer's name"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    className="bg-white/20 text-white border-white/30 placeholder-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !screenshot}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  {submitting ? "Submitting..." : "Submit Confirmation"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-white text-sm">
                  Thank you! Your payment confirmation has been submitted successfully.
                </p>
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105">
                    Return to Home
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
