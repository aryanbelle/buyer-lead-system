import type { Config } from "drizzle-kit"
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') })
}

export default {
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.POSTGRES_URL || process.env.DATABASE_URL!,
    },
} satisfies Config
