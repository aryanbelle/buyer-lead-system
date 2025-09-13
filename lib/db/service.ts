import { eq, desc, and, or, like, gte, lte, count } from "drizzle-orm"
import { db } from "./index"
import { buyers, buyerHistory } from "./schema"
import type { BuyerFilters } from "../types"
import { nanoid } from "nanoid"

export interface PaginationParams {
  page: number
  limit: number
}

export interface BuyerWithTags {
  id: string
  fullName: string
  email?: string | null
  phone: string
  city: string
  propertyType: string
  bhk?: string | null
  purpose: string
  budgetMin?: number | null
  budgetMax?: number | null
  timeline: string
  source: string
  status: string
  notes?: string | null
  tags?: string[]
  ownerId: string
  updatedAt: Date
}

export interface BuyerHistoryWithDiff {
  id: string
  buyerId: string
  changedBy: string
  changedAt: Date
  diff: Record<string, { old: any; new: any }>
}

// Get buyers with filtering and pagination
export async function getBuyersFromDB(
  filters: BuyerFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ buyers: BuyerWithTags[]; total: number }> {
  const { page, limit } = pagination
  const offset = (page - 1) * limit
  
  // Build where conditions
  const conditions = []
  
  if (filters.search) {
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
  if (filters.budgetMin) conditions.push(gte(buyers.budgetMin, filters.budgetMin))
  if (filters.budgetMax) conditions.push(lte(buyers.budgetMax, filters.budgetMax))
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  
  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(buyers)
    .where(whereClause)
  
  const total = countResult[0]?.count || 0
  
  // Get paginated results
  const results = await db
    .select()
    .from(buyers)
    .where(whereClause)
    .orderBy(desc(buyers.updatedAt))
    .limit(limit)
    .offset(offset)
  
  // Parse tags from JSON strings
  const buyersWithParsedTags: BuyerWithTags[] = results.map(buyer => ({
    ...buyer,
    tags: buyer.tags ? JSON.parse(buyer.tags) : []
  }))
  
  return { buyers: buyersWithParsedTags, total }
}

// Get single buyer by ID
export async function getBuyerByIdFromDB(id: string): Promise<BuyerWithTags | null> {
  const result = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, id))
    .limit(1)
  
  if (result.length === 0) return null
  
  return {
    ...result[0],
    tags: result[0].tags ? JSON.parse(result[0].tags) : []
  }
}

// Create new buyer
export async function createBuyerInDB(buyerData: Omit<BuyerWithTags, "id" | "updatedAt">): Promise<BuyerWithTags> {
  const id = nanoid()
  const now = new Date()
  
  const newBuyer = {
    id,
    ...buyerData,
    tags: buyerData.tags ? JSON.stringify(buyerData.tags) : null,
    updatedAt: now,
  }
  
  await db.insert(buyers).values(newBuyer)
  
  // Add to history
  await db.insert(buyerHistory).values({
    id: nanoid(),
    buyerId: id,
    changedBy: buyerData.ownerId,
    changedAt: now,
    diff: JSON.stringify({ created: { old: null, new: "Buyer created" } })
  })
  
  return {
    ...newBuyer,
    tags: buyerData.tags || []
  }
}

// Update buyer
export async function updateBuyerInDB(
  id: string, 
  updateData: Partial<BuyerWithTags>, 
  changedBy: string
): Promise<BuyerWithTags | null> {
  // Get current buyer for history tracking
  const currentBuyer = await getBuyerByIdFromDB(id)
  if (!currentBuyer) return null
  
  const now = new Date()
  
  // Update buyer
  const updatedBuyer = {
    ...updateData,
    tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
    updatedAt: now,
  }
  
  await db
    .update(buyers)
    .set(updatedBuyer)
    .where(eq(buyers.id, id))
  
  // Track changes in history
  const diff: Record<string, { old: any; new: any }> = {}
  
  Object.keys(updateData).forEach((key) => {
    if (key === 'updatedAt') return
    
    const oldValue = currentBuyer[key as keyof BuyerWithTags]
    const newValue = updateData[key as keyof BuyerWithTags]
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff[key] = { old: oldValue, new: newValue }
    }
  })
  
  if (Object.keys(diff).length > 0) {
    await db.insert(buyerHistory).values({
      id: nanoid(),
      buyerId: id,
      changedBy,
      changedAt: now,
      diff: JSON.stringify(diff)
    })
  }
  
  // Return updated buyer
  return getBuyerByIdFromDB(id)
}

// Delete buyer
export async function deleteBuyerFromDB(id: string): Promise<boolean> {
  const result = await db
    .delete(buyers)
    .where(eq(buyers.id, id))
  
  return true
}

// Get buyer history
export async function getBuyerHistoryFromDB(buyerId: string): Promise<BuyerHistoryWithDiff[]> {
  const history = await db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, buyerId))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(10)
  
  return history.map(record => ({
    ...record,
    diff: JSON.parse(record.diff)
  }))
}