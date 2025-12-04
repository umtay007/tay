// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod = "cashapp" } = await request.json()

    console.log("=== Square Payment Request ===")
    console.log("Amount:", amount)
    console.log("Payment Method:", paymentMethod)
    console.log("Environment:", process.env.SQUARE_ENVIRONMENT || "sandbox")
    console.log("Access Token exists:", !!process.env.SQUARE_ACCESS_TOKEN)
    console.log("Location ID:", process.env.SQUARE_LOCATION_ID)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Missing Square Access Token" }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: "Missing Square Location ID" }, { status: 500 })
    }

    // Dynamic import to avoid SSR issues
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

    // Build accepted payment methods
    const acceptedPaymentMethods: any = {}
    
    if (paymentMethod === "cashapp") {
      acceptedPaymentMethods.cashAppPay = true
    } else if (paymentMethod === "wallets") {
      acceptedPaymentMethods.applePay = true
      acceptedPaymentMethods.googlePay = true
    }

    console.log("Accepted Payment Methods:", acceptedPaymentMethods)

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
        ...(Object.keys(acceptedPaymentMethods).length > 0 && { acceptedPaymentMethods }),
      },
    }

    console.log("Request Body:", JSON.stringify(requestBody, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))

    const response = await client.checkoutApi.createPaymentLink(requestBody)

    console.log("Square Response Status:", response.statusCode)
    console.log("Payment Link Created:", !!response.result.paymentLink)

    if (!response.result.paymentLink?.url) {
      console.error("No payment link URL in response:", response.result)
      throw new Error("Failed to create payment link - no URL returned")
    }

    console.log("Payment Link URL:", response.result.paymentLink.url)

    return NextResponse.json({
      url: response.result.paymentLink.url,
      orderId: response.result.paymentLink.orderId,
    })
  } catch (error: any) {
    console.error("=== Square Payment Error ===")
    console.error("Error Type:", error.constructor.name)
    console.error("Error Message:", error.message)
    console.error("Status Code:", error.statusCode)
    console.error("Errors:", JSON.stringify(error.errors, null, 2))
    console.error("Full Error:", error)

    return NextResponse.json(
      {
        error: error.message || "Failed to create payment",
        details: error.errors || undefined,
        statusCode: error.statusCode || undefined,
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
