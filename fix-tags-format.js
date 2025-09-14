const postgres = require('postgres');
require('dotenv').config({ path: '.env.production' });

const sql = postgres(process.env.POSTGRES_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false,
});

async function fixTagsFormat() {
  try {
    console.log('🔧 Fixing tags format from comma-separated strings to JSON arrays...');
    
    // Get all buyers with tags
    const buyers = await sql`SELECT id, tags FROM buyers WHERE tags IS NOT NULL AND tags != ''`;
    console.log(`📊 Found ${buyers.length} buyers with tags to fix`);
    
    let fixed = 0;
    
    for (const buyer of buyers) {
      try {
        // Convert comma-separated string to JSON array
        let tagsArray;
        if (buyer.tags.includes(',')) {
          // Multiple tags: "urgent,family" -> ["urgent", "family"]
          tagsArray = buyer.tags.split(',').map(tag => tag.trim());
        } else {
          // Single tag: "investment" -> ["investment"]
          tagsArray = [buyer.tags.trim()];
        }
        
        const jsonTags = JSON.stringify(tagsArray);
        
        // Update the buyer with proper JSON format
        await sql`
          UPDATE buyers 
          SET tags = ${jsonTags}
          WHERE id = ${buyer.id}
        `;
        
        fixed++;
        
        if (fixed % 50 === 0) {
          console.log(`   ✅ Fixed ${fixed} buyers...`);
        }
      } catch (error) {
        console.log(`   ❌ Error fixing buyer ${buyer.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 SUCCESS!`);
    console.log(`📊 Fixed ${fixed} buyers with proper JSON tags format`);
    console.log(`🌐 Your app should now display all buyers correctly!`);
    
  } catch (error) {
    console.error('❌ Error during tags format fix:', error);
  } finally {
    await sql.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixTagsFormat();
