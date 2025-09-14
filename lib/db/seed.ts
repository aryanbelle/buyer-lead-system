
import { db } from "./index"
import { buyers, buyerHistory } from "./schema"
import { nanoid } from "nanoid"

// Generate large dataset for testing pagination and performance
const firstNames = [
  "Rajesh", "Priya", "Amit", "Sunita", "Vikram", "Meera", "Rohit", "Kavita", "Deepak", "Anjali",
  "Manish", "Neha", "Suresh", "Pooja", "Rakesh", "Divya", "Anil", "Geeta", "Manoj", "Sita",
  "Ravi", "Madhuri", "Ajay", "Kiran", "Vinod", "Shweta", "Ashok", "Rekha", "Sanjay", "Nisha",
  "Yogesh", "Asha", "Naveen", "Sapna", "Dinesh", "Ritu", "Ramesh", "Seema", "Pankaj", "Vandana",
  "Umesh", "Preeti", "Sachin", "Anita", "Nitin", "Shruti", "Gopal", "Kavya", "Raghav", "Jyoti"
]

const lastNames = [
  "Kumar", "Sharma", "Patel", "Gupta", "Singh", "Joshi", "Malhotra", "Agarwal", "Verma", "Kapoor",
  "Bhardwaj", "Shah", "Mehta", "Bansal", "Arora", "Chopra", "Khurana", "Aggarwal", "Sood", "Bhatia",
  "Goel", "Mittal", "Jain", "Sethi", "Khanna", "Tiwari", "Saxena", "Pandey", "Srivastava", "Yadav",
  "Mishra", "Thakur", "Chauhan", "Rajput", "Nair", "Menon", "Pillai", "Reddy", "Rao", "Prasad"
]

const cities = ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]
const propertyTypes = ["Apartment", "Villa", "Plot", "Office", "Retail"]
const bhkOptions = ["1", "2", "3", "4", "Studio"]
const purposes = ["Buy", "Rent"]
const timelines = ["0-3m", "3-6m", ">6m", "Exploring"]
const sources = ["Website", "Referral", "Walk-in", "Call", "Other"]
const statuses = ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]
const owners = ["admin-1", "agent-1"]

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhoneNumber(): string {
  return "9" + Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")
}

function generateBudget(propertyType: string, purpose: string): { min?: number; max?: number } {
  const ranges = {
    Apartment: purpose === "Buy" ? [3000000, 8000000] : [15000, 40000],
    Villa: purpose === "Buy" ? [6000000, 20000000] : [30000, 80000],
    Plot: purpose === "Buy" ? [2000000, 10000000] : [10000, 30000],
    Office: purpose === "Buy" ? [5000000, 50000000] : [40000, 200000],
    Retail: purpose === "Buy" ? [3000000, 30000000] : [30000, 150000]
  }
  
  const [baseMin, baseMax] = ranges[propertyType as keyof typeof ranges] || [1000000, 5000000]
  const min = Math.floor(Math.random() * (baseMax - baseMin) * 0.5 + baseMin)
  const max = Math.floor(Math.random() * (baseMax - min) + min * 1.2)
  
  return { min, max }
}

function generateNotes(fullName: string, propertyType: string, purpose: string): string {
  const templates = [
    `${fullName} is looking for a ${propertyType.toLowerCase()} to ${purpose.toLowerCase()}.`,
    `Interested in ${propertyType.toLowerCase()} with good connectivity.`,
    `${purpose === "Buy" ? "Buying" : "Renting"} ${propertyType.toLowerCase()} for family.`,
    `Needs ${propertyType.toLowerCase()} near good schools and hospitals.`,
    `Looking for ${propertyType.toLowerCase()} in a prime location.`,
    `Prefers ${propertyType.toLowerCase()} with modern amenities.`,
    `${fullName} wants spacious ${propertyType.toLowerCase()}.`,
    `Budget-conscious buyer looking for value for money.`,
    `First-time ${purpose === "Buy" ? "buyer" : "renter"}, needs guidance.`,
    `Urgent requirement for ${propertyType.toLowerCase()}.`
  ]
  return getRandomElement(templates)
}

