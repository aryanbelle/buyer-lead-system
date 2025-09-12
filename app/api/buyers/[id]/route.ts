import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { buyerSchema } from "@/lib/validation"
import { nanoid } from "nanoid"

// GET /api/buyers/[id] - Get single buyer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const buyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, params.id))
      .limit(1)
    
    if (buyer.length === 0) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      )
    }
    
    // Parse tags from JSON string
    const buyerWithParsedTags = {
      ...buyer[0],
      tags: buyer[0].tags ? JSON.parse(buyer[0].tags) : []
    }
    
    return NextResponse.json(buyerWithParsedTags)
  } catch (error) {
    console.error("Error fetching buyer:", error)
    return NextResponse.json(
      { error: "Failed to fetch buyer" },
      { status: 500 }
    )
  }
}

// PUT /api/buyers/[id] - Update buyer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { changedBy, ...updateData } = body
    
    // Validate input
    const validatedData = buyerSchema.parse(updateData)
    
    // Get current buyer for history tracking
    const currentBuyer = await db
      .select()
      .from(buyers)
      .where(eq(buyers.id, params.id))
      .limit(1)
    
    if (currentBuyer.length === 0) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      )
    }
    
    const oldBuyer = currentBuyer[0]
    const now = new Date()
    
    // Update buyer
    const updatedBuyer = {
      ...validatedData,
      tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      updatedAt: now,
    }
    
    await db
      .update(buyers)
      .set(updatedBuyer)
      .where(eq(buyers.id, params.id))
    
    // Track changes in history
    const diff: Record<string, { old: any; new: any }> = {}
    
    Object.keys(validatedData).forEach((key) => {
      const oldValue = key === 'tags' 
        ? (oldBuyer.tags ? JSON.parse(oldBuyer.tags) : [])
        : oldBuyer[key as keyof typeof oldBuyer]
      const newValue = validatedData[key as keyof typeof validatedData]
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = { old: oldValue, new: newValue }
      }
    })
    
    if (Object.keys(diff).length > 0) {
      await db.insert(buyerHistory).values({
        id: nanoid(),
        buyerId: params.id,
        changedBy: changedBy || "system",
        changedAt: now,
        diff: JSON.stringify(diff)
      })
    }
    
    // Return updated buyer with parsed tags
    const result = {
      ...updatedBuyer,
      id: params.id,
      tags: validatedData.tags || []
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating buyer:", error)
    return NextResponse.json(
      { error: "Failed to update buyer" },
      { status: 500 }
    )
  }
}

// DELETE /api/buyers/[id] - Delete buyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db
      .delete(buyers)
      .where(eq(buyers.id, params.id))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting buyer:", error)
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    )
  }
}