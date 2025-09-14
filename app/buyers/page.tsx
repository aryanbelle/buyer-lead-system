import { BuyersPageClient } from "@/components/buyers/buyers-page-client"
import { getBuyersServer, getFiltersFromSearchParams } from "@/lib/buyers-server"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PageLoading } from "@/components/layout/page-loading"

interface BuyersPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  // Try server-side authentication check, but don't fail hard
  const user = getCurrentUser()
  
  // Always fetch data - let client-side handle auth redirect if needed
  const { buyers, pagination } = await getBuyersServer(searchParams)
  const filters = getFiltersFromSearchParams(searchParams)

  return (
    <Suspense fallback={<PageLoading />}>
      <BuyersPageClient
        initialBuyers={buyers}
        initialFilters={filters}
        pagination={pagination}
        serverUser={user}
      />
    </Suspense>
  )
}
