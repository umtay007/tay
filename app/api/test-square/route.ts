// app/api/test-square/route.ts

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("=== TEST ROUTE CALLED ===")
  
  return NextResponse.json({
    message: "Test route is working!",
    env: {
      hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
      hasLocationId: !!process.env.SQUARE_LOCATION_ID,
      environment: process.env.SQUARE_ENVIRONMENT || "not set",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not set",
    }
  })
}

export async function POST(request: Request) {
  console.log("=== POST TEST ROUTE CALLED ===")
  
  try {
    const body = await request.json()
    console.log("Received body:", body)
    
    return NextResponse.json({
      message: "POST test route is working!",
      receivedData: body,
    })
  } catch (error) {
    console.error("Error in test route:", error)
    return NextResponse.json(
      { error: "Failed to parse body" },
      { status: 400 }
    )
  }
}
