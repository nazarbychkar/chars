import { Pool, PoolClient } from "pg";
import { unlink } from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";

// Create a PostgreSQL connection pool with optimized settings
// Optimized for 2GB VPS: max 5 connections (20 was too high and caused memory issues)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
  // Connection pool optimization for small-medium traffic
  max: 5, // Maximum number of clients in the pool (reduced from 20)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Helper function to execute queries in a transaction
// CRITICAL: Must use the same client for BEGIN/COMMIT/ROLLBACK
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Create a template literal function that mimics Neon's API
export const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let query = strings[0];
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1];
    }
    const result = await pool.query(query, values);
    return result.rows;
  },
  {
    query: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let query = strings[0];
      for (let i = 0; i < values.length; i++) {
        query += `$${i + 1}` + strings[i + 1];
      }
      const result = await pool.query(query, values);
      return result.rows;
    },
  }
);

/**
 * Prod safety: if DB was never migrated, SELECT/INSERT on `recommended_product_ids`
 * throws and product pages return 404. This idempotent ALTER runs once per process.
 * Set DISABLE_AUTO_RECOMMENDED_COLUMN=1 to skip (e.g. restricted DB user).
 */
let recommendedProductIdsColumnEnsured = false;
let availabilityStatusColumnEnsured = false;

export async function ensureRecommendedProductIdsColumn(): Promise<void> {
  if (recommendedProductIdsColumnEnsured) return;
  if (process.env.DISABLE_AUTO_RECOMMENDED_COLUMN === "1") return;
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS recommended_product_ids INT[]`;
    recommendedProductIdsColumnEnsured = true;
  } catch (err) {
    console.error(
      "[sql] ensureRecommendedProductIdsColumn failed (run POST /api/migrate or grant ALTER):",
      err
    );
    throw err;
  }
}

/**
 * Prod safety: older DBs may miss `products.availability_status`.
 * Run idempotent ALTER once per process before product queries/mutations.
 */
export async function ensureAvailabilityStatusColumn(): Promise<void> {
  if (availabilityStatusColumnEnsured) return;
  if (process.env.DISABLE_AUTO_AVAILABILITY_COLUMN === "1") return;
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'`;
    availabilityStatusColumnEnsured = true;
  } catch (err) {
    console.error(
      "[sql] ensureAvailabilityStatusColumn failed (run POST /api/migrate or grant ALTER):",
      err
    );
    throw err;
  }
}

// =====================
// 👕 PRODUCTS
// =====================

// Get all products - optimized for catalog list (only first photo)
// OPTIMIZED: Using LATERAL JOIN instead of correlated subquery (2-3x faster)
// OPTIMIZED: Added Next.js cache wrapper for server-side caching (revalidate every 5 minutes)
async function _sqlGetAllProducts() {
  await ensureAvailabilityStatusColumn();
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.description,
      p.description_en,
      p.description_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      p.subcategory_id,
      p.created_at,
      p.availability_status,
      c.name AS category_name,
      sc.name AS subcategory_name,
      m.first_media
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    ORDER BY p.created_at DESC;
  `;
}

// Uncached variant for APIs / admin panels that must always see fresh data
export async function sqlGetAllProductsUncached() {
  return _sqlGetAllProducts();
}

/** Facebook/Google XML & CSV feeds: first photo by gallery order; separate first video for video-only items */
export async function sqlGetAllProductsForFacebookFeedUncached() {
  await ensureAvailabilityStatusColumn();
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.description,
      p.description_en,
      p.description_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      p.subcategory_id,
      p.created_at,
      p.availability_status,
      c.name AS category_name,
      sc.name AS subcategory_name,
      feed_media.first_photo_media,
      feed_media.first_video_media
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT
        (
          SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url)
          FROM product_media m
          WHERE m.product_id = p.id AND m.type = 'photo'
          ORDER BY m.id ASC
          LIMIT 1
        ) AS first_photo_media,
        (
          SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url)
          FROM product_media m
          WHERE m.product_id = p.id AND m.type = 'video'
          ORDER BY m.id ASC
          LIMIT 1
        ) AS first_video_media
    ) feed_media ON true
    ORDER BY p.created_at DESC;
  `;
}

export const sqlGetAllProducts = unstable_cache(
  _sqlGetAllProducts,
  ['all-products'],
  {
    revalidate: 300, // 5 minutes - matches ISR revalidate time
    tags: ['products'], // Cache tags for on-demand revalidation
  }
);

