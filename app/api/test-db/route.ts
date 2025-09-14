import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  try {
    // Test database connection by counting buyers
    console.log("Testing database connection...")
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 30) + "...")
    
    const result = await db.select().from(buyers).limit(1)
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      recordCount: result.length,
      envCheck: {
        databaseUrl: !!process.env.DATABASE_URL,
        runMigrations: process.env.RUN_MIGRATIONS
      }
    })
  } catch (error) {
    console.error("Database connection error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database connection failed",
        envCheck: {
          databaseUrl: !!process.env.DATABASE_URL,
          runMigrations: process.env.RUN_MIGRATIONS
        }
      },
      { status: 500 }
    )
  }
}
