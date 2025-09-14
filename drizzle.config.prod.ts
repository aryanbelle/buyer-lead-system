import type { Config } from "drizzle-kit"

// This config is for pushing schema to production Vercel Postgres
export default {
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        // You'll need to replace this with the actual POSTGRES_URL from Vercel dashboard
        url: process.env.PROD_DATABASE_URL || "postgresql://default:PASSWORD@HOST:5432/verceldb"
    },
} satisfies Config
