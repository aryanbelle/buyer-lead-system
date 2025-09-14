import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buyers } from "@/lib/db/schema"

const sampleBuyers = [
  {
    id: "sample-1",
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "9876543210",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "3",
    purpose: "Buy",
    budgetMin: 4500000,
    budgetMax: 5500000,
    timeline: "3-6m",
    source: "Website",
    status: "New",
    notes: "Looking for 3BHK apartment in Sector 43",
    tags: '["urgent", "family"]',
    ownerId: "admin-1",
    updatedAt: new Date(),
  },
  {
    id: "sample-2", 
    fullName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "9123456789",
    city: "Mohali",
    propertyType: "Villa",
    bhk: "4",
    purpose: "Buy",
    budgetMin: 8000000,
    budgetMax: 12000000,
    timeline: "0-3m",
    source: "Referral",
    status: "Qualified",
    notes: "Interested in premium villa with garden",
    tags: '["premium", "villa"]',
    ownerId: "admin-1",
    updatedAt: new Date(),
  },
  {
    id: "sample-3",
    fullName: "Amit Singh",
    email: "amit.singh@email.com", 
    phone: "9988776655",
    city: "Panchkula",
    propertyType: "Plot",
    bhk: null,
    purpose: "Buy",
    budgetMin: 2500000,
    budgetMax: 3500000,
    timeline: ">6m",
    source: "Walk-in",
    status: "Contacted",
    notes: "Looking for residential plot",
    tags: '["plot", "investment"]',
    ownerId: "admin-1",
    updatedAt: new Date(),
  }
];

export async function POST() {
  try {
    console.log("Seeding database with sample data...")
    
    // Check if data already exists
    const existingBuyers = await db.select().from(buyers).limit(1);
    if (existingBuyers.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Database already contains data. Seeding skipped."
      });
    }
    
    // Insert sample data
    await db.insert(buyers).values(sampleBuyers);
    
    console.log("Sample data inserted successfully!")
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${sampleBuyers.length} sample buyers`,
      count: sampleBuyers.length
    });
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Seeding failed"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await db.select().from(buyers);
    return NextResponse.json({
      message: "Use POST to seed database",
      currentRecordCount: count.length
    });
  } catch (error) {
    return NextResponse.json({
      message: "Use POST to seed database",
      error: "Could not count records"
    });
  }
}
