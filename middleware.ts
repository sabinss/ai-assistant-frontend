import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  securityConfig,
  generateCSP,
  generateHSTS,
} from "./src/config/security"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Apply security headers from configuration
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Content Security Policy
  response.headers.set("Content-Security-Policy", generateCSP())

  // HSTS header for HTTPS (production only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", generateHSTS())
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