// Get one product by ID with sizes & media
export async function sqlGetProduct(id: number) {
  await ensureAvailabilityStatusColumn();
  const rows = await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.description,
      p.description_en,
      p.description_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.availability_status,
      p.color,
      p.category_id,
      p.subcategory_id,
      p.fabric_composition,
      p.fabric_composition_en,
      p.fabric_composition_de,
      p.has_lining,
      p.lining_description,
      p.lining_description_en,
      p.lining_description_de,
      c.name AS category_name,
      sc.name AS subcategory_name,
      COALESCE(s.sizes, '[]') AS sizes,
      COALESCE(m.media, '[]') AS media,
      COALESCE(pc.colors, '[]') AS colors
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock)
      ) AS sizes
      FROM product_sizes s
      WHERE s.product_id = p.id
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) ORDER BY m.id
      ) AS media
      FROM product_media m
      WHERE m.product_id = p.id
    ) m ON true
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex)
      ) AS colors
      FROM product_colors pc
      WHERE pc.product_id = p.id
    ) pc ON true
    WHERE p.id = ${id};
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return rows;

  try {
    const recRows = await sql`
      SELECT recommended_product_ids FROM products WHERE id = ${id};
    `;
    const rec = recRows[0] as
      | { recommended_product_ids?: number[] | null }
      | undefined;
    return [
      {
        ...row,
        recommended_product_ids: rec?.recommended_product_ids ?? null,
      },
    ];
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (code === "42703") {
      return [{ ...row, recommended_product_ids: null }];
    }
    throw err;
  }
}

// =========================
// Get related color variants by first two words of product name
// Returns: id, name, first_color (main color from product_colors)
// =========================
export async function sqlGetRelatedColorsByName(name: string) {
  // Extract first two words from the product name
  const nameWords = name.trim().split(/\s+/).filter(word => word.length > 0);
  const firstTwoWords = nameWords.slice(0, 2).join(' ');
  
  // If we have less than 2 words, fall back to exact match
  if (nameWords.length < 2) {
    return await sql`
      SELECT
        p.id,
        p.name,
        COALESCE(
          (
            SELECT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex)
            FROM product_colors pc
            WHERE pc.product_id = p.id
            ORDER BY pc.id
            LIMIT 1
          ),
          CASE 
            WHEN p.color IS NOT NULL THEN JSONB_BUILD_OBJECT('label', p.color, 'hex', NULL)
            ELSE NULL
          END
        ) AS first_color
      FROM products p
      WHERE array_to_string((string_to_array(p.name, ' '))[1:2], ' ') = ${firstTwoWords}
      ORDER BY p.id;
    `;
  }
  
  // Compare first two words using PostgreSQL array functions
  return await sql`
    SELECT
      p.id,
      p.name,
      COALESCE(
        (
          SELECT JSONB_BUILD_OBJECT('label', pc.label, 'hex', pc.hex)
          FROM product_colors pc
          WHERE pc.product_id = p.id
          ORDER BY pc.id
          LIMIT 1
        ),
        CASE 
          WHEN p.color IS NOT NULL THEN JSONB_BUILD_OBJECT('label', p.color, 'hex', NULL)
          ELSE NULL
        END
      ) AS first_color
    FROM products p
    WHERE array_to_string((string_to_array(p.name, ' '))[1:2], ' ') = ${firstTwoWords}
    ORDER BY p.id;
  `;
}

export async function sqlGetProductsByCategory(categoryName: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      c.name AS category_name,
      m.first_media
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    WHERE c.name = ${categoryName}
    ORDER BY p.created_at DESC;
  `;
}

export async function sqlGetProductsBySubcategoryName(name: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      p.subcategory_id,
      c.name AS category_name,
      sc.name AS subcategory_name,
      m.first_media
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    WHERE LOWER(sc.name) = LOWER(${name})
    ORDER BY p.created_at DESC;
  `;
}

export async function sqlGetProductsBySeason(season: string) {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      c.name AS category_name,
      m.first_media
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    WHERE ${season} = ANY(p.season)
    ORDER BY p.created_at DESC;
  `;
}

// Get only top sale products (optimized - only first photo for list view)
export async function sqlGetTopSaleProducts() {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      m.first_media
    FROM products p
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    WHERE p.top_sale = true
    ORDER BY p.created_at DESC;
  `;
}

// Get only limited edition products (optimized - only first photo for list view)
export async function sqlGetLimitedEditionProducts() {
  return await sql`
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      m.first_media
    FROM products p
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    WHERE p.limited_edition = true
    ORDER BY p.created_at DESC;
  `;
}

export async function sqlGetProductsByIdsOrdered(ids: number[]) {
  if (!ids.length) return [];

  return await sql`
    WITH target_ids AS (
      SELECT id::INT, ord::INT
      FROM UNNEST(${ids}::int[]) WITH ORDINALITY AS t(id, ord)
    )
    SELECT
      p.id,
      p.name,
      p.name_en,
      p.name_de,
      p.price,
      p.price_eur,
      p.old_price,
      p.discount_percentage,
      p.top_sale,
      p.limited_edition,
      p.season,
      p.category_id,
      p.subcategory_id,
      c.name AS category_name,
      sc.name AS subcategory_name,
      m.first_media
    FROM target_ids t
    JOIN products p ON p.id = t.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN LATERAL (
      SELECT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url) AS first_media
      FROM product_media m
      WHERE m.product_id = p.id
      ORDER BY m.id
      LIMIT 1
    ) m ON true
    ORDER BY t.ord;
  `;
}

