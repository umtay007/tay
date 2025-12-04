// app/api/create-square-payment/route.ts
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// UNIQUE MARKER TO CONFIRM THIS VERSION IS DEPLOYED
const VERSION = "HTTP-API-V2-FINAL"

export async function POST(request: Request) {
  console.log("=== VERSION:", VERSION, "===")
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

    // Use Square REST API directly instead of SDK
    const squareApiUrl = environment === "production" 
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com"

    const amountInCents = Math.round(amount * 100)

    const requestBody = {
      idempotency_key: randomUUID(),
      quick_pay: {
        name: "Payment",
        location_id: locationId,
        price_money: {
          amount: amountInCents,
          currency: "USD",
        },
      },
      checkout_options: {
        redirect_url: `${baseUrl}/pay-me2/success`,
      },
    }

    console.log("Calling Square API directly...")
    console.log("API URL:", squareApiUrl)

    const response = await fetch(`${squareApiUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-12-18",
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()
    
    console.log("Square API response status:", response.status)
    console.log("Square API response:", JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      console.error("Square API error:", responseData)
      return NextResponse.json(
        { 
          error: responseData.errors?.[0]?.detail || "Failed to create payment link",
          details: responseData.errors,
        },
        { status: response.status }
      )
    }

    if (!responseData.payment_link?.url) {
      console.error("No payment link URL in response")
      return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 })
    }

    console.log("✅ SUCCESS! Payment link created:", responseData.payment_link.url)

    return NextResponse.json({
      url: responseData.payment_link.url,
    })

  } catch (error: any) {
    console.error("=== Square Payment Error ===")
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)

    return NextResponse.json(
      {
        error: error.message || "Payment creation failed",
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
