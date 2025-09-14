import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"
import { isNotNull } from "drizzle-orm"

// GET /api/buyers/tags - Get all unique tags for typeahead
export async function GET(request: NextRequest) {
  try {
    // Get all buyers with non-null tags
    const results = await db
      .select({ tags: buyers.tags })
      .from(buyers)
      .where(isNotNull(buyers.tags))

    // Extract and flatten all tags
    const allTags = new Set<string>()
    
    results.forEach(result => {
      if (result.tags) {
        try {
          const tagsArray = JSON.parse(result.tags) as string[]
          tagsArray.forEach(tag => {
            if (tag && tag.trim()) {
              allTags.add(tag.trim())
            }
          })
        } catch (error) {
          // Skip invalid JSON entries
          console.warn("Invalid JSON in tags field:", result.tags)
        }
      }
    })

    // Convert to sorted array
    const uniqueTags = Array.from(allTags)
      .filter(tag => tag.length > 0)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

    return NextResponse.json({ tags: uniqueTags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    )
  }
}
