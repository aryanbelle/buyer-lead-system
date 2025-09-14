import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables first (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';

// Database connection (works for both Vercel Postgres and Supabase)
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!;
console.log('Using database:', connectionString ? 'Connected' : 'No connection string found');

// Debug connection string (without password)
console.log('DATABASE_URL configured:', connectionString?.replace(/:[^:@]*@/, ':***@'));

// Configure postgres client for serverless environments with enhanced connectivity
const client = postgres(connectionString, {
  max: 1, // Limit connections in serverless
  idle_timeout: 20,
  connect_timeout: 30, // Increased timeout
  prepare: false, // Disable prepared statements for serverless
  transform: {
    undefined: null,
  },
  connection: {
    application_name: 'buyer-lead-app-vercel',
  },
});

export const db = drizzle(client, { schema });

// Auto-create tables if they don't exist
const ensureTablesExist = async () => {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS "buyer_history" (
      "id" text PRIMARY KEY NOT NULL,
      "buyer_id" text NOT NULL,
      "changed_by" text NOT NULL,
      "changed_at" timestamp DEFAULT now() NOT NULL,
      "diff" text NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS "buyers" (
      "id" text PRIMARY KEY NOT NULL,
      "full_name" text NOT NULL,
      "email" text,
      "phone" text NOT NULL,
      "city" text NOT NULL,
      "property_type" text NOT NULL,
      "bhk" text,
      "purpose" text NOT NULL,
      "budget_min" integer,
      "budget_max" integer,
      "timeline" text NOT NULL,
      "source" text NOT NULL,
      "status" text DEFAULT 'New' NOT NULL,
      "notes" text,
      "tags" text,
      "owner_id" text NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    
    ALTER TABLE "buyer_history" DROP CONSTRAINT IF EXISTS "buyer_history_buyer_id_buyers_id_fk";
    ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyer_id_buyers_id_fk" 
      FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
  `;
  
  try {
    await client.unsafe(createTablesSQL);
    console.log('Tables ensured to exist');
  } catch (error) {
    console.log('Table creation error (might already exist):', error);
  }
};

// Sample data for seeding
const sampleBuyers = [
  {
    id: 'buyer-1',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '3',
    purpose: 'Buy',
    budgetMin: 4500000,
    budgetMax: 5500000,
    timeline: '3-6m',
    source: 'Website',
    status: 'New',
    notes: 'Looking for 3BHK apartment in Sector 43',
    tags: 'urgent,family',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-2',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '9123456789',
    city: 'Mohali',
    propertyType: 'Villa',
    bhk: '4',
    purpose: 'Buy',
    budgetMin: 8000000,
    budgetMax: 12000000,
    timeline: '0-3m',
    source: 'Referral',
    status: 'Qualified',
    notes: 'Interested in premium villa with garden',
    tags: 'premium,luxury',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-3',
    fullName: 'Amit Singh',
    email: 'amit.singh@email.com',
    phone: '9988776655',
    city: 'Panchkula',
    propertyType: 'Plot',
    bhk: null,
    purpose: 'Buy',
    budgetMin: 2500000,
    budgetMax: 3500000,
    timeline: '>6m',
    source: 'Walk-in',
    status: 'Contacted',
    notes: 'Looking for residential plot for future construction',
    tags: 'investment,future',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-4',
    fullName: 'Sunita Verma',
    email: 'sunita.verma@yahoo.com',
    phone: '9234567890',
    city: 'Zirakpur',
    propertyType: 'Apartment',
    bhk: '2',
    purpose: 'Rent',
    budgetMin: 18000,
    budgetMax: 25000,
    timeline: '0-3m',
    source: 'Website',
    status: 'New',
    notes: 'Family of 4 looking for 2BHK apartment',
    tags: 'family,urgent',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-5',
    fullName: 'Vikash Gupta',
    email: 'vikash.gupta@gmail.com',
    phone: '9345678901',
    city: 'Chandigarh',
    propertyType: 'Office',
    bhk: null,
    purpose: 'Buy',
    budgetMin: 6000000,
    budgetMax: 8000000,
    timeline: '3-6m',
    source: 'Call',
    status: 'Qualified',
    notes: 'Commercial space for expanding IT company',
    tags: 'business,commercial',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-6',
    fullName: 'Neha Agarwal',
    email: 'neha.agarwal@outlook.com',
    phone: '9456789012',
    city: 'Mohali',
    propertyType: 'Apartment',
    bhk: '1',
    purpose: 'Rent',
    budgetMin: 15000,
    budgetMax: 20000,
    timeline: 'Exploring',
    source: 'Website',
    status: 'New',
    notes: 'Single professional looking for 1BHK near IT park',
    tags: 'professional,single',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-7',
    fullName: 'Rohit Jain',
    email: 'rohit.jain@email.com',
    phone: '9567890123',
    city: 'Panchkula',
    propertyType: 'Villa',
    bhk: '3',
    purpose: 'Buy',
    budgetMin: 7500000,
    budgetMax: 9500000,
    timeline: '3-6m',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Family home with parking space and garden',
    tags: 'family,spacious',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-8',
    fullName: 'Kavita Malhotra',
    email: 'kavita.malhotra@gmail.com',
    phone: '9678901234',
    city: 'Zirakpur',
    propertyType: 'Retail',
    bhk: null,
    purpose: 'Rent',
    budgetMin: 45000,
    budgetMax: 60000,
    timeline: '0-3m',
    source: 'Walk-in',
    status: 'Visited',
    notes: 'Shop space in main market area for boutique',
    tags: 'business,retail',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-9',
    fullName: 'Suresh Chopra',
    email: 'suresh.chopra@yahoo.com',
    phone: '9789012345',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '4',
    purpose: 'Buy',
    budgetMin: 6500000,
    budgetMax: 8500000,
    timeline: '>6m',
    source: 'Website',
    status: 'New',
    notes: 'Spacious 4BHK for joint family with elderly parents',
    tags: 'spacious,family',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  },
  {
    id: 'buyer-10',
    fullName: 'Anita Sethi',
    email: 'anita.sethi@email.com',
    phone: '9890123456',
    city: 'Mohali',
    propertyType: 'Plot',
    bhk: null,
    purpose: 'Buy',
    budgetMin: 3000000,
    budgetMax: 4000000,
    timeline: '3-6m',
    source: 'Call',
    status: 'Qualified',
    notes: 'Corner plot for future house construction',
    tags: 'investment,corner',
    ownerId: 'admin-1',
    updatedAt: new Date(),
  }
];

// Generate multiple buyers for bulk seeding
const generateBulkBuyers = () => {
  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikash', 'Neha', 'Rohit', 'Kavita', 'Suresh', 'Anita', 'Deepak', 'Pooja', 'Manoj', 'Ritu', 'Sanjay', 'Meera', 'Arun', 'Shanti', 'Ramesh', 'Geeta', 'Vinod', 'Rekha', 'Ajay', 'Seema', 'Rakesh', 'Sushma', 'Naresh', 'Usha', 'Pankaj', 'Nisha', 'Santosh', 'Radha', 'Ashok', 'Saroj', 'Dinesh', 'Asha', 'Krishan', 'Lata', 'Mahesh', 'Sudha', 'Ravi', 'Kamala', 'Mohan', 'Pushpa', 'Lalit', 'Sunila', 'Gopal', 'Urmila', 'Shyam', 'Kiran'];
  const lastNames = ['Kumar', 'Sharma', 'Singh', 'Gupta', 'Verma', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Goel', 'Chopra', 'Malhotra', 'Arora', 'Sethi', 'Kapoor', 'Mehta', 'Shah', 'Patel', 'Tiwari', 'Srivastava', 'Mishra', 'Pandey', 'Yadav', 'Joshi', 'Saxena', 'Aggarwal', 'Bhatia', 'Khanna', 'Bajaj', 'Goyal'];
  const cities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
  const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
  const bhkOptions = ['1', '2', '3', '4', 'Studio'];
  const purposes = ['Buy', 'Rent'];
  const timelines = ['0-3m', '3-6m', '>6m', 'Exploring'];
  const sources = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'];
  const statuses = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];
  const tagOptions = ['urgent', 'family', 'investment', 'premium', 'first-time', 'urgent,family', 'investment,rental', 'premium,luxury', 'family,spacious', 'urgent,transfer', 'retirement,ground-floor', 'school-nearby', 'hospital-nearby', 'it-hub', 'budget-flexible'];
  const sampleNotes = ['Looking for spacious apartment in good locality', 'Interested in premium property with modern amenities', 'First-time buyer, needs assistance with documentation', 'Urgent requirement due to job transfer', 'Investment purpose, looking for good rental yield', 'Family expanding, needs bigger space', 'Retirement home, prefers ground floor', 'Close to schools and hospitals preferred', 'Good connectivity to IT hub required', 'Budget flexible for right property'];

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const generatePhone = () => {
    const prefixes = ['98', '99', '91', '92', '93', '94', '95', '96', '97'];
    return getRandomElement(prefixes) + String(getRandomNumber(10000000, 99999999));
  };
  const generateEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com'];
    return Math.random() > 0.1 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}` : null;
  };

  const generateBudget = (propertyType, purpose) => {
    let min, max;
    if (purpose === 'Rent') {
      switch (propertyType) {
        case 'Apartment': min = getRandomNumber(15000, 25000); max = min + getRandomNumber(5000, 15000); break;
        case 'Villa': min = getRandomNumber(25000, 40000); max = min + getRandomNumber(10000, 20000); break;
        case 'Office': min = getRandomNumber(20000, 50000); max = min + getRandomNumber(10000, 30000); break;
        case 'Retail': min = getRandomNumber(30000, 80000); max = min + getRandomNumber(20000, 50000); break;
        default: min = getRandomNumber(10000, 30000); max = min + getRandomNumber(5000, 20000);
      }
    } else {
      switch (propertyType) {
        case 'Apartment': min = getRandomNumber(3000000, 6000000); max = min + getRandomNumber(1000000, 3000000); break;
        case 'Villa': min = getRandomNumber(8000000, 15000000); max = min + getRandomNumber(2000000, 5000000); break;
        case 'Plot': min = getRandomNumber(2000000, 5000000); max = min + getRandomNumber(500000, 2000000); break;
        case 'Office': min = getRandomNumber(5000000, 12000000); max = min + getRandomNumber(1000000, 4000000); break;
        case 'Retail': min = getRandomNumber(4000000, 10000000); max = min + getRandomNumber(1000000, 3000000); break;
      }
    }
    return { min, max };
  };

  const buyers = [];
  for (let i = 1; i <= 520; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const propertyType = getRandomElement(propertyTypes);
    const purpose = getRandomElement(purposes);
    const budget = generateBudget(propertyType, purpose);
    const bhk = (propertyType === 'Apartment' || propertyType === 'Villa') ? getRandomElement(bhkOptions) : null;
    
    buyers.push({
      id: `seed-buyer-${i}`,
      fullName: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      city: getRandomElement(cities),
      propertyType,
      bhk,
      purpose,
      budgetMin: budget.min,
      budgetMax: budget.max,
      timeline: getRandomElement(timelines),
      source: getRandomElement(sources),
      status: getRandomElement(statuses),
      notes: getRandomElement(sampleNotes),
      tags: getRandomElement(tagOptions),
      ownerId: 'admin-1',
      updatedAt: new Date()
    });
  }
  return buyers;
};

// Auto-seed data after creating tables
const seedData = async () => {
  try {
    // Check if data already exists
    const existingBuyers = await client.unsafe('SELECT COUNT(*) FROM buyers');
    const count = parseInt(existingBuyers[0].count);
    
    if (count < 500) {  // Seed if less than 500 entries
      console.log(`Seeding database with 520 buyer entries (current: ${count})...`);
      
      const bulkBuyers = generateBulkBuyers();
      
      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < bulkBuyers.length; i += batchSize) {
        const batch = bulkBuyers.slice(i, i + batchSize);
        
        for (const buyer of batch) {
          await client.unsafe(`
            INSERT INTO buyers (id, full_name, email, phone, city, property_type, bhk, purpose, budget_min, budget_max, timeline, source, status, notes, tags, owner_id, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO NOTHING
          `, [
            buyer.id, buyer.fullName, buyer.email, buyer.phone, buyer.city, buyer.propertyType,
            buyer.bhk, buyer.purpose, buyer.budgetMin, buyer.budgetMax, buyer.timeline,
            buyer.source, buyer.status, buyer.notes, buyer.tags, buyer.ownerId, buyer.updatedAt
          ]);
        }
        
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(bulkBuyers.length/batchSize)}`);
      }
      
      const finalCount = await client.unsafe('SELECT COUNT(*) FROM buyers');
      console.log(`Successfully seeded! Total buyers: ${finalCount[0].count}`);
    } else {
      console.log(`Database already has ${count} buyers, skipping seeding.`);
    }
  } catch (error) {
    console.log('Seeding error:', error);
  }
};

// Initialize tables and seed data on module load (only in production)
if (process.env.NODE_ENV === 'production' && process.env.POSTGRES_URL) {
  ensureTablesExist().then(() => {
    // Add a small delay to ensure tables are fully created
    setTimeout(seedData, 1000);
  });
}

// Migration helper function
export async function runMigrations(force = false) {
  if (force || process.env.RUN_MIGRATIONS === 'true') {
    try {
      console.log('Running database migrations...');
      await migrate(db, { migrationsFolder: 'drizzle' });
      console.log('Database migrations completed successfully');
      return true;
    } catch (error) {
      console.log('Migration error:', error);
      return false;
    }
  }
  return false;
}
