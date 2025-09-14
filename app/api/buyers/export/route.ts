import { NextRequest, NextResponse } from "next/server"
import { eq, desc, and, or, like, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"

// GET /api/buyers/export - Export filtered buyers as CSV
export async function GET(request: NextRequest) {
  try {
    console.log("Starting CSV export...");
    
    // Simple query - get all buyers without complex filtering for now
    const results = await db
      .select({
        fullName: buyers.fullName,
        email: buyers.email,
        phone: buyers.phone,
        city: buyers.city,
        propertyType: buyers.propertyType,
        bhk: buyers.bhk,
        purpose: buyers.purpose,
        budgetMin: buyers.budgetMin,
        budgetMax: buyers.budgetMax,
        timeline: buyers.timeline,
        source: buyers.source,
        notes: buyers.notes,
        tags: buyers.tags,
        status: buyers.status
      })
      .from(buyers)
      .limit(500) // Keep it small for reliability
    
    console.log(`Found ${results.length} buyers for export`);
    
    // Simple CSV generation
    const header = 'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status';
    const rows = results.map(buyer => {
      const cleanValue = (value: any) => {
        if (value === null || value === undefined) return '';
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      };
      
      // Parse tags safely
      let parsedTags = '';
      if (buyer.tags) {
        try {
          const tagArray = JSON.parse(buyer.tags);
          parsedTags = Array.isArray(tagArray) ? tagArray.join(';') : '';
        } catch (e) {
          parsedTags = '';
        }
      }
      
      return [
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
        cleanValue(buyer.notes),
        cleanValue(parsedTags),
        cleanValue(buyer.status)
      ].join(',');
    });
    
    const csv = [header, ...rows].join('\n');
    console.log("CSV generated successfully");
    
    // Return with simple headers
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="buyers-export.csv"'
      }
    })
  } catch (error) {
    console.error("Error exporting buyers:", error)
    
    return new Response(
      JSON.stringify({
        error: "Failed to export buyers",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
