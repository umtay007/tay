"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"

export default function SEPAPage() {
  const router = useRouter()
  const [copied, setCopied] = useState<string | null>(null)

  const bankDetails = {
    accountName: "Trystan Clifton",
    iban: "NL80AINH6721240344",
    swift: "AINHNL22",
    accountLocation: "Netherlands (Europe)",
    bankName: "Airwallex (Netherlands) B.V.",
    bankAddress: "Vijzelstraat, 68-78, Amsterdam, Netherlands, 1016BP",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-black via-gray-800 to-gray-600 overflow-hidden">
      <GlitterBackground color="156, 163, 175" />

      {/* Rain effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute w-0.5 h-12 bg-gradient-to-b from-transparent via-gray-600/30 to-transparent animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes rain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-2xl">
        <Button variant="ghost" className="mb-4 text-white hover:bg-white/10" onClick={() => router.push("/bank")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bank Options
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center">SEPA Bank Transfer</h1>
        <p className="text-white/80 text-center mb-6">European (EUR) Bank Account Details</p>

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
              <label className="text-white/70 text-sm mb-2 block">IBAN</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono">{bankDetails.iban}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                >
                  {copied === "iban" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">SWIFT Code</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white font-mono">{bankDetails.swift}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.swift, "swift")}
                >
                  {copied === "swift" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
              <label className="text-white/70 text-sm mb-2 block">Bank Address</label>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-white text-sm">{bankDetails.bankAddress}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9"
                  onClick={() => copyToClipboard(bankDetails.bankAddress, "bankAddress")}
                >
                  {copied === "bankAddress" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 font-medium text-sm">
              ⚠️ Important: Please provide proof of transfer after making your SEPA payment
            </p>
            <p className="text-yellow-200/80 text-xs mt-1">
              SEPA transfers typically take 1-3 business days to process
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
