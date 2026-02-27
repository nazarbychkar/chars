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

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_eur DECIMAL(10,2)`;
    console.log("✅ Added price_eur column");

    // Multilingual fields for product page
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT`;
    console.log("✅ Added name_en column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_de TEXT`;
    console.log("✅ Added name_de column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT`;
    console.log("✅ Added description_en column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description_de TEXT`;
    console.log("✅ Added description_de column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS lining_description_en TEXT`;
    console.log("✅ Added lining_description_en column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS lining_description_de TEXT`;
    console.log("✅ Added lining_description_de column");

    // Fabric composition localizations
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_composition_en TEXT`;
    console.log("✅ Added fabric_composition_en column");

    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_composition_de TEXT`;
    console.log("✅ Added fabric_composition_de column");

    // Availability status for manual stock control
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'`;
    console.log("✅ Added products.availability_status column");

    // Category localizations
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT`;
    console.log("✅ Added categories.name_en column");

    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_de TEXT`;
    console.log("✅ Added categories.name_de column");

    // Category recommendation config for \"Доповніть LOOK\"
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS recommended_look_config TEXT`;
    console.log("✅ Added categories.recommended_look_config column");

    // Subcategory localizations
    await sql`ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_en TEXT`;
    console.log("✅ Added subcategories.name_en column");

    await sql`ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_de TEXT`;
    console.log("✅ Added subcategories.name_de column");

    // Orders: allow new international delivery method
    await sql`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_method_check`;
    await sql`
      ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_method_check
      CHECK (
        delivery_method IN (
          'nova_poshta_branch',
          'nova_poshta_locker',
          'nova_poshta_courier',
          'showroom_pickup',
          'international_shipping'
        )
      )
    `;
    console.log("✅ Updated orders_delivery_method_check to include international_shipping");

    console.log("🎉 Migration completed successfully!");

    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully",
      details: {
        added_columns: [
          "old_price DECIMAL(10,2) - Original price before discount",
          "discount_percentage INTEGER - Discount percentage (e.g., 20 for 20%)",
          "priority INTEGER DEFAULT 0 - Display priority (0 = normal, 1 = high priority)",
          "price_eur DECIMAL(10,2) - Product price in EUR for EN/DE locales"
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
      AND column_name IN (
        'old_price',
        'discount_percentage',
        'priority',
        'price_eur',
        'name_en',
        'name_de',
        'description_en',
        'description_de',
        'lining_description_en',
        'lining_description_de',
        'fabric_composition_en',
        'fabric_composition_de'
      )
      ORDER BY column_name;
    `;

    return NextResponse.json({
      success: true,
      migration_status: result.length === 12 ? "completed" : "pending",
      existing_columns: result,
      required_columns: [
        "old_price",
        "discount_percentage",
        "priority",
        "price_eur",
        "name_en",
        "name_de",
        "description_en",
        "description_de",
        "lining_description_en",
        "lining_description_de",
        "fabric_composition_en",
        "fabric_composition_de"
      ]
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
