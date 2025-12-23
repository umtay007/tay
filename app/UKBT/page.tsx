"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ArrowLeft } from "lucide-react"
import { GlitterBackground } from "@/components/glitter-background"
import { RainBackground } from "@/components/rain-background"

export default function UKBTPage() {
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const bankDetails = {
    accountName: "Trystan Clifton",
    accountNumber: "02328150",
    sortCode: "041907",
    swiftCode: "AIRWGB22XXX",
    iban: "GB62AIRW04190702328150",
    bankName: "AIRWALLEX (UK) LIMITED",
    bankAddress: "Labs House 15-19 Bloomsbury Way, London, United Kingdom, WC1A 2TH",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-black via-purple-950 to-purple-900">
      <GlitterBackground color="139, 92, 246" />
      <RainBackground color="rgba(139, 92, 246, 0.3)" />

      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          className="mb-4 text-white hover:bg-white/10 text-base"
          onClick={() => router.push("/bank")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bank Options
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">UK Bank Transfer</h1>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center text-xl">Bank Details (GBP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BankDetailRow
              label="Account Name"
              value={bankDetails.accountName}
              onCopy={() => copyToClipboard(bankDetails.accountName, "accountName")}
              copied={copiedField === "accountName"}
            />
            <BankDetailRow
              label="Account Number"
              value={bankDetails.accountNumber}
              onCopy={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
              copied={copiedField === "accountNumber"}
            />
            <BankDetailRow
              label="Sort Code"
              value={bankDetails.sortCode}
              onCopy={() => copyToClipboard(bankDetails.sortCode, "sortCode")}
              copied={copiedField === "sortCode"}
            />
            <BankDetailRow
              label="SWIFT/BIC Code"
              value={bankDetails.swiftCode}
              onCopy={() => copyToClipboard(bankDetails.swiftCode, "swiftCode")}
              copied={copiedField === "swiftCode"}
            />
            <BankDetailRow
              label="IBAN"
              value={bankDetails.iban}
              onCopy={() => copyToClipboard(bankDetails.iban, "iban")}
              copied={copiedField === "iban"}
            />
            <BankDetailRow
              label="Bank Name"
              value={bankDetails.bankName}
              onCopy={() => copyToClipboard(bankDetails.bankName, "bankName")}
              copied={copiedField === "bankName"}
            />
            <BankDetailRow
              label="Bank Address"
              value={bankDetails.bankAddress}
              onCopy={() => copyToClipboard(bankDetails.bankAddress, "bankAddress")}
              copied={copiedField === "bankAddress"}
            />

            <div className="bg-yellow-500/20 border border-yellow-500/50 text-white p-4 rounded-xl mt-5">
              <p className="text-sm font-semibold mb-1">⚠️ Important</p>
              <p className="text-sm">
                After completing your transfer, please provide proof of payment (screenshot or transaction details) to
                confirm your payment.
              </p>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/50 text-white p-4 rounded-xl">
              <p className="text-sm">
                <strong>Available Methods:</strong> BACS (1-2 days), CHAPS (0-1 days), Faster Payments (0-1 days)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function BankDetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
      <div className="flex-1">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        <p className="text-white font-mono text-sm break-all">{value}</p>
      </div>
      <Button variant="ghost" size="sm" className="ml-3 text-white hover:bg-white/10" onClick={onCopy}>
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
