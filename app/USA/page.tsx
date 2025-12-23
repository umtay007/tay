"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { RainBackground } from "@/components/rain-background"
import { GlitterBackground } from "@/components/glitter-background"

export default function USAPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()

  const bankDetails = {
    routingNumber: "101019644",
    accountNumber: "216227314184",
    accountName: "Trystan Clifton",
    bankName: "Lead Bank",
    bankAddress: "1801 Main Street Kansas City, MO 64108",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 bg-gradient-to-br from-black via-red-950 to-red-900">
      <GlitterBackground color="127, 29, 29" />
      <RainBackground color="rgba(127, 29, 29, 0.3)" />

      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10 text-lg"
          onClick={() => router.push("/bank")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Bank Options
        </Button>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 text-center">ACH / RTP Bank Transfer</h1>

        <Card className="w-full bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Bank Details</CardTitle>
            <CardDescription className="text-white/80">
              Use these details to send your ACH or RTP payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Routing Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-xl font-mono font-bold">{bankDetails.routingNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.routingNumber, "routing")}
                    className="text-white hover:bg-white/20"
                  >
                    {copiedField === "routing" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-xl font-mono font-bold">{bankDetails.accountNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "account")}
                    className="text-white hover:bg-white/20"
                  >
                    {copiedField === "account" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Account Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-xl font-semibold">{bankDetails.accountName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "name")}
                    className="text-white hover:bg-white/20"
                  >
                    {copiedField === "name" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-xl font-semibold">{bankDetails.bankName}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "bank")}
                    className="text-white hover:bg-white/20"
                  >
                    {copiedField === "bank" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-white/70 text-sm mb-2">Bank Address</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-lg font-semibold">{bankDetails.bankAddress}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankAddress, "address")}
                    className="text-white hover:bg-white/20"
                  >
                    {copiedField === "address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg">
              <p className="text-white text-sm">
                <strong>Important:</strong> After sending your payment, please provide proof of transfer (screenshot or
                confirmation) for verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
