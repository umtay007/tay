import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function notifyDiscordCompleted(amount: number, orderId: string) {
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
        content: "@everyone 💰 **PAYMENT COMPLETED!** 💰",
        embeds: [
          {
            title: "✅ Payment Completed!",
            description: `A payment of **$${amount.toFixed(2)}** has been successfully completed!`,
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
    console.log("✅ Discord completion notification sent!")
  } catch (error) {
    console.error("Failed to send Discord notification:", error)
  }
}

// Square webhook handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Square webhook received:", JSON.stringify(body, null, 2))

    // Check if this is a payment completed event
    if (body.type === "payment.created" || body.type === "payment.updated") {
      const payment = body.data?.object?.payment

      if (payment && payment.status === "COMPLETED") {
        const amountInCents = payment.amount_money?.amount || 0
        const amount = amountInCents / 100
        const orderId = payment.order_id || payment.id

        console.log("[v0] Payment completed:", { amount, orderId })

        // Send Discord notification with ping
        await notifyDiscordCompleted(amount, orderId)
      }
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
