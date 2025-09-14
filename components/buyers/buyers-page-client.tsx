"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { BuyerListSSR } from "@/components/buyers/buyer-list-ssr"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
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
  serverUser: any
}

export function BuyersPageClient({ 
  initialBuyers, 
  initialFilters, 
  pagination,
  serverUser 
}: BuyersPageClientProps) {
  const { user, isLoading } = useAuth()

  // Use client-side user first, fallback to server user
  const currentUser = user || serverUser

  if (isLoading && !serverUser) {
    return <PageLoading />
  }

  if (!currentUser) {
    // Redirect to login if no user found
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return <PageLoading />
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
              user={currentUser}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
