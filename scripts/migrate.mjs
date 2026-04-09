#!/usr/bin/env node
/**
 * Запуск: npm run migrate
 * Працює лише з Node (без tsx/ts-node) — зручно для продакшен-серверів.
 */
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

function loadEnvUrl() {
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

const migrations = [
  {
    id: "2025-10-22_add_priority_to_categories",
    description: "Add 'priority' column to categories table",
    sql: `
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;
    `,
  },
  {
    id: "2025-10-29_add_product_sizes_stock",
    description: "Ensure product_sizes table with stock tracking and constraints",
    sql: `
      CREATE TABLE IF NOT EXISTS product_sizes (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        UNIQUE (product_id, size)
      );

      ALTER TABLE product_sizes
      ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'product_sizes_product_id_size_key'
        ) THEN
          ALTER TABLE product_sizes
          ADD CONSTRAINT product_sizes_product_id_size_key UNIQUE (product_id, size);
        END IF;
      END
      $$;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'product_sizes_stock_nonneg'
        ) THEN
          ALTER TABLE product_sizes
          ADD CONSTRAINT product_sizes_stock_nonneg CHECK (stock >= 0);
        END IF;
      END
      $$;

      CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
    `,
  },
  {
    id: "2026-03-09_add_availability_status_to_products",
    description: "Add availability_status column to products table",
    sql: `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';
    `,
  },
  {
    id: "2026-03-23_add_recommended_product_ids_to_products",
    description: "Add recommended_product_ids array to products table",
    sql: `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS recommended_product_ids INT[];
    `,
  },
  {
    id: "2026-04-09_add_priority_to_subcategories",
    description: "Add priority column to subcategories for catalog sort order",
    sql: `
      ALTER TABLE subcategories
      ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;
    `,
  },
];

async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      description TEXT
    );
  `);
}

async function hasRun(pool, id) {
  const res = await pool.query("SELECT 1 FROM _migrations WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

async function recordRun(pool, id, description) {
  await pool.query(
    "INSERT INTO _migrations (id, description) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
    [id, description]
  );
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
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
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
