// app/api/create-payment-session/route.ts
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("=== Payment Session Request ===")
  
  try {
    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // This route is for non-Square payments (Stripe, etc.)
    // Add your payment provider logic here
    
    console.log("Payment session request for amount:", amount)

    return NextResponse.json({
      error: "This payment method is not yet configured",
    }, { status: 501 })

  } catch (error: any) {
    console.error("Error:", error.message)
    return NextResponse.json(
      { error: "Payment session creation failed" },
      { status: 500 }
    )
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
