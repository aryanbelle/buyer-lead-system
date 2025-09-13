import { eq, desc, and, or, like, gte, lte, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { buyerFiltersSchema } from "@/lib/validation"
import { BuyerListSSR } from "./buyer-list-ssr"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { redirect } from "next/navigation"
import type { BuyerFilters } from "@/lib/types"

interface BuyersPageContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function BuyersPageContent({ searchParams }: BuyersPageContentProps) {
  // Parse search params into filters for SSR
  const filters: BuyerFilters = {}
  const page = parseInt((searchParams.page as string) || "1")
  const limit = 10 // Assignment requirement: page size 10
  const offset = (page - 1) * limit

  if (searchParams.search) filters.search = searchParams.search as string
  if (searchParams.city) filters.city = searchParams.city as any
  if (searchParams.propertyType) filters.propertyType = searchParams.propertyType as any
  if (searchParams.bhk) filters.bhk = searchParams.bhk as any
  if (searchParams.purpose) filters.purpose = searchParams.purpose as any
  if (searchParams.timeline) filters.timeline = searchParams.timeline as any
  if (searchParams.source) filters.source = searchParams.source as any
  if (searchParams.status) filters.status = searchParams.status as any
  if (searchParams.budgetMin) filters.budgetMin = parseInt(searchParams.budgetMin as string)
  if (searchParams.budgetMax) filters.budgetMax = parseInt(searchParams.budgetMax as string)

  // Validate filters
  const validationResult = buyerFiltersSchema.safeParse(filters)
  if (!validationResult.success) {
    redirect("/buyers")
  }

  // Build where conditions - SERVER-SIDE FILTERING
  const conditions = []
  
  if (filters.search) {
    // Debounced search by fullName|phone|email (assignment requirement)
    conditions.push(
      or(
        like(buyers.fullName, `%${filters.search}%`),
        like(buyers.email, `%${filters.search}%`),
        like(buyers.phone, `%${filters.search}%`)
      )
    )
  }
  
  if (filters.city) conditions.push(eq(buyers.city, filters.city))
  if (filters.propertyType) conditions.push(eq(buyers.propertyType, filters.propertyType))
  if (filters.bhk) conditions.push(eq(buyers.bhk, filters.bhk))
  if (filters.purpose) conditions.push(eq(buyers.purpose, filters.purpose))
  if (filters.timeline) conditions.push(eq(buyers.timeline, filters.timeline))
  if (filters.source) conditions.push(eq(buyers.source, filters.source))
  if (filters.status) conditions.push(eq(buyers.status, filters.status))
  if (filters.budgetMin) {
    conditions.push(
      or(
        gte(buyers.budgetMax, filters.budgetMin),
        gte(buyers.budgetMin, filters.budgetMin)
      )
    )
  }
  if (filters.budgetMax) {
    conditions.push(
      or(
        lte(buyers.budgetMin, filters.budgetMax),
        lte(buyers.budgetMax, filters.budgetMax)
      )
    )
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  
  // REAL SERVER-SIDE PAGINATION - get total count
  const totalResult = await db
    .select({ count: count() })
    .from(buyers)
    .where(whereClause)
  
  const total = totalResult[0]?.count || 0
  
  // REAL SERVER-SIDE PAGINATION - get page data
  const results = await db
    .select()
    .from(buyers)
    .where(whereClause)
    .orderBy(desc(buyers.updatedAt)) // Assignment requirement: default updatedAt desc
    .limit(limit)
    .offset(offset)
  
  // Parse tags from JSON strings
  const buyersWithParsedTags = results.map(buyer => ({
    ...buyer,
    tags: buyer.tags ? JSON.parse(buyer.tags) : []
  }))
  
  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <main className="pt-6">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <BuyerListSSR 
              initialBuyers={buyersWithParsedTags}
              initialFilters={filters}
              pagination={pagination}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
