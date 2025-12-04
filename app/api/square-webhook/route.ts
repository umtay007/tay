// app/api/square-webhook/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"

// Function to verify Square webhook signature
function verifySquareSignature(body: string, signature: string, signatureKey: string, url: string): boolean {
  const hmac = crypto.createHmac("sha256", signatureKey)
  hmac.update(url + body)
  const hash = hmac.digest("base64")
  return hash === signature
}

// Function to send Discord notification for COMPLETED payment
async function notifyDiscordCompleted(amount: number, paymentId: string, orderId: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.log("No Discord webhook configured")
    return
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "@everyone 💰 **PAYMENT COMPLETED!** 💰", // PING @everyone!
        embeds: [
          {
            title: "✅ Payment Successful!",
            description: `Someone just paid **$${amount.toFixed(2)}**! 🎉`,
            color: 0x00ff00, // Green color
            fields: [
              {
                name: "Amount",
                value: `$${amount.toFixed(2)} USD`,
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
              text: "Square Payment System",
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
        const amountInCents = payment.amount_money?.amount || 0
        const amount = amountInCents / 100
        const paymentId = payment.id
        const orderId = payment.order_id || "N/A"

        console.log("💰 Payment completed! Amount:", amount)

        // Send Discord notification (green embed + @everyone ping)
        await notifyDiscordCompleted(amount, paymentId, orderId)
      }
    }

    return NextResponse.json({ message: "Webhook processed" })

  } catch (error: any) {
    console.error("Webhook processing error:", error.message)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Square Webhook Endpoint",
    status: "Active" 
  })
}
