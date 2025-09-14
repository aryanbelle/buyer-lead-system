import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buyers } from '@/lib/db/schema'
import { eq, and, or, like, gte, lte } from 'drizzle-orm'

export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query conditions (no auth filtering like other APIs)
    const conditions = []
    
    // Add search filter
    const search = searchParams.get('search')
    if (search) {
      conditions.push(
        or(
          like(buyers.fullName, `%${search}%`),
          like(buyers.email, `%${search}%`),
          like(buyers.phone, `%${search}%`),
          like(buyers.notes, `%${search}%`)
        )
      )
    }
    
    // Add status filter
    const status = searchParams.get('status')
    if (status && status !== 'all') {
      conditions.push(eq(buyers.status, status))
    }
    
    // Add date range filter
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom) {
      conditions.push(gte(buyers.createdAt, new Date(dateFrom)))
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      conditions.push(lte(buyers.createdAt, toDate))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Fetch buyers data
    const buyersData = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .limit(1000) // Reasonable limit
      .orderBy(buyers.createdAt)

    return NextResponse.json({
      success: true,
      data: buyersData,
      count: buyersData.length
    })

  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
