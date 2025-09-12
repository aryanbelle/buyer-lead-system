import { db } from "./index"
import { buyers, buyerHistory } from "./schema"
import { nanoid } from "nanoid"

const seedBuyers = [
  {
    id: nanoid(),
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "9876543210",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "2",
    purpose: "Buy",
    budgetMin: 4500000,
    budgetMax: 5500000,
    timeline: "3-6m",
    source: "Website",
    status: "New",
    notes: "Looking for a property near IT Park",
    tags: JSON.stringify(["urgent", "family"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: nanoid(),
    fullName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "9876543211",
    city: "Mohali",
    propertyType: "Villa",
    bhk: "3",
    purpose: "Buy",
    budgetMin: 7000000,
    budgetMax: 9000000,
    timeline: "0-3m",
    source: "Referral",
    status: "Contacted",
    notes: "Prefers Phase 7 location",
    tags: JSON.stringify(["premium", "garden"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: nanoid(),
    fullName: "Amit Patel",
    email: "amit.patel@email.com",
    phone: "9876543212",
    city: "Zirakpur",
    propertyType: "Office",
    purpose: "Rent",
    budgetMin: 50000,
    budgetMax: 80000,
    timeline: "Exploring",
    source: "Call",
    status: "Qualified",
    notes: "Looking for commercial space near highway",
    tags: JSON.stringify(["commercial", "highway"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-17"),
  },
]

export async function seedDatabase() {
  try {
    console.log("Seeding database...")
    
    // Clear existing data
    await db.delete(buyerHistory)
    await db.delete(buyers)
    
    // Insert seed data
    await db.insert(buyers).values(seedBuyers)
    
    // Add initial history entries
    for (const buyer of seedBuyers) {
      await db.insert(buyerHistory).values({
        id: nanoid(),
        buyerId: buyer.id,
        changedBy: buyer.ownerId,
        changedAt: buyer.updatedAt,
        diff: JSON.stringify({ created: { old: null, new: "Buyer created" } })
      })
    }
    
    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0))
}