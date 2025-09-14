import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables first
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './schema';

// Supabase PostgreSQL connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Migration helper function
export async function runMigrations() {
  if (process.env.RUN_MIGRATIONS === 'true') {
    try {
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
