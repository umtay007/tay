import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "page_views"

    // Increment the view count in Redis for the specific page
    const views = await redis.incr(page)
    return NextResponse.json({ views })
  } catch (error) {
    console.error("Error incrementing page views:", error)
    return NextResponse.json({ views: 0 }, { status: 500 })
  }
}
