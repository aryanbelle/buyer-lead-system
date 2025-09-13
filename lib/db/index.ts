import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import * as schema from "./schema"

// For production, you'll need to replace this with a cloud database
// Examples:
// - Vercel Postgres
// - PlanetScale (MySQL)
// - Neon (PostgreSQL)
// - Turso (LibSQL/SQLite compatible)

const databaseUrl = process.env.DATABASE_URL || "sqlite.db"

// SQLite setup (development only)
const sqlite = new Database(databaseUrl.replace("file:", ""))
export const db = drizzle(sqlite, { schema })

// Run migrations on startup (development only)
if (process.env.NODE_ENV !== "production") {
  try {
    migrate(db, { migrationsFolder: "drizzle" })
    console.log("Database migrations completed successfully")
  } catch (error) {
    console.log("Migration error (this is normal on first run):", error)
  }
}
