import { NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {
  console.log("[v0] Payment Session Request")

  try {
    const body = await request.json()
    const { amount, paymentMethod } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get("origin") || "http://localhost:3000"

    // Configure payment method types based on selection
    const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = []

    if (paymentMethod === "cashapp") {
      paymentMethodTypes.push("cashapp")
    } else if (paymentMethod === "wallets") {
      // Digital wallets are handled automatically by Stripe when card is enabled
      paymentMethodTypes.push("card")
    } else if (paymentMethod === "revolut_pay") {
      paymentMethodTypes.push("revolut_pay")
    } else if (paymentMethod === "ukbt") {
      return NextResponse.json(
        {
          error:
            "UK Bank Transfer is not yet enabled. Please enable BACS Direct Debit in your Stripe Dashboard at: https://dashboard.stripe.com/settings/payment_methods",
        },
        { status: 400 },
      )
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: paymentMethod === "ukbt" ? "gbp" : "usd",
            product_data: {
              name: "Payment",
              description: `Payment via ${
                paymentMethod === "cashapp"
                  ? "Cash App"
                  : paymentMethod === "ukbt"
                    ? "UK Bank Transfer (FPS)"
                    : paymentMethod === "revolut_pay"
                      ? "Revolut Pay"
                      : "Digital Wallet"
              }`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents/pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pay-me/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay-me?canceled=true`,
    }

    if (paymentMethod === "ukbt") {
      sessionParams.payment_intent_data = {
        setup_future_usage: "off_session",
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log("[v0] Checkout session created:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[v0] Error creating checkout session:", error.message)
    return NextResponse.json({ error: error.message || "Payment session creation failed" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
