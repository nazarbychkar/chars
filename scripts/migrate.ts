#!/usr/bin/env ts-node

import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

type Migration = { id: string; description: string; sql: string };

function loadEnvUrl(): string {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

// Define all migrations here (idempotent!)
const migrations: Migration[] = [
  {
    id: "2025-10-14_add_fabric_and_lining_fields",
    description: "Add fabric_composition and has_lining to products",
    sql: `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS fabric_composition TEXT;
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS has_lining BOOLEAN DEFAULT FALSE;
      COMMENT ON COLUMN products.fabric_composition IS 'Склад тканини продукту (наприклад: 80% бавовна, 20% поліестер)';
      COMMENT ON COLUMN products.has_lining IS 'Чи має продукт підкладку';
    `,
  },
  {
    id: "2025-10-14_add_product_colors_table",
    description: "Create product_colors table and backfill from products.color",
    sql: `
      CREATE TABLE IF NOT EXISTS product_colors (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        hex TEXT
      );
      INSERT INTO product_colors (product_id, label)
      SELECT id, color FROM products p
      WHERE p.color IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id
        );
    `,
  },
  {
    id: "2025-10-14_add_color_to_order_items",
    description: "Add color column to order_items",
    sql: `
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color TEXT;
    `,
  },
  {
    id: "2025-10-14_update_orders_delivery_method_check",
    description: "Expand allowed delivery_method values",
    sql: `
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE table_name = 'orders' AND constraint_name = 'orders_delivery_method_check'
        ) THEN
          ALTER TABLE orders DROP CONSTRAINT orders_delivery_method_check;
        END IF;
      END$$;

      ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_method_check
      CHECK (delivery_method IN (
        'nova_poshta', -- legacy
        'nova_poshta_branch',
        'nova_poshta_locker',
        'nova_poshta_courier',
        'ukrposhta',
        'pickup', -- legacy
        'showroom_pickup'
      ));
    `,
  },
];

async function ensureMigrationsTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      description TEXT
    );
  `);
}

async function hasRun(pool: Pool, id: string): Promise<boolean> {
  const res = await pool.query("SELECT 1 FROM _migrations WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

async function recordRun(pool: Pool, id: string, description: string) {
  await pool.query(
    "INSERT INTO _migrations (id, description) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, description]
  );
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  });

  await ensureMigrationsTable(pool);

  for (const m of migrations) {
    const done = await hasRun(pool, m.id);
    if (done) {
      console.log(`✓ Skipping ${m.id} (already applied)`);
      continue;
    }
    console.log(`→ Running migration ${m.id}: ${m.description}`);
    await pool.query(m.sql);
    await recordRun(pool, m.id, m.description);
    console.log(`✓ Completed ${m.id}`);
  }

  await pool.end();
  console.log("All migrations done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});