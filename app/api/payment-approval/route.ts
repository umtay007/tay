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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pendingPaymentId = searchParams.get("id")
    const action = searchParams.get("action")

    if (!pendingPaymentId || !action) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Request</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
              .container { text-align: center; }
              h1 { color: #ff4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Invalid Request</h1>
              <p>Missing payment ID or action.</p>
            </div>
          </body>
        </html>
        `,
        { status: 400, headers: { "Content-Type": "text/html" } },
      )
    }

    // Retrieve pending payment data
    const paymentDataStr = await redis.get(pendingPaymentId)

    if (!paymentDataStr) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Not Found</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
              .container { text-align: center; }
              h1 { color: #ff9900; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Payment Not Found</h1>
              <p>This payment has already been processed or has expired.</p>
            </div>
          </body>
        </html>
        `,
        { status: 404, headers: { "Content-Type": "text/html" } },
      )
    }

    const paymentData = JSON.parse(paymentDataStr as string)

    if (action === "approve") {
      // Delete from Redis
      await redis.del(pendingPaymentId)

      // Send confirmation to Discord
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "✅ Payment Approved",
              color: 0x00ff00,
              fields: [
                {
                  name: "Session ID",
                  value: paymentData.sessionId || "N/A",
                  inline: false,
                },
                {
                  name: "Card Info",
                  value: paymentData.cardInfo,
                  inline: true,
                },
                {
                  name: "Status",
                  value: "Payment has been approved and will NOT be refunded.",
                  inline: false,
                },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Approved</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
              .container { text-align: center; }
              h1 { color: #00ff00; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Payment Approved</h1>
              <p>The payment has been approved and will NOT be refunded.</p>
              <p style="color: #888;">You can close this tab.</p>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html" } },
      )
    } else if (action === "reject") {
      // Process refund through Stripe
      if (paymentData.paymentIntentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: paymentData.paymentIntentId,
            reason: "requested_by_customer",
          })

          // Delete from Redis
          await redis.del(pendingPaymentId)

          // Send confirmation to Discord
          await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [
                {
                  title: "❌ Payment Refunded",
                  color: 0xff0000,
                  fields: [
                    {
                      name: "Session ID",
                      value: paymentData.sessionId || "N/A",
                      inline: false,
                    },
                    {
                      name: "Card Info",
                      value: paymentData.cardInfo,
                      inline: true,
                    },
                    {
                      name: "Refund ID",
                      value: refund.id,
                      inline: true,
                    },
                    {
                      name: "Status",
                      value: "Payment has been refunded successfully.",
                      inline: false,
                    },
                  ],
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          })

          return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Payment Refunded</title>
                <style>
                  body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
                  .container { text-align: center; }
                  h1 { color: #ff4444; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>❌ Payment Refunded</h1>
                  <p>The payment has been successfully refunded.</p>
                  <p><strong>Refund ID:</strong> ${refund.id}</p>
                  <p style="color: #888;">You can close this tab.</p>
                </div>
              </body>
            </html>
            `,
            { status: 200, headers: { "Content-Type": "text/html" } },
          )
        } catch (stripeError: any) {
          console.error("[v0] Error processing refund:", stripeError)

          return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Refund Failed</title>
                <style>
                  body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
                  .container { text-align: center; }
                  h1 { color: #ff9900; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>⚠️ Refund Failed</h1>
                  <p>Failed to process refund: ${stripeError.message}</p>
                  <p style="color: #888;">Please process this refund manually in Stripe Dashboard.</p>
                </div>
              </body>
            </html>
            `,
            { status: 500, headers: { "Content-Type": "text/html" } },
          )
        }
      }
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error) {
    console.error("Error processing payment approval:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
