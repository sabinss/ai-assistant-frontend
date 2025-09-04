import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ToastContainer } from "react-toastify"
import Hydration from "./Hydration"
const poppins = Poppins({ subsets: ["latin"], weight: "400" })
import Script from "next/script" // ✅ import Script

export const metadata: Metadata = {
  title: "CoWrkr- Customer Success CoWorker",
  description: "Customer Success Management Platform",
  // Remove technology disclosure
  generator: undefined,
  applicationName: "CoWrkr",
  authors: [{ name: "CoWrkr Team" }],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Remove technology disclosure meta tags */}
        <meta name="generator" content="" />
        <meta name="framework" content="" />
        <meta name="cms" content="" />
      </head>
      <body className={poppins.className}>
        <ToastContainer />
        {/* ✅ Load tracker script after page becomes interactive */}
        <Script src="/tracker.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  )
}
