import { NextRequest, NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyerHistory } from "@/lib/db/schema"

// GET /api/buyers/[id]/history - Get buyer history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const history = await db
      .select()
      .from(buyerHistory)
      .where(eq(buyerHistory.buyerId, params.id))
      .orderBy(desc(buyerHistory.changedAt))
      .limit(10)
    
    // Parse diff from JSON strings
    const historyWithParsedDiff = history.map(record => ({
      ...record,
      diff: JSON.parse(record.diff)
    }))
    
    return NextResponse.json(historyWithParsedDiff)
  } catch (error) {
    console.error("Error fetching buyer history:", error)
    return NextResponse.json(
      { error: "Failed to fetch buyer history" },
      { status: 500 }
    )
  }
}