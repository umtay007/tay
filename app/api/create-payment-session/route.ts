// app/api/create-square-payment/route.ts
import { NextResponse } from "next/server"
import { SquareClient, SquareEnvironment } from "square"

export async function POST(request: Request) {
  try {
    const { amount, paymentMethod } = await request.json()

    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
      environment:
        process.env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    })

    // Basic sanity checks
    const allClientKeys = Object.keys(client as any)
    const hasCheckout = "checkout" in (client as any)
    const checkout = (client as any).checkout
    const checkoutKeys = checkout ? Object.keys(checkout) : null
    const checkoutMethods = checkout
      ? Object.getOwnPropertyNames(Object.getPrototypeOf(checkout))
      : null

    const response = NextResponse.json({
      success: true,
      debug: {
        hasCheckout,
        checkoutKeys,
        checkoutMethods,
        allClientKeys,
      },
    })

    response.headers.set("Access-Control-Allow-Origin", "*")
    return response
  } catch (error: any) {
    console.error("[create-square-payment] Error:", error)

    const errorResponse = NextResponse.json(
      {
        error: error?.message || "Unknown error",
        stack: error?.stack,
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
