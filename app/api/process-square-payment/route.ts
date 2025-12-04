import { NextResponse } from "next/server"
import { Client } from "square"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { token, amount, paymentMethod } = await request.json()

    if (!token || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
    }

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    })

    const amountInCents = Math.round(amount * 100)

    const paymentResponse = await client.paymentsApi.createPayment({
      sourceId: token,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: "USD",
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
    })

    if (!paymentResponse.result.payment) {
      throw new Error("Payment failed")
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.result.payment.id,
    })
  } catch (error) {
    console.error("Square payment error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process payment",
      },
      { status: 500 },
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
