// app/api/create-square-payment/route.ts
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

// THIS LINE IS CRITICAL - Forces Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("=== Square Payment Request Started ===")
  
  try {
    const body = await request.json()
    const { amount } = body
    
    console.log("Amount requested:", amount)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId = process.env.SQUARE_LOCATION_ID
    const environment = process.env.SQUARE_ENVIRONMENT || "sandbox"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    if (!accessToken) {
      console.error("Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Missing Square Access Token" }, { status: 500 })
    }

    if (!locationId) {
      console.error("Missing SQUARE_LOCATION_ID")
      return NextResponse.json({ error: "Missing Square Location ID" }, { status: 500 })
    }

    console.log("Environment:", environment)
    console.log("Location ID:", locationId)

    // Use require() instead of import for Square SDK
    const { Client } = require("square")

    const client = new Client({
      accessToken: accessToken,
      environment: environment === "production" ? "production" : "sandbox",
    })

    console.log("Square client created")

    const amountInCents = Math.round(amount * 100)

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: randomUUID(),
      quickPay: {
        name: "Payment",
        locationId: locationId,
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: "USD",
        },
      },
      checkoutOptions: {
        redirectUrl: `${baseUrl}/pay-me2/success`,
      },
    })

    console.log("Square API call completed")

    if (!response.result.paymentLink?.url) {
      console.error("No payment link URL in response")
      return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 })
    }

    console.log("Payment link created:", response.result.paymentLink.url)

    return NextResponse.json({
      url: response.result.paymentLink.url,
    })

  } catch (error: any) {
    console.error("=== Square Payment Error ===")
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)
    
    if (error.errors) {
      console.error("Square Errors:", JSON.stringify(error.errors, null, 2))
    }

    return NextResponse.json(
      {
        error: error.message || "Payment creation failed",
        details: error.errors?.[0]?.detail,
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
