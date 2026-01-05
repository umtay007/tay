import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const lowerPath = path.toLowerCase()

  // Map lowercase paths to their actual folder names
  const pathMap: Record<string, string> = {
    "/bank": "/Bank",
    "/usa": "/USA",
    "/sepa": "/SEPA",
    "/ukbt": "/UKBT",
    "/cad": "/CAD",
    "/interac": "/CAD",
  }

  // Only redirect if the path is in our map AND doesn't already match the target
  if (lowerPath in pathMap && path !== pathMap[lowerPath]) {
    const url = new URL(request.url)
    url.pathname = pathMap[lowerPath]
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/(bank|Bank|BANK)",
    "/(usa|USA|Usa)",
    "/(sepa|SEPA|Sepa)",
    "/(ukbt|UKBT|Ukbt)",
    "/(cad|CAD|Cad)",
    "/(interac|Interac|INTERAC)",
  ],
}
