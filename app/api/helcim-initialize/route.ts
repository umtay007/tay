import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const helcimApiToken = process.env.HELCIM_API_TOKEN

    if (!helcimApiToken) {
      return NextResponse.json({ error: "Helcim API token not configured" }, { status: 500 })
    }

    // Initialize Helcim checkout session
    const response = await fetch("https://api.helcim.com/v2/helcimpay/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-token": helcimApiToken,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "USD",
        digitalWallet: {
          "google-pay": 1,
          "apple-pay": 1,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Helcim API error:", errorData)
      return NextResponse.json({ error: "Failed to initialize Helcim session" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({
      checkoutToken: data.checkoutToken,
      secretToken: data.secretToken,
    })
  } catch (error) {
    console.error("[v0] Error initializing Helcim:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
