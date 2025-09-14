const postgres = require('postgres');
require('dotenv').config({ path: '.env.production' });

// Use the production POSTGRES_URL
const sql = postgres(process.env.POSTGRES_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
});

// Data generation functions
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

const generateBuyer = (index) => {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const propertyType = getRandomElement(propertyTypes);
  const purpose = getRandomElement(purposes);
  const budget = generateBudget(propertyType, purpose);
  const bhk = (propertyType === 'Apartment' || propertyType === 'Villa') ? getRandomElement(bhkOptions) : null;
  
  return {
    id: `direct-seed-${index}`,
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
  };
};

async function seedDatabase() {
  try {
    console.log('🚀 Connecting to production database...');
    
    // Check current count
    const countResult = await sql`SELECT COUNT(*) FROM buyers`;
    const currentCount = parseInt(countResult[0].count);
    console.log(`📊 Current buyers in database: ${currentCount}`);
    
    if (currentCount >= 500) {
      console.log('✅ Database already has 500+ entries. Skipping seeding.');
      return;
    }
    
    // Generate 520 buyers
    console.log('📝 Generating 520 buyer entries...');
    const buyers = [];
    for (let i = 1; i <= 520; i++) {
      buyers.push(generateBuyer(i));
      if (i % 100 === 0) {
        console.log(`   Generated ${i} buyers...`);
      }
    }
    
    console.log('💾 Inserting buyers into production database...');
    
    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < buyers.length; i += batchSize) {
      const batch = buyers.slice(i, i + batchSize);
      
      try {
        await sql.begin(async sql => {
          for (const buyer of batch) {
            await sql`
              INSERT INTO buyers (
                id, full_name, email, phone, city, property_type, bhk, purpose, 
                budget_min, budget_max, timeline, source, status, notes, tags, owner_id, updated_at
              ) VALUES (
                ${buyer.id}, ${buyer.fullName}, ${buyer.email}, ${buyer.phone}, ${buyer.city}, 
                ${buyer.propertyType}, ${buyer.bhk}, ${buyer.purpose}, ${buyer.budgetMin}, 
                ${buyer.budgetMax}, ${buyer.timeline}, ${buyer.source}, ${buyer.status}, 
                ${buyer.notes}, ${buyer.tags}, ${buyer.ownerId}, ${buyer.updatedAt}
              )
              ON CONFLICT (id) DO NOTHING
            `;
            inserted++;
          }
        });
        
        console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(buyers.length/batchSize)} completed (${inserted} total)`);
      } catch (batchError) {
        console.log(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, batchError.message);
      }
    }
    
    // Check final count
    const finalCountResult = await sql`SELECT COUNT(*) FROM buyers`;
    const finalCount = parseInt(finalCountResult[0].count);
    
    console.log(`\n🎉 SUCCESS!`);
    console.log(`📊 Final count: ${finalCount} buyers`);
    console.log(`📈 Added: ${finalCount - currentCount} new entries`);
    console.log(`🌐 Check your app: https://buyer-lead-system-vercel.vercel.app/buyers`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await sql.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedDatabase();
