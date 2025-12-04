import { NextResponse } from "next/server"
import { Client } from "square"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { sourceId, amount } = await request.json()

    if (!sourceId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 })
    }

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    })

    const amountInCents = Math.round(amount * 100)

    const response = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: "USD",
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
    })

    return NextResponse.json({ success: true, payment: response.result.payment })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment failed" }, { status: 500 })
  }
}
