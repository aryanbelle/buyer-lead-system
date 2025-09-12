import { NextRequest, NextResponse } from "next/server"
import { eq, desc, and, or, like, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { buyerApiSchema } from "@/lib/validation"
import { nanoid } from "nanoid"

// GET /api/buyers - List buyers with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    
    // Filters
    const search = searchParams.get("search")
    const city = searchParams.get("city")
    const propertyType = searchParams.get("propertyType")
    const bhk = searchParams.get("bhk")
    const purpose = searchParams.get("purpose")
    const timeline = searchParams.get("timeline")
    const source = searchParams.get("source")
    const status = searchParams.get("status")
    const budgetMin = searchParams.get("budgetMin")
    const budgetMax = searchParams.get("budgetMax")
    
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
    if (budgetMin) conditions.push(gte(buyers.budgetMin, parseInt(budgetMin)))
    if (budgetMax) conditions.push(lte(buyers.budgetMax, parseInt(budgetMax)))
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // Get total count
    const totalResult = await db
      .select({ count: buyers.id })
      .from(buyers)
      .where(whereClause)
    
    const total = totalResult.length
    
    // Get paginated results
    const results = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .orderBy(desc(buyers.updatedAt))
      .limit(limit)
      .offset(offset)
    
    // Parse tags from JSON strings
    const buyersWithParsedTags = results.map(buyer => ({
      ...buyer,
      tags: buyer.tags ? JSON.parse(buyer.tags) : []
    }))
    
    return NextResponse.json({
      buyers: buyersWithParsedTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching buyers:", error)
    return NextResponse.json(
      { error: "Failed to fetch buyers" },
      { status: 500 }
    )
  }
}

// POST /api/buyers - Create new buyer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = buyerApiSchema.parse(body)
    
    // Create buyer
    const buyerId = nanoid()
    const now = new Date()
    
    const newBuyer = {
      id: buyerId,
      ...validatedData,
      email: validatedData.email || null,
      bhk: validatedData.bhk || null,
      budgetMin: validatedData.budgetMin || null,
      budgetMax: validatedData.budgetMax || null,
      notes: validatedData.notes || null,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      updatedAt: now,
    }
    
    await db.insert(buyers).values(newBuyer)
    
    // Add to history
    await db.insert(buyerHistory).values({
      id: nanoid(),
      buyerId,
      changedBy: validatedData.ownerId,
      changedAt: now,
      diff: JSON.stringify({ created: { old: null, new: "Buyer created" } })
    })
    
    // Return created buyer with parsed tags
    const createdBuyer = {
      ...newBuyer,
      tags: validatedData.tags || []
    }
    
    return NextResponse.json(createdBuyer, { status: 201 })
  } catch (error) {
    console.error("Error creating buyer:", error)
    return NextResponse.json(
      { error: "Failed to create buyer" },
      { status: 500 }
    )
  }
}