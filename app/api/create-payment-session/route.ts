// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"

// Use require to import Square SDK
const { SquareClient, SquareEnvironment } = require("square")

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Validate environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error("Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error("Missing SQUARE_LOCATION_ID")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const client = new SquareClient({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production" 
          ? SquareEnvironment.Production 
          : SquareEnvironment.Sandbox,
    })

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100)

    // Map payment methods
    const acceptedPaymentMethods = {
      applePay: paymentMethod === "wallets" || paymentMethod === "apple",
      googlePay: paymentMethod === "wallets" || paymentMethod === "google",
      cashAppPay: paymentMethod === "cashapp",
    }

    console.log("Creating payment link with:", {
      amount: amountInCents,
      paymentMethod,
      acceptedPaymentMethods,
      locationId: process.env.SQUARE_LOCATION_ID,
    })

    const response = await client.checkoutApi.createPaymentLink({
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
        acceptedPaymentMethods,
      },
    })

    console.log("Square API response:", response.result)

    if (!response.result.paymentLink?.url) {
      throw new Error("Failed to create payment link - no URL returned")
    }

    const successResponse = NextResponse.json({ 
      url: response.result.paymentLink.url,
      orderId: response.result.paymentLink.orderId 
    })
    successResponse.headers.set("Access-Control-Allow-Origin", "*")
    return successResponse
  } catch (error: any) {
    console.error("Square payment error details:", {
      message: error.message,
      errors: error.errors,
      statusCode: error.statusCode,
      body: error.body,
    })
    
    const errorResponse = NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment",
        details: error.errors || error.body || undefined,
      },
      { status: 500 },
    )
    errorResponse.headers.set("Access-Control-Allow-Origin", "*")
    return errorResponse
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
