// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"
// ✅ Use ESM import for the new SDK
import { SquareClient, SquareEnvironment } from "square"

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    })

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100)

    // Map your paymentMethod to Square's AcceptedPaymentMethods
    const acceptedPaymentMethods = {
      applePay: paymentMethod === "wallets",
      googlePay: paymentMethod === "wallets",
      cashAppPay: paymentMethod === "cashapp",
    }

    // ✅ Use `checkoutApi`, not `checkout`
    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: "Payment",
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: "USD",
        },
        locationId: process.env.SQUARE_LOCATION_ID!,
      },
      checkoutOptions: {
        // ✅ Correct property name is `acceptedPaymentMethods`
        acceptedPaymentMethods,
        redirectUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/pay-me2/success`,
      },
    })

    if (!response.paymentLink?.url) {
      throw new Error("Failed to create payment link")
    }

    const successResponse = NextResponse.json({ url: response.paymentLink.url })
    successResponse.headers.set("Access-Control-Allow-Origin", "*")
    return successResponse
  } catch (error) {
    console.error("[v0] Square payment error:", error)
    const errorResponse = NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment",
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
