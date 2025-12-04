// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"
import { Client } from "square"

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Initialize Square client
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    })

    const amountInCents = Math.round(amount * 100)

    // Map your paymentMethod to Square's AcceptedPaymentMethods
    const acceptedPaymentMethods = {
      applePay: paymentMethod === "applePay",
      googlePay: paymentMethod === "googlePay",
      cashAppPay: paymentMethod === "cashAppPay",
    }

    // Use the checkoutApi from the client
    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      checkoutOptions: {
        askForShippingAddress: false,
        enableCoupon: false,
        enableLoyalty: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
        acceptedPaymentMethods,
      },
      description: "Payment",
      paymentNote: "Thank you for your payment!",
      quickPay: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        name: "Payment",
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: "USD",
        },
      },
    })

    if (!response.result.paymentLink?.url) {
      throw new Error("Failed to create payment link")
    }

    const successResponse = NextResponse.json({ url: response.result.paymentLink.url })
    successResponse.headers.set("Access-Control-Allow-Origin", "*")
    return successResponse
  } catch (error) {
    console.error("Square payment error:", error)
    const errorResponse = NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create payment",
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
