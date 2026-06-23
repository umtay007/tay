"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GlitterBackground } from "@/components/glitter-background"
import { RainBackground } from "@/components/rain-background"

export default function WirePage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()

  const details = {
    bankName: "Lead Bank",
    bankAddress: "1801 Main Street\nKansas City, MO 64108",
    accountHolder: "Trystan Clifton",
    accountType: "Checking",
    routingNumber: "101019644",
    accountNumber: "212746514900",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const Field = ({
    label,
    value,
    field,
    mono = false,
  }: {
    label: string
    value: string
    field: string
    mono?: boolean
  }) => (
    <div className="bg-black/30 p-4 rounded-lg">
      <p className="text-white/70 text-xs uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-white text-lg font-semibold whitespace-pre-line ${mono ? "font-mono" : ""}`}>{value}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value.replace(/\n/g, " "), field)}
          className="shrink-0 text-white hover:bg-white/20"
          aria-label={`Copy ${label}`}
        >
          {copiedField === field ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 bg-gradient-to-br from-red-950 via-red-900 to-yellow-800">
      <GlitterBackground color="180, 83, 9" />
      <RainBackground color="rgba(180, 83, 9, 0.4)" />

      <div className="relative z-10 w-full max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10 text-lg"
          onClick={() => router.push("/bank")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Bank Options
        </Button>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 text-center text-balance">Wire Transfer</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Bank Name" value={details.bankName} field="bankName" />
              <Field label="Bank Address" value={details.bankAddress} field="bankAddress" />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Recipient (Beneficiary) Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Account Holder" value={details.accountHolder} field="accountHolder" />
              <Field label="Account Type" value={details.accountType} field="accountType" />
              <Field label="Routing Number" value={details.routingNumber} field="routingNumber" mono />
              <Field label="Account Number" value={details.accountNumber} field="accountNumber" mono />
            </CardContent>
          </Card>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-lg mt-6">
          <p className="text-white text-sm">
            <strong>Important:</strong> After sending your wire, please provide proof of transfer (screenshot or
            confirmation) for verification.
          </p>
        </div>
      </div>
    </main>
  )
}
