import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Redis } from "@upstash/redis"

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ""
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = formData.get("sessionId") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const referral = formData.get("referral") as string
    const screenshot = formData.get("screenshot") as File | null

    let cardInfo = "N/A"
    let isGreenDot = false
    let paymentIntentId = ""

    if (sessionId && sessionId !== "N/A") {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["payment_intent.payment_method"],
        })

        if (session.payment_intent && typeof session.payment_intent === "object") {
          const paymentIntent = session.payment_intent as Stripe.PaymentIntent
          paymentIntentId = paymentIntent.id

          if (paymentIntent.payment_method && typeof paymentIntent.payment_method === "object") {
            const pm = paymentIntent.payment_method as Stripe.PaymentMethod
            if (pm.card) {
              const brand = pm.card.brand || "Unknown"
              const last4 = pm.card.last4 || "****"
              const issuer = pm.card.issuer || ""

              cardInfo = `${brand.toUpperCase()} *${last4}`

              if (issuer.toLowerCase().includes("greendot") || issuer.toLowerCase().includes("green dot")) {
                isGreenDot = true
                cardInfo += " (GreenDot)"
              }
            }
          }
        }
      } catch (stripeError) {
        console.error("[v0] Error fetching Stripe session:", stripeError)
      }
    }

    const pendingPaymentId = `pending_${Date.now()}_${Math.random().toString(36).substring(7)}`
    await redis.setex(
      pendingPaymentId,
      86400, // 24 hours
      JSON.stringify({
        sessionId,
        paymentIntentId,
        paymentMethod,
        referral,
        cardInfo,
        isGreenDot,
        timestamp: new Date().toISOString(),
      }),
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const approveUrl = `${baseUrl}/api/payment-approval?id=${pendingPaymentId}&action=approve`
    const rejectUrl = `${baseUrl}/api/payment-approval?id=${pendingPaymentId}&action=reject`

    // Create Discord embed
    const embed = {
      title: isGreenDot ? "⚠️ GreenDot Card Payment Detected!" : "💰 New Payment Received",
      color: isGreenDot ? 0xff9900 : 0x00ff00,
      fields: [
        {
          name: "Payment Method",
          value: paymentMethod || "Unknown",
          inline: true,
        },
        {
          name: "Card Info",
          value: cardInfo,
          inline: true,
        },
        {
          name: "GreenDot Detected",
          value: isGreenDot ? "❌ YES" : "✅ NO",
          inline: true,
        },
        {
          name: "Session ID",
          value: sessionId || "N/A",
          inline: false,
        },
        {
          name: "Referred By",
          value: referral || "None",
          inline: false,
        },
        {
          name: "Action Required",
          value: `[✅ Approve Payment](${approveUrl})\n[❌ Refund Payment](${rejectUrl})`,
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Click the links above to approve or refund this payment",
      },
    }

    if (isGreenDot) {
      embed.fields.splice(5, 0, {
        name: "⚠️ Warning",
        value: "This payment was made using a GreenDot card. Please verify the payment carefully before approving.",
        inline: false,
      })
    }

    // Prepare Discord webhook payload
    const discordPayload = new FormData()
    discordPayload.append("payload_json", JSON.stringify({ embeds: [embed] }))

    // Attach screenshot if provided
    if (screenshot) {
      const buffer = await screenshot.arrayBuffer()
      const blob = new Blob([buffer], { type: screenshot.type })
      discordPayload.append("file", blob, screenshot.name)
    }

    // Send to Discord webhook
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: discordPayload,
    })

    if (!discordResponse.ok) {
      throw new Error("Failed to send Discord notification")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing payment confirmation:", error)
    return NextResponse.json({ error: "Failed to process confirmation" }, { status: 500 })
  }
}