// Fetch all distinct colors from the database
export async function sqlGetAllColors() {
  const dbColors = await sql`
    SELECT DISTINCT color
    FROM products
    WHERE color IS NOT NULL
    ORDER BY color;
  `;

  // Standard palette with hex suggestions
  const standardPalette: Record<string, string> = {
    Чорний: "#000000",
    Білий: "#FFFFFF",
    Сірий: "#808080",
    "Світло-сірий": "#C0C0C0",
    "Темно-сірий": "#4B4B4B",
    Бежевий: "#F5F5DC",
    Кремовий: "#FFFDD0",
    Коричневий: "#8B4513",
    Червоний: "#FF0000",
    Малиновий: "#DC143C",
    Кораловий: "#FF7F50",
    Рожевий: "#FFC0CB",
    Помаранчевий: "#FFA500",
    Жовтий: "#FFD700",
    Зелений: "#008000",
    Хаки: "#78866B",
    Блакитний: "#87CEEB",
    Синій: "#0000FF",
    "Темно-синій": "#00008B",
    Фіолетовий: "#800080",
  };

  const names = new Set<string>([...Object.keys(standardPalette)]);
  for (const row of dbColors) {
    if (row.color) names.add(row.color as string);
  }

  return Array.from(names)
    .sort()
    .map((name) => ({ color: name, hex: standardPalette[name] }));
}

// Create new product
export async function sqlPostProduct(product: {
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  description?: string;
  description_en?: string | null;
  description_de?: string | null;
  price: number;
  price_eur?: number | null;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string[];
  color?: string;
  category_id?: number | null;
  subcategory_id?: number | null; // ✅ NEW
  availability_status?: string | null;
  fabric_composition?: string;
  fabric_composition_en?: string | null;
  fabric_composition_de?: string | null;
  has_lining?: boolean;
  lining_description?: string;
  recommended_product_ids?: number[];
  sizes?: { size: string; stock: number }[];
  media?: { type: string; url: string }[];
  colors?: { label: string; hex?: string | null }[];
}) {
  await ensureRecommendedProductIdsColumn();
  await ensureAvailabilityStatusColumn();
  const inserted = await sql`
    INSERT INTO products (
      name, name_en, name_de,
      description, description_en, description_de,
      price, price_eur, old_price, discount_percentage, priority,
      top_sale, limited_edition, season, color,
      category_id, subcategory_id,
      fabric_composition, fabric_composition_en, fabric_composition_de,
      has_lining, lining_description,
      availability_status,
      recommended_product_ids
    )
    VALUES (
      ${product.name},
      ${product.name_en || null},
      ${product.name_de || null},
      ${product.description || null},
      ${product.description_en || null},
      ${product.description_de || null},
      ${product.price},
      ${product.price_eur ?? null},
      ${product.old_price || null},
      ${product.discount_percentage || null},
      ${product.priority || 0},
      ${product.top_sale || false},
      ${product.limited_edition || false},
      ${product.season || null},
      ${product.color || null},
      ${product.category_id || null},
      ${product.subcategory_id || null},
      ${product.fabric_composition || null},
      ${product.fabric_composition_en || null},
      ${product.fabric_composition_de || null},
      ${product.has_lining || false},
      ${product.lining_description || null},
      ${product.availability_status || 'available'},
      ${product.recommended_product_ids?.length ? product.recommended_product_ids : null}
    )
    RETURNING id;
  `;

  const productId = inserted[0].id;

  if (product.sizes?.length) {
    for (const size of product.sizes) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock)
        VALUES (${productId}, ${size.size}, ${size.stock});
      `;
    }
  }

  if (product.media?.length) {
    for (const media of product.media) {
      await sql`
        INSERT INTO product_media (product_id, type, url)
        VALUES (${productId}, ${media.type}, ${media.url});
      `;
    }
  }

  if (product.colors?.length) {
    for (const color of product.colors) {
      await sql`
        INSERT INTO product_colors (product_id, label, hex)
        VALUES (${productId}, ${color.label}, ${color.hex || null});
      `;
    }
  }

  return { id: productId };
}

// Update existing product
export async function sqlPutProduct(
  id: number,
  update: {
    name: string;
    description?: string;
    price: number;
    name_en?: string | null;
    name_de?: string | null;
    description_en?: string | null;
    description_de?: string | null;
    price_eur?: number | null;
    old_price?: number | null;
    discount_percentage?: number | null;
    priority?: number;
    top_sale?: boolean;
    limited_edition?: boolean;
    season?: string[] | string;
    availability_status?: string | null;
    color?: string;
    category_id?: number | null;
    subcategory_id?: number | null;
    fabric_composition?: string;
    fabric_composition_en?: string | null;
    fabric_composition_de?: string | null;
    has_lining?: boolean;
    lining_description?: string;
    recommended_product_ids?: number[];
    sizes?: { size: string; stock: number }[];
    media?: { type: string; url: string }[];
    colors?: { label: string; hex?: string | null }[];
  }
) {
  await ensureRecommendedProductIdsColumn();
  await ensureAvailabilityStatusColumn();
  // Step 1: Update main product fields
  // Convert season to array format for PostgreSQL array type
  // PostgreSQL expects array type, so we pass array directly (postgres.js handles conversion)
  const seasonValue = Array.isArray(update.season) 
    ? update.season.length > 0 ? update.season : null
    : typeof update.season === 'string' && update.season.trim() !== ''
      ? update.season.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : null;

  await sql`
    UPDATE products
    SET 
      name = ${update.name},
      description = ${update.description || null},
      price = ${Number(update.price)},
      price_eur = ${
        update.price_eur !== undefined && update.price_eur !== null
          ? Number(update.price_eur)
          : null
      },
      name_en = ${update.name_en || null},
      name_de = ${update.name_de || null},
      description_en = ${update.description_en || null},
      description_de = ${update.description_de || null},
      old_price = ${update.old_price ? Number(update.old_price) : null},
      discount_percentage = ${update.discount_percentage ? Number(update.discount_percentage) : null},
      priority = ${Number(update.priority || 0)},
      top_sale = ${update.top_sale || false},
      limited_edition = ${update.limited_edition || false},
      season = ${seasonValue},
      availability_status = ${update.availability_status || 'available'},
      color = ${update.color || null},
      category_id = ${update.category_id ? Number(update.category_id) : null},
      subcategory_id = ${update.subcategory_id ? Number(update.subcategory_id) : null},
      fabric_composition = ${update.fabric_composition || null},
      fabric_composition_en = ${update.fabric_composition_en || null},
      fabric_composition_de = ${update.fabric_composition_de || null},
      has_lining = ${update.has_lining || false},
      lining_description = ${update.lining_description || null},
      recommended_product_ids = ${
        update.recommended_product_ids?.length
          ? update.recommended_product_ids
          : null
      }
    WHERE id = ${id};
  `;

  // Step 2: Fetch old media URLs before deleting from DB
  const oldMediaRows = await sql`
    SELECT url FROM product_media WHERE product_id = ${id};
  `;
  const oldMediaUrls = oldMediaRows.map((row: { url: string }) => row.url);
  const newMediaUrls = (update.media || []).map((m) => m.url);

  // Step 3: Determine which files to DELETE from disk (old files NOT in new list)
  const filesToDelete = oldMediaUrls.filter(
    (oldUrl: string) => !newMediaUrls.includes(oldUrl)
  );

  // Step 4: Clear old sizes, media, colors from DB
  await sql`DELETE FROM product_sizes WHERE product_id = ${id};`;
  await sql`DELETE FROM product_media WHERE product_id = ${id};`;
  await sql`DELETE FROM product_colors WHERE product_id = ${id};`;

  // Step 5: Delete ONLY unused image files from disk
  for (const url of filesToDelete) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
      console.log(`✓ Deleted unused file: ${url}`);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  // Step 6: Re-insert new sizes
  if (update.sizes?.length) {
    for (const size of update.sizes) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock)
        VALUES (${id}, ${size.size}, ${size.stock});
      `;
    }
  }

  // Step 7: Re-insert new media (including old ones that weren't deleted)
  if (update.media?.length) {
    for (const media of update.media) {
      await sql`
        INSERT INTO product_media (product_id, type, url)
        VALUES (${id}, ${media.type}, ${media.url});
      `;
    }
  }

  // Step 8: Re-insert new colors
  if (update.colors?.length) {
    for (const color of update.colors) {
      await sql`
        INSERT INTO product_colors (product_id, label, hex)
        VALUES (${id}, ${color.label}, ${color.hex || null});
      `;
    }
  }

  return { updated: true };
}

