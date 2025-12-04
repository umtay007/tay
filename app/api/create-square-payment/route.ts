// app/api/create-square-payment/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"

console.log("=== Square Payment Route Module Loaded ===")

export async function POST(request: Request) {
  console.log("\n\n==============================================")
  console.log("=== SQUARE PAYMENT REQUEST RECEIVED ===")
  console.log("==============================================\n")
  
  console.log("1. Request received at:", new Date().toISOString())
  
  try {
    // Parse body
    console.log("2. Parsing request body...")
    const body = await request.json()
    console.log("   Body:", JSON.stringify(body, null, 2))
    
    const { amount, paymentMethod } = body
    console.log("   Amount:", amount)
    console.log("   Payment Method:", paymentMethod)

    // Validate amount
    console.log("\n3. Validating amount...")
    if (!amount || amount <= 0) {
      console.log("   ✗ Invalid amount")
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    console.log("   ✓ Amount is valid")

    // Check environment variables
    console.log("\n4. Checking environment variables...")
    console.log("   SQUARE_ACCESS_TOKEN:", process.env.SQUARE_ACCESS_TOKEN ? "✓ Set (length: " + process.env.SQUARE_ACCESS_TOKEN.length + ")" : "✗ MISSING")
    console.log("   SQUARE_LOCATION_ID:", process.env.SQUARE_LOCATION_ID ? "✓ Set (" + process.env.SQUARE_LOCATION_ID + ")" : "✗ MISSING")
    console.log("   SQUARE_ENVIRONMENT:", process.env.SQUARE_ENVIRONMENT || "sandbox (default)")
    console.log("   NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL || "✗ MISSING")

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.log("   ✗ Missing SQUARE_ACCESS_TOKEN")
      return NextResponse.json({ error: "Missing Square Access Token" }, { status: 500 })
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.log("   ✗ Missing SQUARE_LOCATION_ID")
      return NextResponse.json({ error: "Missing Square Location ID" }, { status: 500 })
    }
    
    console.log("   ✓ All environment variables present")

    // Import Square SDK
    console.log("\n5. Importing Square SDK...")
    const square = await import("square")
    console.log("   ✓ Square SDK imported")
    console.log("   Available exports:", Object.keys(square).slice(0, 10).join(", "))

    const { Client, Environment } = square
    console.log("   ✓ Client and Environment extracted")

    // Create client
    console.log("\n6. Creating Square client...")
    const environment = process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox
    
    console.log("   Environment:", environment)
    
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: environment,
    })
    console.log("   ✓ Square client created")

    // Prepare request
    console.log("\n7. Preparing payment link request...")
    const amountInCents = Math.round(amount * 100)
    console.log("   Amount in cents:", amountInCents)

    const idempotencyKey = crypto.randomUUID()
    console.log("   Idempotency key:", idempotencyKey)

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pay-me2/success`
    console.log("   Redirect URL:", redirectUrl)

    const requestBody = {
      idempotencyKey: idempotencyKey,
      quickPay: {
        name: "Payment",
        locationId: process.env.SQUARE_LOCATION_ID,
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: "USD",
        },
      },
      checkoutOptions: {
        redirectUrl: redirectUrl,
      },
    }

    console.log("   Request body prepared:")
    console.log("   ", JSON.stringify({
      ...requestBody,
      quickPay: {
        ...requestBody.quickPay,
        priceMoney: {
          ...requestBody.quickPay.priceMoney,
          amount: amountInCents.toString()
        }
      }
    }, null, 2))

    // Make API call
    console.log("\n8. Calling Square API...")
    const response = await client.checkoutApi.createPaymentLink(requestBody)
    
    console.log("   ✓ Square API responded")
    console.log("   Status code:", response.statusCode)
    console.log("   Has payment link:", !!response.result.paymentLink)
    console.log("   Has URL:", !!response.result.paymentLink?.url)

    if (!response.result.paymentLink?.url) {
      console.log("   ✗ No payment link URL in response")
      console.log("   Full response:", JSON.stringify(response.result, null, 2))
      throw new Error("Failed to create payment link - no URL returned")
    }

    const paymentUrl = response.result.paymentLink.url
    console.log("   Payment URL:", paymentUrl)

    console.log("\n9. Sending success response...")
    const successResponse = NextResponse.json({
      url: paymentUrl,
      orderId: response.result.paymentLink.orderId,
    })
    
    console.log("   ✓ Success response prepared")
    console.log("\n=== SQUARE PAYMENT REQUEST COMPLETED SUCCESSFULLY ===\n")
    
    return successResponse

  } catch (error: any) {
    console.log("\n\n❌ =======================================")
    console.log("❌ ERROR OCCURRED")
    console.log("❌ =======================================\n")
    
    console.log("Error type:", error.constructor.name)
    console.log("Error message:", error.message)
    console.log("Error stack:", error.stack)
    
    if (error.statusCode) {
      console.log("Square API status code:", error.statusCode)
    }
    
    if (error.errors) {
      console.log("Square API errors:", JSON.stringify(error.errors, null, 2))
    }
    
    console.log("\n❌ =======================================\n")

    return NextResponse.json(
      {
        error: error.message || "Failed to create payment",
        details: error.errors?.[0]?.detail || undefined,
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  console.log("=== OPTIONS request received for CORS ===")
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

console.log("=== Square Payment Route Module Initialized ===")
