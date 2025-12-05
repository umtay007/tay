import { NextResponse } from "next/server"
import crypto from "crypto"
import { Redis } from "@upstash/redis"

export const runtime = "nodejs"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Function to verify Square webhook signature
function verifySquareSignature(body: string, signature: string, signatureKey: string, url: string): boolean {
  const hmac = crypto.createHmac("sha256", signatureKey)
  hmac.update(url + body)
  const hash = hmac.digest("base64")
  return hash === signature
}

async function notifyDiscordCompleted(amount: number, paymentId: string, orderId: string, paymentMethod: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.log("No Discord webhook configured")
    return
  }

  // Example: const userToPing = "<@123456789012345678>"
  const userToPing = "<@1346646019693215744>" // Replace with your Discord user ID

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `${userToPing} 💰 **PAYMENT COMPLETED!** 💰`, // Ping specific user
        embeds: [
          {
            title: "✅ Payment Successful!",
            description: `Someone just paid **$${amount.toFixed(2)}** with **${paymentMethod}**! 🎉`,
            color: 0x00ff00, // Green color
            fields: [
              {
                name: "Amount",
                value: `$${amount.toFixed(2)} USD`,
                inline: true,
              },
              {
                name: "Payment Method",
                value: paymentMethod,
                inline: true,
              },
              {
                name: "Status",
                value: "✅ Completed",
                inline: true,
              },
              {
                name: "Payment ID",
                value: paymentId,
                inline: false,
              },
              {
                name: "Order ID",
                value: orderId,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "Tays payment nigga",
            },
          },
        ],
      }),
    })
    console.log("✅ Discord notification sent (completed)!")
  } catch (error) {
    console.error("Failed to send Discord notification:", error)
  }
}

function getPaymentMethod(payment: any): string {
  // Check for various payment methods in order of priority
  if (payment.source_type === "CASH_APP") {
    return "Cash App"
  }
  if (payment.source_type === "WALLET") {
    const walletType = payment.card_details?.card?.card_brand || payment.wallet_details?.brand
    if (walletType === "APPLE_PAY" || payment.card_details?.entry_method === "ON_FILE") {
      return "Apple Pay"
    }
    if (walletType === "GOOGLE_PAY") {
      return "Google Pay"
    }
    return "Digital Wallet"
  }
  if (payment.source_type === "CARD") {
    const cardBrand = payment.card_details?.card?.card_brand
    return cardBrand ? `Card (${cardBrand})` : "Card"
  }
  if (payment.source_type === "BANK_ACCOUNT") {
    return "ACH Bank Transfer"
  }
  if (payment.source_type === "EXTERNAL") {
    return "External Payment"
  }
  return "Unknown"
}

export async function POST(request: Request) {
  console.log("=== Square Webhook Received ===")

  try {
    const body = await request.text()
    const signature = request.headers.get("x-square-hmacsha256-signature") || ""
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY

    // Verify webhook signature if configured
    if (webhookSignatureKey && signature) {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/square-webhook`
      const isValid = verifySquareSignature(body, signature, webhookSignatureKey, url)

      if (!isValid) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log("Webhook event type:", event.type)

    // Handle payment.updated event
    if (event.type === "payment.updated") {
      const payment = event.data?.object?.payment

      if (!payment) {
        console.log("No payment data in webhook")
        return NextResponse.json({ message: "No payment data" })
      }

      console.log("Payment status:", payment.status)
      console.log("Payment ID:", payment.id)

      // Only notify on COMPLETED payments
      if (payment.status === "COMPLETED") {
        const paymentId = payment.id

        const alreadyProcessed = await redis.get(`payment:${paymentId}`)

        if (alreadyProcessed) {
          console.log("⚠️ Payment already processed, skipping duplicate notification")
          return NextResponse.json({ message: "Duplicate webhook, already processed" })
        }

        await redis.set(`payment:${paymentId}`, "processed", { ex: 86400 })

        const amountInCents = payment.amount_money?.amount || 0
        const amount = amountInCents / 100
        const orderId = payment.order_id || "N/A"
        const paymentMethod = getPaymentMethod(payment)

        console.log("💰 You got yo bands twin! Amount:", amount, "Method:", paymentMethod)

        // Send Discord notification (green embed + specific user ping)
        await notifyDiscordCompleted(amount, paymentId, orderId, paymentMethod)
      }
    }

    return NextResponse.json({ message: "Webhook processed" })
  } catch (error: any) {
    console.error("Webhook processing error:", error.message)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Square Webhook Endpoint",
    status: "Active",
  })
}