export async function sqlDeleteProduct(id: number) {
  // Step 1: Get media URLs
  const media = await sql`
    SELECT url FROM product_media WHERE product_id = ${id};
  `;

  // Step 2: Delete the product (cascade removes sizes/media)
  await sql`DELETE FROM products WHERE id = ${id};`;

  // Step 3: Delete files from disk
  for (const { url } of media) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  return { deleted: true };
}

// =====================
// 📬 ORDERS
// =====================

// Get all orders (without items for performance)
export async function sqlGetAllOrders() {
  return await sql`
    SELECT *
    FROM orders
    WHERE payment_status = 'paid'
    ORDER BY created_at DESC;
  `;
}

// Get order with items
export async function sqlGetOrder(id: number) {
  const order = await sql`
    SELECT * FROM orders WHERE id = ${id};
  `;

  const items = await sql`
    SELECT oi.*, p.name AS product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${id};
  `;

  return {
    ...order[0],
    items,
  };
}

type OrderInput = {
  customer_name: string;
  phone_number: string;
  email?: string;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string;
  payment_type: "prepay" | "full" | "certificate";
  invoice_id: string;
  payment_reference?: string | null;
  payment_status: "pending" | "paid" | "canceled";
  currency: "UAH" | "EUR";
  locale?: string | null;
  gift_certificate_code?: string | null;
  certificate_discount?: number;
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

type CertificateOrderInput = {
  customer_name: string;
  phone_number: string;
  email?: string;
  payment_type: "prepay" | "full" | "certificate";
  invoice_id: string;
  payment_reference: string;
  payment_status: "pending" | "paid" | "canceled";
  currency: "UAH" | "EUR";
  locale?: string | null;
  tier_uah: number;
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

export async function sqlPostCertificateOrder(order: CertificateOrderInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let queryText = strings[0];
      for (let i = 0; i < values.length; i++) {
        queryText += `$${i + 1}` + strings[i + 1];
      }
      const result = await client.query(queryText, values);
      return result.rows;
    };

    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_certificate_code TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS certificate_discount NUMERIC(10,2) DEFAULT 0;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;`;
    await query`ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0`;
    await query`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_method_check`;
    await query`
      ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_method_check
      CHECK (
        delivery_method IN (
          'nova_poshta_branch',
          'nova_poshta_locker',
          'nova_poshta_courier',
          'showroom_pickup',
          'international_shipping',
          'certificate'
        )
      )
    `;

    const certificateComment = `Подарунковий сертифікат CHARS — ${order.tier_uah} ₴`;

    const inserted = await query`
      INSERT INTO orders (
        customer_name, phone_number, email,
        delivery_method, city, post_office,
        comment, payment_type, invoice_id, payment_status,
        currency, locale, payment_reference
      )
      VALUES (
        ${order.customer_name}, ${order.phone_number}, ${order.email || null},
        ${"certificate"}, ${"—"}, ${"Email"},
        ${certificateComment}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status},
        ${order.currency}, ${order.locale || null}, ${order.payment_reference}
      )
      RETURNING id;
    `;

    const orderId = inserted[0].id;

    for (const item of order.items) {
      await query`
        INSERT INTO order_items (
          order_id, product_id, size, quantity, price, color
        ) VALUES (
          ${orderId}, ${item.product_id}, ${item.size}, ${item.quantity}, ${item.price}, ${item.color || null}
        );
      `;
    }

    await client.query("COMMIT");
    return { orderId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function sqlPostOrder(order: OrderInput) {
  // Transaction: create order, insert items, check stock availability (but don't decrement - only after payment)
  // CRITICAL FIX: Use the same client for BEGIN/COMMIT/ROLLBACK
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Helper function to execute query on the same client
    const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let queryText = strings[0];
      for (let i = 0; i < values.length; i++) {
        queryText += `$${i + 1}` + strings[i + 1];
      }
      const result = await client.query(queryText, values);
      return result.rows;
    };

    // Ensure new columns exist (idempotent for Postgres 9.6+)
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_certificate_code TEXT;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS certificate_discount NUMERIC(10,2) DEFAULT 0;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;`;
    await query`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;`;

    const inserted = await query`
      INSERT INTO orders (
        customer_name, phone_number, email,
        delivery_method, city, post_office,
        comment, payment_type, invoice_id, payment_status,
        currency, locale, gift_certificate_code, certificate_discount,
        payment_reference
      )
      VALUES (
        ${order.customer_name}, ${order.phone_number}, ${order.email || null},
        ${order.delivery_method}, ${order.city}, ${order.post_office},
        ${order.comment || null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status},
        ${order.currency}, ${order.locale || null},
        ${order.gift_certificate_code || null},
        ${order.certificate_discount ?? 0},
        ${order.payment_reference || null}
      )
      RETURNING id;
    `;

    const orderId = inserted[0].id;

    for (const item of order.items) {
      // 1) Insert order item
      await query`
        INSERT INTO order_items (
          order_id, product_id, size, quantity, price, color
        ) VALUES (
          ${orderId}, ${item.product_id}, ${item.size}, ${item.quantity}, ${item.price}, ${item.color || null}
        );
      `;

      // 2) Check stock availability (but don't decrement yet - only after payment)
      const stockCheck = await query`
        SELECT id, stock
        FROM product_sizes
        WHERE product_id = ${item.product_id}
          AND size = ${item.size}
          AND stock >= ${item.quantity}
      `;

      if (!stockCheck || stockCheck.length === 0) {
        // Not enough stock or size doesn't exist
        throw new Error(
          `Недостатньо товару на складі. На жаль, обраного вами товару розміру ${item.size} зараз немає в наявності. Будь ласка, виберіть інший розмір або перевірте доступність товару пізніше.`
        );
      }
    }

    await client.query("COMMIT");
    return { orderId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Update an order (e.g., status change)
export async function sqlPutOrder(id: number, update: { status: string }) {
  await sql`
    UPDATE orders
    SET status = ${update.status}
    WHERE id = ${id};
  `;
  return { updated: true };
}

// ❌ Delete an order (auto-deletes items via ON DELETE CASCADE)
export async function sqlDeleteOrder(id: number) {
  await sql`DELETE FROM orders WHERE id = ${id};`;
  return { deleted: true };
}

// 🔍 Get all order items for a specific order
export async function sqlGetOrderItems(orderId: number) {
  return await sql`
    SELECT oi.*, p.name AS product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${orderId}
    ORDER BY oi.id ASC;
  `;
}

// ➕ Create a single order item
export async function sqlPostOrderItem(item: {
  order_id: number;
  product_id: number;
  size: string;
  quantity: number;
  price: number;
}) {
  const result = await sql`
    INSERT INTO order_items (order_id, product_id, size, quantity, price)
    VALUES (${item.order_id}, ${item.product_id}, ${item.size}, ${item.quantity}, ${item.price})
    RETURNING *;
  `;
  return result[0];
}

// ✏️ Update (edit) an order item
export async function sqlPutOrderItem(
  id: number,
  update: {
    product_id?: number;
    size?: string;
    quantity?: number;
    price?: number;
  }
) {
  // Optional updates using COALESCE
  return await sql`
    UPDATE order_items
    SET
      product_id = COALESCE(${update.product_id}, product_id),
      size = COALESCE(${update.size}, size),
      quantity = COALESCE(${update.quantity}, quantity),
      price = COALESCE(${update.price}, price)
    WHERE id = ${id}
    RETURNING *;
  `;
}

// ❌ Delete order item
export async function sqlDeleteOrderItem(id: number) {
  await sql`DELETE FROM order_items WHERE id = ${id};`;
  return { deleted: true };
}

export async function sqlUpdatePaymentStatus(
  invoiceId: string,
  status: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Helper function to execute query on the same client
    const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let queryText = strings[0];
      for (let i = 0; i < values.length; i++) {
        queryText += `$${i + 1}` + strings[i + 1];
      }
      const result = await client.query(queryText, values);
      return result.rows;
    };

    // Update payment status
    await query`
      UPDATE orders
      SET payment_status = ${status}
      WHERE invoice_id = ${invoiceId}
      RETURNING id;
    `;

    // If payment status is "paid", decrement stock for all order items
    if (status === "paid") {
      // Get order items
      const orderItems = await query`
        SELECT product_id, size, quantity
        FROM order_items
        WHERE order_id = (
          SELECT id FROM orders WHERE invoice_id = ${invoiceId}
        )
      `;

      // Decrement stock for each item (skip virtual certificate items)
      for (const item of orderItems) {
        if (item.product_id === 0) continue;

        const updated = await query`
          UPDATE product_sizes
          SET stock = stock - ${item.quantity}
          WHERE product_id = ${item.product_id}
            AND size = ${item.size}
            AND stock >= ${item.quantity}
          RETURNING id;
        `;

        if (!updated || updated.length === 0) {
          // Not enough stock - this shouldn't happen if stock was checked at order creation
          // But log it as a warning
          console.warn(
            `[sqlUpdatePaymentStatus] Not enough stock for product ${item.product_id}, size ${item.size}, quantity ${item.quantity}`
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Get order by invoice ID for webhook processing
export type OrderRowForNotification = {
  id: number;
  invoice_id: string;
  customer_name: string;
  phone_number: string;
  email: string | null;
  delivery_method: string;
  city: string;
  post_office: string;
  comment: string | null;
  payment_type: string;
  payment_status: string;
  currency: string | null;
  locale: string | null;
  created_at: string | Date;
  gift_certificate_code: string | null;
  certificate_discount: string | number | null;
  email_sent_at: string | Date | null;
  items: Array<{
    product_id?: number | null;
    product_name?: string | null;
    size?: string;
    quantity?: number;
    price?: number | string;
    color?: string | null;
  }>;
};

export async function sqlGetOrderByInvoiceId(
  invoiceId: string
): Promise<OrderRowForNotification | undefined> {
  await ensureOrderExtendedColumns();
  const result = await sql`
    SELECT 
      o.id,
      o.invoice_id,
      o.customer_name,
      o.phone_number,
      o.email,
      o.delivery_method,
      o.city,
      o.post_office,
      o.comment,
      o.payment_type,
      o.payment_status,
      o.currency,
      o.locale,
      o.created_at,
      o.gift_certificate_code,
      o.certificate_discount,
      o.email_sent_at,
      COALESCE(
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'product_id', oi.product_id,
            'product_name',
              CASE
                WHEN oi.product_id = 0 THEN 'Подарунковий сертифікат CHARS (' || oi.size || ' ₴)'
                WHEN o.locale = 'en' THEN COALESCE(p.name_en, p.name)
                WHEN o.locale = 'de' THEN COALESCE(p.name_de, p.name)
                ELSE p.name
              END,
            'size', oi.size,
            'quantity', oi.quantity,
            'price', oi.price,
            'color', oi.color
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.invoice_id = ${invoiceId}
    GROUP BY o.id;
  `;
  return result[0] as OrderRowForNotification | undefined;
}

// =====================
// 📦 CATEGORIES
// =====================

// Get all categories
export async function sqlGetAllCategories() {
  return await sql`
    SELECT * FROM categories
    WHERE COALESCE(priority, 0) >= 0
    ORDER BY priority DESC, id ASC;
  `;
}

// Get a single category by ID
export async function sqlGetCategory(id: number) {
  return await sql`
    SELECT * FROM categories
    WHERE id = ${id};
  `;
}

// Create a new category
export async function sqlPostCategory(
  name: string,
  priority: number = 0,
  name_en?: string | null,
  name_de?: string | null,
  recommended_look_config?: string | null
) {
  const result = await sql`
    INSERT INTO categories (name, name_en, name_de, priority, recommended_look_config)
    VALUES (${name}, ${name_en || null}, ${name_de || null}, ${priority}, ${
      recommended_look_config || null
    })
    RETURNING *;
  `;
  return result[0];
}

// Update a category by ID
export async function sqlPutCategory(
  id: number,
  name: string,
  priority: number = 0,
  name_en?: string | null,
  name_de?: string | null,
  recommended_look_config?: string | null
) {
  const result = await sql`
    UPDATE categories
    SET
      name = ${name},
      name_en = ${name_en || null},
      name_de = ${name_de || null},
      priority = ${priority},
      recommended_look_config = ${recommended_look_config || null}
    WHERE id = ${id}
    RETURNING *;
  `;
  return result[0];
}

// Delete a category by ID
export async function sqlDeleteCategory(id: number) {
  await sql`
    DELETE FROM categories
    WHERE id = ${id};
  `;
  return { deleted: true };
}

// =====================
// 📦 SUBCATEGORIES
// =====================

// Get all subcategories
export async function sqlGetAllSubcategories() {
  await sql`ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0`;
  return await sql`
    SELECT * FROM subcategories
    ORDER BY category_id ASC, priority DESC, id ASC;
  `;
}

// Get all subcategories for a specific category
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  await sql`ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0`;
  return await sql`
    SELECT * FROM subcategories
    WHERE category_id = ${categoryId}
      AND COALESCE(priority, 0) >= 0
    ORDER BY priority DESC, id ASC;
  `;
}

// Get a single subcategory by ID
export async function sqlGetSubcategory(id: number) {
  return await sql`
    SELECT * FROM subcategories
    WHERE id = ${id};
  `;
}

// Create a new subcategory
export async function sqlPostSubcategory(
  name: string,
  categoryId: number,
  name_en?: string | null,
  name_de?: string | null,
  priority: number = 0
) {
  const result = await sql`
    INSERT INTO subcategories (name, category_id, name_en, name_de, priority)
    VALUES (${name}, ${categoryId}, ${name_en ?? null}, ${name_de ?? null}, ${priority})
    RETURNING *;
  `;
  return result[0];
}

// Update a subcategory by ID
export async function sqlPutSubcategory(
  id: number,
  name: string,
  categoryId: number,
  name_en?: string | null,
  name_de?: string | null,
  priority: number = 0
) {
  const result = await sql`
    UPDATE subcategories
    SET name = ${name}, category_id = ${categoryId},
        name_en = ${name_en ?? null}, name_de = ${name_de ?? null},
        priority = ${priority}
    WHERE id = ${id}
    RETURNING *;
  `;
  return result[0];
}

// Delete a subcategory by ID
export async function sqlDeleteSubcategory(id: number) {
  await sql`
    DELETE FROM subcategories
    WHERE id = ${id};
  `;
  return { deleted: true };
}

// =====================
// 🎁 GIFT CERTIFICATES
// =====================

export type GiftCertificateRow = {
  id: number;
  code: string;
  purchase_order_id: number;
  tier_uah: number;
  tier_eur: number;
  initial_balance: string | number;
  remaining_balance: string | number;
  currency: "UAH" | "EUR";
  status: string;
  recipient_email: string | null;
  recipient_name: string | null;
  locale: string | null;
  expires_at: string | Date;
  created_at: string | Date;
};

async function ensureOrderExtendedColumns() {
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale TEXT;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_certificate_code TEXT;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS certificate_discount NUMERIC(10,2) DEFAULT 0;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_uidx
    ON orders (payment_reference)
    WHERE payment_reference IS NOT NULL
  `;
}

export async function sqlGetOrderByPaymentReference(reference: string) {
  await ensureOrderExtendedColumns();
  const rows = await sql`
    SELECT
      o.id,
      o.invoice_id,
      o.payment_status,
      o.delivery_method,
      o.locale
    FROM orders o
    WHERE o.payment_reference = ${reference}
    LIMIT 1
  `;
  return (rows[0] as
    | {
        id: number;
        invoice_id: string;
        payment_status: string;
        delivery_method: string;
        locale: string | null;
      }
    | undefined) ?? null;
}

async function ensureGiftCertificateSchema() {
  await ensureOrderExtendedColumns();
  await sql`
    CREATE TABLE IF NOT EXISTS gift_certificates (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      purchase_order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      tier_uah INTEGER NOT NULL,
      tier_eur INTEGER NOT NULL,
      initial_balance NUMERIC(10,2) NOT NULL,
      remaining_balance NUMERIC(10,2) NOT NULL,
      currency TEXT NOT NULL CHECK (currency IN ('UAH', 'EUR')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted')),
      recipient_email TEXT,
      recipient_name TEXT,
      locale TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export type GiftCertificateWithOrderRow = GiftCertificateRow & {
  customer_name: string | null;
  phone_number: string | null;
  order_email: string | null;
};

export async function sqlGetAllGiftCertificates(): Promise<
  GiftCertificateWithOrderRow[]
> {
  await ensureGiftCertificateSchema();
  const rows = await sql`
    SELECT
      gc.*,
      o.customer_name,
      o.phone_number,
      o.email AS order_email
    FROM gift_certificates gc
    LEFT JOIN orders o ON o.id = gc.purchase_order_id
    ORDER BY gc.created_at DESC;
  `;
  return rows as GiftCertificateWithOrderRow[];
}

export async function sqlGetGiftCertificateByCode(
  code: string
): Promise<GiftCertificateRow | undefined> {
  await ensureGiftCertificateSchema();
  const rows = await sql`
    SELECT * FROM gift_certificates
    WHERE UPPER(code) = UPPER(${code})
    LIMIT 1;
  `;
  return rows[0] as GiftCertificateRow | undefined;
}

export async function sqlGetGiftCertificateByPurchaseOrderId(
  purchaseOrderId: number
): Promise<GiftCertificateRow | undefined> {
  await ensureGiftCertificateSchema();
  const rows = await sql`
    SELECT * FROM gift_certificates
    WHERE purchase_order_id = ${purchaseOrderId}
    LIMIT 1;
  `;
  return rows[0] as GiftCertificateRow | undefined;
}

export async function sqlCalculateGiftCertificateDiscount(
  code: string,
  orderTotal: number,
  currency: "UAH" | "EUR"
): Promise<{ discount: number; certificate: GiftCertificateRow }> {
  const certificate = await sqlGetGiftCertificateByCode(code);
  if (!certificate) {
    throw new Error("CERT_NOT_FOUND");
  }
  if (certificate.status !== "active") {
    throw new Error("CERT_USED");
  }
  if (new Date(certificate.expires_at) < new Date()) {
    throw new Error("CERT_EXPIRED");
  }
  if (certificate.currency !== currency) {
    throw new Error("CERT_CURRENCY_MISMATCH");
  }

  const remaining = Number(certificate.remaining_balance);
  if (remaining <= 0) {
    throw new Error("CERT_USED");
  }

  const discount = Math.min(remaining, orderTotal);
  if (discount <= 0) {
    throw new Error("CERT_INVALID_AMOUNT");
  }

  return { discount, certificate };
}

export async function sqlCreateGiftCertificateForOrder(input: {
  purchaseOrderId: number;
  tierUah: number;
  tierEur: number;
  currency: "UAH" | "EUR";
  initialBalance: number;
  recipientName: string;
  recipientEmail: string;
  locale?: string | null;
}): Promise<GiftCertificateRow> {
  await ensureGiftCertificateSchema();
  const { generateGiftCertificateCode } = await import("@/lib/giftCertificateCode");

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateGiftCertificateCode();
    try {
      const rows = await sql`
        INSERT INTO gift_certificates (
          code, purchase_order_id, tier_uah, tier_eur,
          initial_balance, remaining_balance, currency,
          status, recipient_email, recipient_name, locale, expires_at
        ) VALUES (
          ${code}, ${input.purchaseOrderId}, ${input.tierUah}, ${input.tierEur},
          ${input.initialBalance}, ${input.initialBalance}, ${input.currency},
          ${"active"}, ${input.recipientEmail || null}, ${input.recipientName}, ${input.locale || null}, ${expiresAt.toISOString()}
        )
        RETURNING *;
      `;
      return rows[0] as GiftCertificateRow;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("duplicate key") && !message.includes("unique")) {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate unique gift certificate code");
}

export async function sqlRedeemGiftCertificateForOrder(input: {
  code: string;
  orderId: number;
  amount: number;
}) {
  await ensureGiftCertificateSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let queryText = strings[0];
      for (let i = 0; i < values.length; i++) {
        queryText += `$${i + 1}` + strings[i + 1];
      }
      const result = await client.query(queryText, values);
      return result.rows;
    };

    const updated = await query`
      UPDATE gift_certificates
      SET
        remaining_balance = remaining_balance - ${input.amount},
        status = CASE
          WHEN remaining_balance - ${input.amount} <= 0 THEN 'depleted'
          ELSE 'active'
        END
      WHERE UPPER(code) = UPPER(${input.code})
        AND status = 'active'
        AND remaining_balance >= ${input.amount}
      RETURNING *;
    `;

    if (!updated.length) {
      throw new Error("CERT_REDEEM_FAILED");
    }

    await client.query("COMMIT");
    return updated[0] as GiftCertificateRow;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function sqlMarkOrderEmailSent(orderId: number) {
  await sql`
    UPDATE orders
    SET email_sent_at = NOW()
    WHERE id = ${orderId};
  `;
}
