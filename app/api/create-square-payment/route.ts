// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs'

// Add a GET endpoint for testing
export async function GET(request: Request) {
  console.log("GET /api/create-square-payment - Test endpoint hit")
  
  return NextResponse.json({
    status: "Route is working!",
    timestamp: new Date().toISOString(),
    environment: {
      hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
      hasLocationId: !!process.env.SQUARE_LOCATION_ID,
      squareEnvironment: process.env.SQUARE_ENVIRONMENT || "not set",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not set",
    }
  })
}

export async function POST(request: Request) {
  console.log("\n=== SQUARE PAYMENT REQUEST ===")
  console.log("Time:", new Date().toISOString())
  
  try {
    const { amount, paymentMethod = "cashapp" } = await request.json()
    console.log("Amount:", amount, "Method:", paymentMethod)

    if (!amount || amount <= 0) {
      console.log("ERROR: Invalid amount")
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.log("ERROR: Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Missing Square Access Token" }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.log("ERROR: Missing SQUARE_LOCATION_ID")
      return NextResponse.json({ error: "Missing Square Location ID" }, { status: 500 })
    }

    console.log("Loading Square SDK with require()...")
    // Use require instead of import for better compatibility
    const { Client } = require("square")
    console.log("Square Client loaded:", typeof Client)

    console.log("Creating Square client...")
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    })
    console.log("Client created successfully")

    const amountInCents = Math.round(amount * 100)
    console.log("Amount in cents:", amountInCents)

    const requestBody = {
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: "Payment",
        locationId: process.env.SQUARE_LOCATION_ID,
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: "USD",
        },
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pay-me2/success`,
      },
    }

    console.log("Calling Square API...")
    const response = await client.checkoutApi.createPaymentLink(requestBody)
    console.log("Square API response received, status:", response.statusCode)

    if (!response.result.paymentLink?.url) {
      console.log("ERROR: No payment link URL in response")
      throw new Error("Failed to create payment link")
    }

    console.log("SUCCESS: Payment link created")
    console.log("URL:", response.result.paymentLink.url)

    return NextResponse.json({
      url: response.result.paymentLink.url,
    })

  } catch (error: any) {
    console.error("=== ERROR ===")
    console.error("Type:", error.constructor?.name || "Unknown")
    console.error("Message:", error.message)
    console.error("Stack:", error.stack)
    console.error("Status:", error.statusCode)
    if (error.errors) {
      console.error("Errors:", JSON.stringify(error.errors, null, 2))
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to create payment",
        details: error.errors || undefined,
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
