export const securityConfig = {
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  },

  csp: {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "https:", "blob:"],
    "connect-src": [
      "'self'",
      "https://18.191.201.61:5001",
      "https://www.google-analytics.com",
    ],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  },

  hsts: {
    "max-age": 31536000,
    includeSubDomains: true,
    preload: true,
  },
}

export const generateCSP = () => {
  return Object.entries(securityConfig.csp)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ")
}

export const generateHSTS = () => {
  const { "max-age": maxAge, includeSubDomains, preload } = securityConfig.hsts
  let hsts = `max-age=${maxAge}`
  if (includeSubDomains) hsts += "; includeSubDomains"
  if (preload) hsts += "; preload"
  return hsts
}