function generateTags(propertyType: string, purpose: string, status: string): string[] {
  const allTags = [
    "urgent", "family", "premium", "budget", "first-time", "spacious", "modern", "furnished",
    "parking", "garden", "pool", "luxury", "commercial", "residential", "investment",
    "location", "amenities", "connectivity", "schools", "hospitals", "metro", "highway"
  ]
  
  const tagCount = Math.floor(Math.random() * 3) + 1
  const selectedTags = []
  
  for (let i = 0; i < tagCount; i++) {
    const tag = getRandomElement(allTags)
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag)
    }
  }
  
  return selectedTags
}

function generateBuyerData(index: number): any {
  const firstName = getRandomElement(firstNames)
  const lastName = getRandomElement(lastNames)
  const fullName = `${firstName} ${lastName}`
  const propertyType = getRandomElement(propertyTypes)
  const purpose = getRandomElement(purposes)
  const city = getRandomElement(cities)
  const timeline = getRandomElement(timelines)
  const source = getRandomElement(sources)
  const status = getRandomElement(statuses)
  const owner = getRandomElement(owners)
  
  const email = Math.random() > 0.2 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com` : null
  const phone = generatePhoneNumber()
  const bhk = ["Apartment", "Villa"].includes(propertyType) ? getRandomElement(bhkOptions) : null
  const budget = generateBudget(propertyType, purpose)
  const notes = generateNotes(fullName, propertyType, purpose)
  const tags = generateTags(propertyType, purpose, status)
  
  // Generate dates over the last 6 months
  const baseDate = new Date()
  baseDate.setMonth(baseDate.getMonth() - 6)
  const updatedAt = new Date(baseDate.getTime() + Math.random() * (Date.now() - baseDate.getTime()))
  
  return {
    id: nanoid(),
    fullName,
    email,
    phone,
    city,
    propertyType,
    bhk,
    purpose,
    budgetMin: budget.min,
    budgetMax: budget.max,
    timeline,
    source,
    status,
    notes,
    tags: JSON.stringify(tags),
    ownerId: owner,
    updatedAt
  }
}

// Generate 250 buyer records for testing
const seedBuyers = Array.from({ length: 250 }, (_, index) => generateBuyerData(index))

// Original manual entries for reference (not used in seeding)
/* const originalEntries = [
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
  {
    id: nanoid(),
    fullName: "Sunita Gupta",
    email: "sunita.gupta@email.com",
    phone: "9876543213",
    city: "Panchkula",
    propertyType: "Apartment",
    bhk: "1",
    purpose: "Rent",
    budgetMin: 15000,
    budgetMax: 25000,
    timeline: "0-3m",
    source: "Website",
    status: "New",
    notes: "First-time renter, needs furnished apartment",
    tags: JSON.stringify(["furnished", "first-time"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: nanoid(),
    fullName: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "9876543214",
    city: "Chandigarh",
    propertyType: "Villa",
    bhk: "4",
    purpose: "Buy",
    budgetMin: 12000000,
    budgetMax: 15000000,
    timeline: ">6m",
    source: "Referral",
    status: "Visited",
    notes: "Looking for luxury villa with swimming pool",
    tags: JSON.stringify(["luxury", "pool", "spacious"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: nanoid(),
    fullName: "Meera Joshi",
    email: "meera.joshi@email.com",
    phone: "9876543215",
    city: "Mohali",
    propertyType: "Plot",
    purpose: "Buy",
    budgetMin: 3000000,
    budgetMax: 4000000,
    timeline: "3-6m",
    source: "Walk-in",
    status: "Negotiation",
    notes: "Wants to build custom home",
    tags: JSON.stringify(["plot", "construction"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: nanoid(),
    fullName: "Rohit Malhotra",
    email: "rohit.malhotra@email.com",
    phone: "9876543216",
    city: "Zirakpur",
    propertyType: "Apartment",
    bhk: "3",
    purpose: "Buy",
    budgetMin: 6000000,
    budgetMax: 7500000,
    timeline: "0-3m",
    source: "Website",
    status: "Qualified",
    notes: "Needs parking for 2 cars",
    tags: JSON.stringify(["parking", "urgent"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-21"),
  },
  {
    id: nanoid(),
    fullName: "Kavita Agarwal",
    email: "kavita.agarwal@email.com",
    phone: "9876543217",
    city: "Other",
    propertyType: "Retail",
    purpose: "Rent",
    budgetMin: 80000,
    budgetMax: 120000,
    timeline: "Exploring",
    source: "Call",
    status: "New",
    notes: "Looking for retail space for clothing store",
    tags: JSON.stringify(["retail", "clothing", "business"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-22"),
  },
  {
    id: nanoid(),
    fullName: "Deepak Verma",
    email: "deepak.verma@email.com",
    phone: "9876543218",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "2",
    purpose: "Rent",
    budgetMin: 20000,
    budgetMax: 30000,
    timeline: "0-3m",
    source: "Referral",
    status: "Contacted",
    notes: "Young professional, prefers modern amenities",
    tags: JSON.stringify(["modern", "amenities", "professional"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-23"),
  },
  {
    id: nanoid(),
    fullName: "Anjali Kapoor",
    email: "anjali.kapoor@email.com",
    phone: "9876543219",
    city: "Panchkula",
    propertyType: "Villa",
    bhk: "3",
    purpose: "Buy",
    budgetMin: 8500000,
    budgetMax: 10000000,
    timeline: "3-6m",
    source: "Website",
    status: "Converted",
    notes: "Successfully purchased villa in Sector 5",
    tags: JSON.stringify(["converted", "satisfied"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-24"),
  },
  {
    id: nanoid(),
    fullName: "Manish Bhardwaj",
    email: "manish.bhardwaj@email.com",
    phone: "9876543220",
    city: "Mohali",
    propertyType: "Office",
    purpose: "Buy",
    budgetMin: 5000000,
    budgetMax: 7000000,
    timeline: ">6m",
    source: "Walk-in",
    status: "Dropped",
    notes: "Budget constraints, looking for smaller office",
    tags: JSON.stringify(["budget-issue", "small-office"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: nanoid(),
    fullName: "Sonia Reddy",
    email: "sonia.reddy@email.com",
    phone: "9876543221",
    city: "Zirakpur",
    propertyType: "Apartment",
    bhk: "1",
    purpose: "Buy",
    budgetMin: 2500000,
    budgetMax: 3200000,
    timeline: "0-3m",
    source: "Website",
    status: "Visited",
    notes: "First-time buyer, needs guidance",
    tags: JSON.stringify(["first-time", "guidance"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-26"),
  },
  {
    id: nanoid(),
    fullName: "Arjun Sethi",
    email: "arjun.sethi@email.com",
    phone: "9876543222",
    city: "Chandigarh",
    propertyType: "Plot",
    purpose: "Buy",
    budgetMin: 4500000,
    budgetMax: 6000000,
    timeline: "Exploring",
    source: "Referral",
    status: "New",
    notes: "Interested in corner plot for better access",
    tags: JSON.stringify(["corner-plot", "access"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-27"),
  },
  {
    id: nanoid(),
    fullName: "Pooja Bansal",
    email: "pooja.bansal@email.com",
    phone: "9876543223",
    city: "Panchkula",
    propertyType: "Apartment",
    bhk: "Studio",
    purpose: "Rent",
    budgetMin: 12000,
    budgetMax: 18000,
    timeline: "0-3m",
    source: "Call",
    status: "Qualified",
    notes: "Student accommodation near university",
    tags: JSON.stringify(["student", "university", "budget"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-28"),
  },
  {
    id: nanoid(),
    fullName: "Ravi Chopra",
    email: "ravi.chopra@email.com",
    phone: "9876543224",
    city: "Mohali",
    propertyType: "Villa",
    bhk: "4",
    purpose: "Rent",
    budgetMin: 60000,
    budgetMax: 80000,
    timeline: "3-6m",
    source: "Website",
    status: "Negotiation",
    notes: "Corporate executive, needs furnished villa",
    tags: JSON.stringify(["corporate", "furnished", "executive"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-29"),
  },
  {
    id: nanoid(),
    fullName: "Neha Sood",
    email: "neha.sood@email.com",
    phone: "9876543225",
    city: "Other",
    propertyType: "Retail",
    purpose: "Buy",
    budgetMin: 8000000,
    budgetMax: 12000000,
    timeline: ">6m",
    source: "Walk-in",
    status: "Contacted",
    notes: "Planning to open restaurant chain",
    tags: JSON.stringify(["restaurant", "chain", "business"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-01-30"),
  },
  {
    id: nanoid(),
    fullName: "Gaurav Mittal",
    email: "gaurav.mittal@email.com",
    phone: "9876543226",
    city: "Zirakpur",
    propertyType: "Apartment",
    bhk: "2",
    purpose: "Buy",
    budgetMin: 3800000,
    budgetMax: 4500000,
    timeline: "0-3m",
    source: "Referral",
    status: "Visited",
    notes: "Newlywed couple, first home purchase",
    tags: JSON.stringify(["newlywed", "first-home", "couple"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-01-31"),
  },
  {
    id: nanoid(),
    fullName: "Simran Kaur",
    email: "simran.kaur@email.com",
    phone: "9876543227",
    city: "Chandigarh",
    propertyType: "Office",
    purpose: "Rent",
    budgetMin: 40000,
    budgetMax: 60000,
    timeline: "0-3m",
    source: "Website",
    status: "New",
    notes: "IT startup, needs modern office space",
    tags: JSON.stringify(["startup", "IT", "modern"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: nanoid(),
    fullName: "Harpreet Gill",
    email: "harpreet.gill@email.com",
    phone: "9876543228",
    city: "Panchkula",
    propertyType: "Villa",
    bhk: "3",
    purpose: "Buy",
    budgetMin: 9000000,
    budgetMax: 11000000,
    timeline: "3-6m",
    source: "Call",
    status: "Qualified",
    notes: "Retired couple, wants peaceful location",
    tags: JSON.stringify(["retired", "peaceful", "couple"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-02-02"),
  },
  {
    id: nanoid(),
    fullName: "Tarun Aggarwal",
    email: "tarun.aggarwal@email.com",
    phone: "9876543229",
    city: "Mohali",
    propertyType: "Plot",
    purpose: "Buy",
    budgetMin: 2800000,
    budgetMax: 3500000,
    timeline: "Exploring",
    source: "Referral",
    status: "Contacted",
    notes: "Investment purpose, good location preferred",
    tags: JSON.stringify(["investment", "location", "future"]),
    ownerId: "agent-1",
    updatedAt: new Date("2024-02-03"),
  },
  {
    id: nanoid(),
    fullName: "Divya Malhotra",
    email: "divya.malhotra@email.com",
    phone: "9876543230",
    city: "Other",
    propertyType: "Apartment",
    bhk: "3",
    purpose: "Rent",
    budgetMin: 35000,
    budgetMax: 45000,
    timeline: "0-3m",
    source: "Website",
    status: "Converted",
    notes: "Successfully rented 3BHK in Sector 22",
    tags: JSON.stringify(["converted", "family", "satisfied"]),
    ownerId: "admin-1",
    updatedAt: new Date("2024-02-04"),
  },
]
*/

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