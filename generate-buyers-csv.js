const fs = require('fs');

// Sample data arrays for generating realistic entries
const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikash', 'Neha', 'Rohit', 'Kavita', 'Suresh', 'Anita',
  'Deepak', 'Pooja', 'Manoj', 'Ritu', 'Sanjay', 'Meera', 'Arun', 'Shanti', 'Ramesh', 'Geeta',
  'Vinod', 'Rekha', 'Ajay', 'Seema', 'Rakesh', 'Sushma', 'Naresh', 'Usha', 'Pankaj', 'Nisha',
  'Santosh', 'Radha', 'Ashok', 'Saroj', 'Dinesh', 'Asha', 'Krishan', 'Lata', 'Mahesh', 'Sudha',
  'Ravi', 'Kamala', 'Mohan', 'Pushpa', 'Lalit', 'Sunila', 'Gopal', 'Urmila', 'Shyam', 'Kiran'
];

const lastNames = [
  'Kumar', 'Sharma', 'Singh', 'Gupta', 'Verma', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Goel',
  'Chopra', 'Malhotra', 'Arora', 'Sethi', 'Kapoor', 'Mehta', 'Shah', 'Patel', 'Tiwari', 'Srivastava',
  'Mishra', 'Pandey', 'Yadav', 'Joshi', 'Saxena', 'Aggarwal', 'Bhatia', 'Khanna', 'Bajaj', 'Goyal',
  'Singhal', 'Jindal', 'Tandon', 'Khurana', 'Sachdeva', 'Kaul', 'Nanda', 'Kohli', 'Anand', 'Dua'
];

const cities = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'];
const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'];
const bhkOptions = ['1', '2', '3', '4', 'Studio'];
const purposes = ['Buy', 'Rent'];
const timelines = ['0-3m', '3-6m', '>6m', 'Exploring'];
const sources = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'];
const statuses = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'];

const sampleNotes = [
  'Looking for spacious apartment in good locality',
  'Interested in premium property with modern amenities',
  'First-time buyer, needs assistance with documentation',
  'Urgent requirement due to job transfer',
  'Investment purpose, looking for good rental yield',
  'Family expanding, needs bigger space',
  'Retirement home, prefers ground floor',
  'Close to schools and hospitals preferred',
  'Good connectivity to IT hub required',
  'Budget flexible for right property'
];

const tagOptions = [
  '["urgent"]', '["family"]', '["investment"]', '["premium"]', '["first-time"]',
  '["urgent","family"]', '["investment","rental"]', '["premium","luxury"]',
  '["family","spacious"]', '["urgent","transfer"]', '["retirement","ground-floor"]',
  '["school-nearby"]', '["hospital-nearby"]', '["it-hub"]', '["budget-flexible"]'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  const prefixes = ['98', '99', '91', '92', '93', '94', '95', '96', '97'];
  const prefix = getRandomElement(prefixes);
  const remaining = String(getRandomNumber(10000000, 99999999));
  return prefix + remaining;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com', 'company.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function generateBudget(propertyType, purpose) {
  let minBudget, maxBudget;
  
  if (purpose === 'Rent') {
    switch (propertyType) {
      case 'Apartment':
        minBudget = getRandomNumber(15000, 25000);
        maxBudget = minBudget + getRandomNumber(5000, 15000);
        break;
      case 'Villa':
        minBudget = getRandomNumber(25000, 40000);
        maxBudget = minBudget + getRandomNumber(10000, 20000);
        break;
      case 'Office':
        minBudget = getRandomNumber(20000, 50000);
        maxBudget = minBudget + getRandomNumber(10000, 30000);
        break;
      case 'Retail':
        minBudget = getRandomNumber(30000, 80000);
        maxBudget = minBudget + getRandomNumber(20000, 50000);
        break;
      default:
        minBudget = getRandomNumber(10000, 30000);
        maxBudget = minBudget + getRandomNumber(5000, 20000);
    }
  } else { // Buy
    switch (propertyType) {
      case 'Apartment':
        minBudget = getRandomNumber(3000000, 6000000);
        maxBudget = minBudget + getRandomNumber(1000000, 3000000);
        break;
      case 'Villa':
        minBudget = getRandomNumber(8000000, 15000000);
        maxBudget = minBudget + getRandomNumber(2000000, 5000000);
        break;
      case 'Plot':
        minBudget = getRandomNumber(2000000, 5000000);
        maxBudget = minBudget + getRandomNumber(500000, 2000000);
        break;
      case 'Office':
        minBudget = getRandomNumber(5000000, 12000000);
        maxBudget = minBudget + getRandomNumber(1000000, 4000000);
        break;
      case 'Retail':
        minBudget = getRandomNumber(4000000, 10000000);
        maxBudget = minBudget + getRandomNumber(1000000, 3000000);
        break;
    }
  }
  
  return { minBudget, maxBudget };
}

function generateBuyer(index) {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const email = Math.random() > 0.1 ? generateEmail(firstName, lastName) : ''; // 10% chance of no email
  const phone = generatePhoneNumber();
  const city = getRandomElement(cities);
  const propertyType = getRandomElement(propertyTypes);
  const purpose = getRandomElement(purposes);
  const { minBudget, maxBudget } = generateBudget(propertyType, purpose);
  
  // BHK only for Apartment and Villa
  let bhk = '';
  if (propertyType === 'Apartment' || propertyType === 'Villa') {
    bhk = getRandomElement(bhkOptions);
  }
  
  const timeline = getRandomElement(timelines);
  const source = getRandomElement(sources);
  const status = getRandomElement(statuses);
  const notes = getRandomElement(sampleNotes);
  const tags = getRandomElement(tagOptions);
  
  return {
    fullName,
    email,
    phone,
    city,
    propertyType,
    bhk,
    purpose,
    budgetMin: minBudget,
    budgetMax: maxBudget,
    timeline,
    source,
    notes,
    tags,
    status
  };
}

// Generate CSV content
console.log('Generating 500+ buyer entries...');

const headers = [
  'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 
  'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'
];

let csvContent = headers.join(',') + '\n';

// Generate 520 entries to ensure we have 500+
for (let i = 1; i <= 520; i++) {
  const buyer = generateBuyer(i);
  
  // Escape CSV values that contain commas or quotes
  const row = headers.map(header => {
    let value = buyer[header] || '';
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      value = `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(',');
  
  csvContent += row + '\n';
  
  if (i % 100 === 0) {
    console.log(`Generated ${i} entries...`);
  }
}

// Write to file
const filename = 'buyers-500-entries.csv';
fs.writeFileSync(filename, csvContent);

console.log(`\n✅ Successfully generated ${filename} with 520 buyer entries!`);
console.log(`File size: ${Math.round(fs.statSync(filename).size / 1024)}KB`);
console.log(`\nYou can now import this file using the CSV import feature in your app.`);
