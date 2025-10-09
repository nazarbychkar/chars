import { NextResponse } from "next/server";
import { sql } from "@/lib/sql";

export async function POST() {
  try {
    console.log("🔄 Starting database migration...");

    // Run migration to add new columns
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2)`;
    console.log("✅ Added old_price column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER`;
    console.log("✅ Added discount_percentage column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0`;
    console.log("✅ Added priority column");

    console.log("🎉 Migration completed successfully!");

    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully",
      details: {
        added_columns: [
          "old_price DECIMAL(10,2) - Original price before discount",
          "discount_percentage INTEGER - Discount percentage (e.g., 20 for 20%)",
          "priority INTEGER DEFAULT 0 - Display priority (0 = normal, 1 = high priority)"
        ]
      }
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Migration failed", 
        details: error 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    // Check if columns exist
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('old_price', 'discount_percentage', 'priority')
      ORDER BY column_name;
    `;

    return NextResponse.json({
      success: true,
      migration_status: result.length === 3 ? "completed" : "pending",
      existing_columns: result,
      required_columns: ["old_price", "discount_percentage", "priority"]
    });
  } catch (error) {
    console.error("❌ Failed to check migration status:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check migration status", 
        details: error 
      },
      { status: 500 }
    );
  }
}
