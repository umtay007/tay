import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    console.log("[v0] Helcim initialize request - amount:", amount)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const helcimApiToken = process.env.HELCIM_API_TOKEN

    if (!helcimApiToken) {
      console.error("[v0] HELCIM_API_TOKEN is not configured")
      return NextResponse.json({ error: "Helcim API token not configured" }, { status: 500 })
    }

    console.log("[v0] Helcim API token found, length:", helcimApiToken.length)

    // Initialize Helcim checkout session
    const requestBody = {
      paymentType: "purchase",
      amount: amount,
      currency: "USD",
    }

    console.log("[v0] Sending request to Helcim API:", JSON.stringify(requestBody))

    const response = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-token": helcimApiToken,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("[v0] Helcim API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Helcim API error response:", errorText)
      return NextResponse.json({ error: "Failed to initialize Helcim session", details: errorText }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Helcim checkout token received:", data.checkoutToken ? "yes" : "no")

    return NextResponse.json({
      checkoutToken: data.checkoutToken,
      secretToken: data.secretToken,
    })
  } catch (error) {
    console.error("[v0] Error initializing Helcim:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
