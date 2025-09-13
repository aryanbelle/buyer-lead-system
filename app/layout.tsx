import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "Buyer Lead System - Manage Your Property Leads",
  description: "Professional buyer lead management system for real estate professionals",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  )
}
