import { NextRequest, NextResponse } from "next/server"
import { eq, desc, and, or, like, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"

// GET /api/buyers/export - Export filtered buyers as CSV
export async function GET(request: NextRequest) {
  try {
    // For Vercel serverless - handle URL construction properly
    const url = new URL(request.url)
    const { searchParams } = url
    
    // Get the same filters as the main buyers list
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
    
    // Build where conditions (same logic as main buyers API)
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
    
    if (budgetMin) {
      conditions.push(
        or(
          gte(buyers.budgetMax, parseInt(budgetMin)),
          gte(buyers.budgetMin, parseInt(budgetMin))
        )
      )
    }
    if (budgetMax) {
      conditions.push(
        or(
          lte(buyers.budgetMin, parseInt(budgetMax)),
          lte(buyers.budgetMax, parseInt(budgetMax))
        )
      )
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    
    // Get all matching results (limited to 1000 for Vercel performance)
    const results = await db
      .select()
      .from(buyers)
      .where(whereClause)
      .orderBy(desc(buyers.updatedAt))
      .limit(1000) // Prevent timeout on large datasets
    
    // Parse tags from JSON strings and format for CSV
    const buyersForExport = results.map(buyer => ({
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || "",
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || "",
      budgetMax: buyer.budgetMax || "",
      timeline: buyer.timeline,
      source: buyer.source,
      notes: buyer.notes || "",
      tags: buyer.tags ? JSON.parse(buyer.tags).join(", ") : "",
      status: buyer.status,
    }))
    
    // Generate CSV content
    const csvHeader = "fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status"
    const csvRows = buyersForExport.map(buyer => [
      `"${(buyer.fullName || "").replace(/"/g, '""')}"`,
      `"${(buyer.email || "").replace(/"/g, '""')}"`,
      `"${(buyer.phone || "").replace(/"/g, '""')}"`,
      `"${(buyer.city || "").replace(/"/g, '""')}"`,
      `"${(buyer.propertyType || "").replace(/"/g, '""')}"`,
      `"${(buyer.bhk || "").replace(/"/g, '""')}"`,
      `"${(buyer.purpose || "").replace(/"/g, '""')}"`,
      `"${(buyer.budgetMin || "").toString().replace(/"/g, '""')}"`,
      `"${(buyer.budgetMax || "").toString().replace(/"/g, '""')}"`,
      `"${(buyer.timeline || "").replace(/"/g, '""')}"`,
      `"${(buyer.source || "").replace(/"/g, '""')}"`,
      `"${(buyer.notes || "").replace(/"/g, '""')}"`,
      `"${(buyer.tags || "").replace(/"/g, '""')}"`,
      `"${(buyer.status || "").replace(/"/g, '""')}"`,
    ].join(","))
    
    const csvContent = [csvHeader, ...csvRows].join("\n")
    
    // Return CSV content with appropriate headers for Vercel
    const fileName = `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Error exporting buyers:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "Unknown error")
    
    return NextResponse.json(
      { 
        error: "Failed to export buyers",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
