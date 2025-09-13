"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { BuyerListSSR } from "@/components/buyers/buyer-list-ssr"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { Buyer, BuyerFilters } from "@/lib/types"

interface BuyersPageClientProps {
  initialBuyers: Buyer[]
  initialFilters: BuyerFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function BuyersPageClient({ 
  initialBuyers, 
  initialFilters, 
  pagination 
}: BuyersPageClientProps) {
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
            <BuyerListSSR
              initialBuyers={initialBuyers}
              initialFilters={initialFilters}
              pagination={pagination}
              user={user}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
