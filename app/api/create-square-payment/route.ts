// app/api/create-square-payment/route.ts
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Function to send Discord notification for payment STARTED
async function notifyDiscordStarted(amount: number, paymentUrl: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.log("No Discord webhook configured, skipping notification")
    return
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // NO @everyone ping for started payments
        embeds: [
          {
            title: "💳 Payment Started",
            description: `Someone is checking out for **$${amount.toFixed(2)}**`,
            color: 0x0099ff, // Blue color
            fields: [
              {
                name: "Amount",
                value: `$${amount.toFixed(2)} USD`,
                inline: true,
              },
              {
                name: "Status",
                value: "⏳ Pending",
                inline: true,
              },
              {
                name: "Payment Link",
                value: `[View Checkout](${paymentUrl})`,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "Square Payment System",
            },
          },
        ],
      }),
    })
    console.log("✅ Discord notification sent (started)!")
  } catch (error) {
    console.error("Failed to send Discord notification:", error)
  }
}

export async function POST(request: Request) {
  console.log("=== Square Payment Request (HTTP API) ===")

  try {
    const body = await request.json()
    const { amount, paymentMethod, acceptedPaymentMethods } = body

    console.log("Amount:", amount, "Payment Method:", paymentMethod)

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId = process.env.SQUARE_LOCATION_ID
    const environment = process.env.SQUARE_ENVIRONMENT || "production"
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    if (!accessToken) {
      console.error("Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!locationId) {
      console.error("Missing SQUARE_LOCATION_ID")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("Env:", environment, "Location:", locationId)

    const squareApiUrl =
      environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com"

    const amountInCents = Math.round(amount * 100)

    const paymentMethods = acceptedPaymentMethods || {
      cash_app_pay: true,
      apple_pay: true,
      google_pay: true,
    }

    const response = await fetch(`${squareApiUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-12-18",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        quick_pay: {
          name: "Payment",
          location_id: locationId,
          price_money: {
            amount: amountInCents,
            currency: "USD",
          },
        },
        checkout_options: {
          redirect_url: `${baseUrl}/pay-me2/success`,
          accepted_payment_methods: {
            ...paymentMethods,
            card: false,
          },
          ask_for_shipping_address: false,
          merchant_support_email: undefined,
          require_phone_number: false,
        },
      }),
    })

    const data = await response.json()

    console.log("Square response status:", response.status)

    if (!response.ok) {
      console.error("Square error:", data)
      return NextResponse.json(
        {
          error: data.errors?.[0]?.detail || "Payment creation failed",
          details: data.errors,
        },
        { status: response.status },
      )
    }

    if (!data.payment_link?.url) {
      console.error("No payment URL in response")
      return NextResponse.json({ error: "No payment URL received" }, { status: 500 })
    }

    console.log("✅ Payment link created:", data.payment_link.url)

    // Send Discord notification for STARTED payment (blue, no ping)
    notifyDiscordStarted(amount, data.payment_link.url).catch(console.error)

    return NextResponse.json({
      url: data.payment_link.url,
    })
  } catch (error: any) {
    console.error("Error:", error.message)
    return NextResponse.json({ error: error.message || "Payment creation failed" }, { status: 500 })
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
