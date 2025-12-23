"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { RainBackground } from "@/components/rain-background"

export default function InteracPage() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)

  const bankDetails = {
    accountName: "Trystan Clifton",
    accountNumber: "9304890083",
    transitNumber: "10009",
    institutionNumber: "352",
    accountLocation: "Canada",
    bankName: "Digital Commerce Bank",
    interacEmail: "etransfer.9304890083@airwallex.com",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-black via-blue-950 to-blue-900">
      <GlitterBackground color="135, 206, 235" />
      <RainBackground color="rgba(174, 194, 224, 0.3)" />

      <div className="relative z-10 w-full max-w-2xl">
        <Button variant="ghost" className="mb-4 text-white hover:bg-white/10" onClick={() => router.push("/bank")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bank Options
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center">Interac / EFT Transfer</h1>
        <p className="text-white/80 text-center mb-6">Canadian (CAD) Bank Account Details</p>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="space-y-5">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Account Name</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-medium">{bankDetails.accountName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.accountName, "accountName")}
                >
                  {copied === "accountName" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Interac e-Transfer Autodeposit Email</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono text-sm">{bankDetails.interacEmail}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.interacEmail, "interacEmail")}
                >
                  {copied === "interacEmail" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Account Number</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono">{bankDetails.accountNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                >
                  {copied === "accountNumber" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Transit Number</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono">{bankDetails.transitNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.transitNumber, "transitNumber")}
                >
                  {copied === "transitNumber" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Financial Institution Number</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono">{bankDetails.institutionNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.institutionNumber, "institutionNumber")}
                >
                  {copied === "institutionNumber" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Bank Name</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-medium">{bankDetails.bankName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.bankName, "bankName")}
                >
                  {copied === "bankName" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Account Location</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-medium">{bankDetails.accountLocation}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.accountLocation, "location")}
                >
                  {copied === "location" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 font-medium text-sm">
              ⚠️ Important: Please provide proof of transfer after making your payment
            </p>
            <p className="text-yellow-200/80 text-xs mt-1">Interac e-Transfer: Instant | EFT: 0-1 business days</p>
          </div>
        </Card>
      </div>
    </main>
  )
}
