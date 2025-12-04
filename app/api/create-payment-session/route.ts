// app/api/create-square-payment/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ 
    message: "TEST ROUTE IS WORKING",
    timestamp: new Date().toISOString() 
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: "POST TEST ROUTE IS WORKING",
    timestamp: new Date().toISOString() 
  })
}
