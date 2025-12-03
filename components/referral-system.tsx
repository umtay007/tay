"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ReferralSystem() {
  const [generatedCode, setGeneratedCode] = useState("")
  const [checkCode, setCheckCode] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateCode = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/generate-referral-code", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCode(data.code)
        setStatus({ type: "success", message: "Referral code generated successfully!" })
      } else {
        throw new Error(data.error || "Failed to generate code")
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to generate code",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateCode = async () => {
    if (!checkCode) {
      setStatus({ type: "error", message: "Please enter a code to check" })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/validate-referral-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: checkCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: "success",
          message: `Valid referral code! Used ${data.usageCount} time(s).`,
        })
      } else {
        setStatus({ type: "error", message: data.error || "Invalid referral code" })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to validate code",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">Generate</TabsTrigger>
        <TabsTrigger value="check">Check</TabsTrigger>
      </TabsList>

      <TabsContent value="generate" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="generated-code">Generated Code</Label>
          <Input
            id="generated-code"
            value={generatedCode}
            readOnly
            placeholder="Click generate to create a code"
            className="font-mono"
          />
        </div>
        <Button onClick={generateCode} disabled={isLoading} className="w-full">
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </TabsContent>

      <TabsContent value="check" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="check-code">Check Code</Label>
          <Input
            id="check-code"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            placeholder="Enter referral code"
            className="font-mono"
          />
        </div>
        <Button onClick={validateCode} disabled={isLoading} className="w-full">
          {isLoading ? "Checking..." : "Check"}
        </Button>
      </TabsContent>

      {status && (
        <Alert variant={status.type === "error" ? "destructive" : "default"} className="mt-4">
          <AlertTitle>{status.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}
    </Tabs>
  )
}
