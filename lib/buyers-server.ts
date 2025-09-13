import { eq, desc, and, or, like, gte, lte, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import type { BuyerFilters, Buyer } from "@/lib/types"

export interface BuyersPaginationResult {
  buyers: Buyer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function getBuyersServer(
  searchParams: Record<string, string | string[] | undefined>
): Promise<BuyersPaginationResult> {
  try {
    // Parse pagination params
    const pageParam = searchParams.page
    const page = parseInt(typeof pageParam === 'string' ? pageParam : '1')
    console.log('SERVER: Parsing page from searchParams:', { pageParam, page, allParams: searchParams })
    const limit = 10 // Fixed page size as per requirement
    const offset = (page - 1) * limit
    
    // Parse filter params
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const city = typeof searchParams.city === 'string' ? searchParams.city : undefined
    const propertyType = typeof searchParams.propertyType === 'string' ? searchParams.propertyType : undefined
    const bhk = typeof searchParams.bhk === 'string' ? searchParams.bhk : undefined
    const purpose = typeof searchParams.purpose === 'string' ? searchParams.purpose : undefined
    const timeline = typeof searchParams.timeline === 'string' ? searchParams.timeline : undefined
    const source = typeof searchParams.source === 'string' ? searchParams.source : undefined
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
    const budgetMin = typeof searchParams.budgetMin === 'string' ? parseInt(searchParams.budgetMin) : undefined
    const budgetMax = typeof searchParams.budgetMax === 'string' ? parseInt(searchParams.budgetMax) : undefined
    
    // Build where conditions
    const conditions = []
    
    if (search) {
      conditions.push(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.email, `%${search}%`),
          like(buyers.phone, `%${search}%`)
        )
      )
    }
    
    if (city) conditions.push(eq(buyers.city, city))
    if (propertyType) conditions.push(eq(buyers.propertyType, propertyType))
    if (bhk) conditions.push(eq(buyers.bhk, bhk))
    if (purpose) conditions.push(eq(buyers.purpose, purpose))
    if (timeline) conditions.push(eq(buyers.timeline, timeline))
    if (source) conditions.push(eq(buyers.source, source))
    if (status) conditions.push(eq(buyers.status, status))
    
    // Budget filters
    if (budgetMin && !isNaN(budgetMin)) {
      conditions.push(
        or(
          gte(buyers.budgetMax, budgetMin),
          gte(buyers.budgetMin, budgetMin)
        )
      )
    }
    if (budgetMax && !isNaN(budgetMax)) {
      conditions.push(
        or(
          lte(buyers.budgetMin, budgetMax),
          lte(buyers.budgetMax, budgetMax)
        )
      )
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(buyers)
      .where(whereClause)
    
    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)
    
    // Get paginated results
    const results = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .orderBy(desc(buyers.updatedAt))
      .limit(limit)
      .offset(offset)
    
    // Parse tags from JSON strings
    const buyersWithParsedTags: Buyer[] = results.map(buyer => ({
      ...buyer,
      tags: buyer.tags ? JSON.parse(buyer.tags) : []
    }))
    
    return {
      buyers: buyersWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  } catch (error) {
    console.error("Error fetching buyers server-side:", error)
    return {
      buyers: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    }
  }
}

export function getFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): BuyerFilters {
  const filters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    propertyType: typeof searchParams.propertyType === 'string' ? searchParams.propertyType : undefined,
    bhk: typeof searchParams.bhk === 'string' ? searchParams.bhk : undefined,
    purpose: typeof searchParams.purpose === 'string' ? searchParams.purpose : undefined,
    timeline: typeof searchParams.timeline === 'string' ? searchParams.timeline : undefined,
    source: typeof searchParams.source === 'string' ? searchParams.source : undefined,
    status: typeof searchParams.status === 'string' ? searchParams.status : undefined,
    budgetMin: typeof searchParams.budgetMin === 'string' ? parseInt(searchParams.budgetMin) : undefined,
    budgetMax: typeof searchParams.budgetMax === 'string' ? parseInt(searchParams.budgetMax) : undefined,
  }
  return filters
}
