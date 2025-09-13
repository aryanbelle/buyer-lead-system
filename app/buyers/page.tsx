"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { BuyerList } from "@/components/buyers/buyer-list"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BuyersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <PageLoading />
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <main className="pt-6">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <BuyerList />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
