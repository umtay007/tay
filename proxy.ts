import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define case-insensitive route mappings
  const routeMappings: Record<string, string> = {
    "/bank": "/Bank",
    "/usa": "/USA",
    "/sepa": "/SEPA",
    "/ukbt": "/UKBT",
    "/cad": "/CAD",
    "/interac": "/CAD", // Redirect old interac route to CAD
  }

  // Check if the lowercase path exists in our mappings
  const lowerPath = path.toLowerCase()
  if (routeMappings[lowerPath] && path !== routeMappings[lowerPath]) {
    // Redirect to the correct casing
    const url = request.nextUrl.clone()
    url.pathname = routeMappings[lowerPath]
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/bank",
    "/usa",
    "/sepa",
    "/ukbt",
    "/cad",
    "/interac",
    "/Bank",
    "/USA",
    "/SEPA",
    "/UKBT",
    "/CAD",
    "/Interac",
  ],
}
