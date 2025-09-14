import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buyers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    console.log('CSV export requested')
    
    // Fetch all buyers from database
    const buyersData = await db
      .select()
      .from(buyers)
      .orderBy(desc(buyers.updatedAt))
      .limit(500) // Limit for performance
    
    console.log(`Found ${buyersData.length} buyers`)
    
    // Generate CSV headers
    const headers = [
      'Full Name',
      'Email', 
      'Phone',
      'City',
      'Property Type',
      'BHK',
      'Purpose',
      'Budget Min',
      'Budget Max',
      'Timeline',
      'Source',
      'Status',
      'Notes',
      'Updated Date'
    ]
    
    // Start CSV content
    let csvContent = headers.join(',') + '\n'
    
    // Add data rows
    buyersData.forEach(buyer => {
      const cleanValue = (value: any): string => {
        if (value === null || value === undefined) return ''
        return `"${String(value).replace(/"/g, '""')}"`
      }
      
      const row = [
        cleanValue(buyer.fullName),
        cleanValue(buyer.email),
        cleanValue(buyer.phone),
        cleanValue(buyer.city),
        cleanValue(buyer.propertyType),
        cleanValue(buyer.bhk),
        cleanValue(buyer.purpose),
        cleanValue(buyer.budgetMin),
        cleanValue(buyer.budgetMax),
        cleanValue(buyer.timeline),
        cleanValue(buyer.source),
        cleanValue(buyer.status),
        cleanValue(buyer.notes),
        cleanValue(buyer.updatedAt ? new Date(buyer.updatedAt).toLocaleDateString() : '')
      ]
      
      csvContent += row.join(',') + '\n'
    })
    
    console.log(`Generated CSV content, length: ${csvContent.length}`)
    
    // Return CSV as downloadable file
    const response = new NextResponse(csvContent)
    
    response.headers.set('Content-Type', 'text/csv; charset=utf-8')
    response.headers.set('Content-Disposition', `attachment; filename="buyers-export-${new Date().toISOString().split('T')[0]}.csv"`)
    response.headers.set('Cache-Control', 'no-cache')
    
    return response
    
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
