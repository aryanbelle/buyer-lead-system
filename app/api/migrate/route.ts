import { NextResponse } from "next/server"
import postgres from 'postgres'

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
ALTER TABLE "buyer_history" ADD CONSTRAINT "buyer_history_buyer_id_buyers_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."buyers"("id") ON DELETE cascade ON UPDATE no action;
`;

export async function POST() {
  try {
    console.log("Starting direct SQL table creation...")
    
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 30,
      prepare: false,
    })
    
    // Execute the SQL to create tables
    await client.unsafe(createTablesSQL)
    console.log("Tables created successfully!")
    
    // Close the connection
    await client.end()
    
    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully" 
    })
  } catch (error) {
    console.error("Table creation error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Table creation failed" 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST to run migrations",
    migrationStatus: process.env.RUN_MIGRATIONS 
  })
}
