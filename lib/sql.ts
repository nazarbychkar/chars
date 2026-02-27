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

// =====================
// 👕 PRODUCTS
// =====================

// Get all products - optimized for catalog list (only first photo)
// OPTIMIZED: Using LATERAL JOIN instead of correlated subquery (2-3x faster)
// OPTIMIZED: Added Next.js cache wrapper for server-side caching (revalidate every 5 minutes)
async function _sqlGetAllProducts() {
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
  sizes?: { size: string; stock: number }[];
  media?: { type: string; url: string }[];
  colors?: { label: string; hex?: string | null }[];
}) {
  const inserted = await sql`
    INSERT INTO products (
      name, name_en, name_de,
      description, description_en, description_de,
      price, price_eur, old_price, discount_percentage, priority,
      top_sale, limited_edition, season, color,
      category_id, subcategory_id,
      fabric_composition, fabric_composition_en, fabric_composition_de,
      has_lining, lining_description,
      availability_status
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
      ${product.availability_status || 'available'}
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
    sizes?: { size: string; stock: number }[];
    media?: { type: string; url: string }[];
    colors?: { label: string; hex?: string | null }[];
  }
) {
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
      lining_description = ${update.lining_description || null}
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
  payment_type: "prepay" | "full";
  invoice_id: string;
  payment_status: "pending" | "paid" | "canceled";
  currency: "UAH" | "EUR";
  locale?: string | null;
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
};

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

    const inserted = await query`
      INSERT INTO orders (
        customer_name, phone_number, email,
        delivery_method, city, post_office,
        comment, payment_type, invoice_id, payment_status,
        currency, locale
      )
      VALUES (
        ${order.customer_name}, ${order.phone_number}, ${order.email || null},
        ${order.delivery_method}, ${order.city}, ${order.post_office},
        ${order.comment || null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status},
        ${order.currency}, ${order.locale || null}
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

      // Decrement stock for each item
      for (const item of orderItems) {
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
export async function sqlGetOrderByInvoiceId(invoiceId: string) {
  const result = await sql`
    SELECT 
      o.id,
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
      COALESCE(
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'product_name',
              CASE
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
  return result[0];
}

// =====================
// 📦 CATEGORIES
// =====================

// Get all categories
export async function sqlGetAllCategories() {
  return await sql`
    SELECT * FROM categories
    ORDER BY priority DESC;
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
  return await sql`
    SELECT * FROM subcategories
    ORDER BY id;
  `;
}

// Get all subcategories for a specific category
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  return await sql`
    SELECT * FROM subcategories
    WHERE category_id = ${categoryId}
    ORDER BY id;
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
  name_de?: string | null
) {
  const result = await sql`
    INSERT INTO subcategories (name, category_id, name_en, name_de)
    VALUES (${name}, ${categoryId}, ${name_en ?? null}, ${name_de ?? null})
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
  name_de?: string | null
) {
  const result = await sql`
    UPDATE subcategories
    SET name = ${name}, category_id = ${categoryId},
        name_en = ${name_en ?? null}, name_de = ${name_de ?? null}
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
