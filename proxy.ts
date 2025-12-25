import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const lowerPath = path.toLowerCase()

  // Only redirect if the path is uppercase and matches our routes
  if (lowerPath !== path) {
    const routesToHandle = ["/bank", "/usa", "/sepa", "/ukbt", "/cad"]

    if (routesToHandle.includes(lowerPath)) {
      const url = new URL(request.url)
      url.pathname = lowerPath === "/interac" ? "/CAD" : path.toUpperCase().replace("/INTERAC", "/CAD")
      return NextResponse.redirect(url, 301)
    }
  }

  // Handle old /interac route
  if (lowerPath === "/interac") {
    const url = new URL(request.url)
    url.pathname = "/CAD"
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
