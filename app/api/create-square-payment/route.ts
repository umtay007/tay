import { NextResponse } from "next/server"
import crypto from "crypto"
import { Client as SquareClient, Environment as SquareEnvironment } from "square"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const client = new SquareClient({
      environment:
        process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    })

    const amountInCents = Math.round(amount * 100)

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      checkoutOptions: {
        askForShippingAddress: false,
        enableCoupon: false,
        enableLoyalty: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success`,
        acceptedPaymentMethods: {
          applePay: true,
          cashAppPay: true,
          googlePay: true,
        },
      },
      description: "Payment",
      paymentNote: "Thank you!",
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
