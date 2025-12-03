import { NextResponse } from "next/server"
import { SquareClient, SquareEnvironment } from "square"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { sourceId, amount } = await request.json()

    if (!sourceId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
    }

    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
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

    return NextResponse.json({
      success: true,
      paymentId: response.result.payment?.id,
    })
  } catch (error) {
    console.error("[v0] Square payment error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process payment",
      },
      { status: 500 },
    )
  }
}
