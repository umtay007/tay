// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod = "cashapp" } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Missing Square Access Token" }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: "Missing Square Location ID" }, { status: 500 })
    }

    // Dynamic import for Square SDK
    const square = await import("square")
    const { Client: SquareClient, Environment: SquareEnvironment } = square

    const client = new SquareClient({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    })

    const amountInCents = Math.round(amount * 100)

    // Simple request structure - let Square handle available payment methods
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

    console.log("Creating Square payment link for amount:", amount)

    const response = await client.checkoutApi.createPaymentLink(requestBody)

    if (!response.result.paymentLink?.url) {
      throw new Error("Failed to create payment link")
    }

    console.log("✓ Payment link created successfully")

    return NextResponse.json({
      url: response.result.paymentLink.url,
    })
  } catch (error: any) {
    console.error("Square payment error:", {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    })

    return NextResponse.json(
      {
        error: error.message || "Failed to create payment",
        details: error.errors?.[0]?.detail || undefined,
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
