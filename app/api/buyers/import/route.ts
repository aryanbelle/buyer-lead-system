import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buyers, buyerHistory } from "@/lib/db/schema"
import { buyerApiSchema } from "@/lib/validation"
import { nanoid } from "nanoid"

// POST /api/buyers/import - Import buyers from CSV data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data: buyersData, userId } = body

    if (!Array.isArray(buyersData) || buyersData.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Limit to 200 rows as per assignment
    if (buyersData.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 rows allowed" },
        { status: 400 }
      )
    }

    const validationResults = []
    const validBuyers = []
    const errors = []

    // Validate each row
    for (let i = 0; i < buyersData.length; i++) {
      const rowData = {
        ...buyersData[i],
        ownerId: userId,
        status: "New",
      }

      try {
        const validatedData = buyerApiSchema.parse(rowData)
        validBuyers.push({
          ...validatedData,
          id: nanoid(),
          email: validatedData.email && validatedData.email.trim() !== "" ? validatedData.email : null,
          bhk: validatedData.bhk || null,
          budgetMin: validatedData.budgetMin || null,
          budgetMax: validatedData.budgetMax || null,
          notes: validatedData.notes && validatedData.notes.trim() !== "" ? validatedData.notes : null,
          tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
          updatedAt: new Date(),
        })
        validationResults.push({ row: i + 1, valid: true })
      } catch (error: any) {
        const errorMessage = error?.errors?.map((e: any) => e.message).join(", ") || "Invalid data"
        errors.push(`Row ${i + 1}: ${errorMessage}`)
        validationResults.push({ row: i + 1, valid: false, error: errorMessage })
      }
    }

    // If there are validation errors, return them without inserting data
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        validRows: validBuyers.length,
        totalRows: buyersData.length,
        results: validationResults
      })
    }

    // Insert valid buyers in a transaction
    const now = new Date()
    
    try {
      // Insert all valid buyers
      if (validBuyers.length > 0) {
        await db.insert(buyers).values(validBuyers)
        
        // Add history entries for all imported buyers
        const historyEntries = validBuyers.map(buyer => ({
          id: nanoid(),
          buyerId: buyer.id,
          changedBy: userId,
          changedAt: now,
          diff: JSON.stringify({ imported: { old: null, new: "Buyer imported from CSV" } })
        }))
        
        await db.insert(buyerHistory).values(historyEntries)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${validBuyers.length} buyers`,
        validRows: validBuyers.length,
        totalRows: buyersData.length,
        results: validationResults
      })
    } catch (dbError) {
      console.error("Database error during import:", dbError)
      return NextResponse.json(
        { error: "Failed to save buyers to database" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error importing buyers:", error)
    return NextResponse.json(
      { error: "Failed to import buyers" },
      { status: 500 }
    )
  }
}
