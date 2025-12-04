// app/api/create-square-payment/route.ts

export const runtime = "nodejs"

import { NextResponse } from "next/server"
import crypto from "crypto"
import { Client, Environment } from "square"

// Initialize Square client with correct SDK types
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!, // REQUIRED
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { amount, note, referenceId } = body as {
      amount?: number
      note?: string
      referenceId?: string
    }

    // We expect `amount` in **cents** (e.g. $5.00 -> 500)
    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing `amount`. It should be an integer in cents (e.g. $5.00 -> 500).",
        },
        { status: 400 }
      )
    }

    const locationId = process.env.SQUARE_LOCATION_ID
    if (!locationId) {
      return NextResponse.json(
        { error: "SQUARE_LOCATION_ID is not set in environment." },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL is not set in environment." },
        { status: 500 }
      )
    }

    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: note || "Payment to Tayster",
        locationId,
        priceMoney: {
          amount: BigInt(amount), // cents
          currency: (process.env.SQUARE_CURRENCY as any) || "USD",
        },
        note,
        referenceId,
      },
      checkoutOptions: {
        redirectUrl: `${baseUrl}/pay-me2/success`,
        askForShippingAddress: false,
        acceptedPaymentMethods: {
          applePay: true,
          cashAppPay: true,
          card: true,
        },
        // You can pass referenceId here too if you want
        // referenceId,
      },
    })

    const paymentLinkUrl = result.paymentLink?.url
    if (!paymentLinkUrl) {
      return NextResponse.json(
        { error: "Failed to create Square payment link." },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: paymentLinkUrl }, { status: 200 })
  } catch (err: any) {
    console.error("Square createPaymentLink error:", err)

    const message =
      err?.errors?.[0]?.detail ||
      err?.message ||
      "Unexpected error while creating Square payment link."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
