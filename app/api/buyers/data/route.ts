import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { buyers } from '@/lib/db/schema'
import { eq, and, or, ilike, gte, lte } from 'drizzle-orm'

export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Build query conditions
    const conditions = [eq(buyers.userId, userId)]
    
    // Add search filter
    const search = searchParams.get('search')
    if (search) {
      conditions.push(
        or(
          ilike(buyers.name, `%${search}%`),
          ilike(buyers.email, `%${search}%`),
          ilike(buyers.phone, `%${search}%`),
          ilike(buyers.company, `%${search}%`)
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

    // Fetch buyers data
    const buyersData = await db
      .select()
      .from(buyers)
      .where(and(...conditions))
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
