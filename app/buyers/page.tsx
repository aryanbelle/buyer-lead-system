import { BuyersPageClient } from "@/components/buyers/buyers-page-client"
import { getBuyersServer, getFiltersFromSearchParams } from "@/lib/buyers-server"
import { Suspense } from "react"
import { PageLoading } from "@/components/layout/page-loading"

interface BuyersPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function BuyersPage({ searchParams }: BuyersPageProps) {
  // Server-side data fetching
  const { buyers, pagination } = await getBuyersServer(searchParams)
  const filters = getFiltersFromSearchParams(searchParams)

  return (
    <Suspense fallback={<PageLoading />}>
      <BuyersPageClient
        initialBuyers={buyers}
        initialFilters={filters}
        pagination={pagination}
      />
    </Suspense>
  )
}
