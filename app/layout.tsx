import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { VisitorProvider } from "@/contexts/visitor-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Visitor Management System",
  description: "Exhibition stall visitor management and product inquiry system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VisitorProvider>
          <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">{children}</main>
          <Toaster />
        </VisitorProvider>
      </body>
    </html>
  )
}
