import { sql } from "drizzle-orm"
import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core"

export const buyers = pgTable("buyers", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  propertyType: text("property_type").notNull(),
  bhk: text("bhk"),
  purpose: text("purpose").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: text("timeline").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("New"),
  notes: text("notes"),
  tags: text("tags"), // JSON string array
  ownerId: text("owner_id").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const buyerHistory = pgTable("buyer_history", {
  id: text("id").primaryKey(),
  buyerId: text("buyer_id").notNull().references(() => buyers.id, { onDelete: "cascade" }),
  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
  diff: text("diff").notNull(), // JSON string of changes
})

export type Buyer = typeof buyers.$inferSelect
export type NewBuyer = typeof buyers.$inferInsert
export type BuyerHistory = typeof buyerHistory.$inferSelect
export type NewBuyerHistory = typeof buyerHistory.$inferInsert