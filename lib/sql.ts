import { neon } from "@neondatabase/serverless";

export async function sqlConnect() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

const sql = await sqlConnect();

// =====================
// 👕 PRODUCTS
// =====================

// Get all products with sizes & media
export async function sqlGetAllProducts() {
  return await sql`
    SELECT
      p.*,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock))
        FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sizes,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('type', m.type, 'url', m.url))
        FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS media
    FROM products p
    LEFT JOIN product_sizes s ON p.id = s.product_id
    LEFT JOIN product_media m ON p.id = m.product_id
    GROUP BY p.id
    ORDER BY p.id DESC;
  `;
}

// Get one product by ID with sizes & media
export async function sqlGetProduct(id: number) {
  return await sql`
    SELECT
      p.*,
      COALESCE(s.sizes, '[]') AS sizes,
      COALESCE(m.media, '[]') AS media
    FROM products p
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('size', s.size, 'stock', s.stock)
      ) AS sizes
      FROM product_sizes s
      WHERE s.product_id = p.id
    ) s ON true
    LEFT JOIN LATERAL (
      SELECT JSON_AGG(
        JSONB_BUILD_OBJECT('type', m.type, 'url', m.url)
      ) AS media
      FROM product_media m
      WHERE m.product_id = p.id
    ) m ON true
    WHERE p.id = ${id};
  `;
}


// Create new product
export async function sqlPostProduct(product: {
  name: string;
  description?: string;
  price: number;
  sizes?: { size: string; stock: number }[];
  media?: { type: string; url: string }[];
}) {
  const inserted = await sql`
    INSERT INTO products (name, description, price)
    VALUES (${product.name}, ${product.description || null}, ${product.price})
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

  return { id: productId };
}

// Update product by ID (PUT = full update)
export async function sqlPutProduct(
  id: number,
  update: {
    name: string;
    description?: string;
    price: number;
    sizes?: { size: string; stock: number }[];
    media?: { type: string; url: string }[];
  }
) {
  await sql`
    UPDATE products
    SET name = ${update.name},
        description = ${update.description || null},
        price = ${update.price}
    WHERE id = ${id};
  `;

  // Clear old sizes & media
  await sql`DELETE FROM product_sizes WHERE product_id = ${id};`;
  await sql`DELETE FROM product_media WHERE product_id = ${id};`;

  // Re-insert new sizes & media
  if (update.sizes?.length) {
    for (const size of update.sizes) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock)
        VALUES (${id}, ${size.size}, ${size.stock});
      `;
    }
  }

  if (update.media?.length) {
    for (const media of update.media) {
      await sql`
        INSERT INTO product_media (product_id, type, url)
        VALUES (${id}, ${media.type}, ${media.url});
      `;
    }
  }

  return { updated: true };
}

// ❌ Delete a product (auto-deletes sizes/media via ON DELETE CASCADE)
export async function sqlDeleteProduct(id: number) {
  await sql`DELETE FROM products WHERE id = ${id};`;
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

// Create a new order
export async function sqlPostOrder(order: {
  customer_name: string;
  phone_number: string;
  email?: string;
  delivery_method: string;
  city: string;
  post_office: string;
  items: {
    product_id: number;
    size: string;
    quantity: number;
    price: number;
  }[];
}) {
  const inserted = await sql`
    INSERT INTO orders (
      customer_name, phone_number, email,
      delivery_method, city, post_office
    )
    VALUES (
      ${order.customer_name}, ${order.phone_number}, ${order.email || null},
      ${order.delivery_method}, ${order.city}, ${order.post_office}
    )
    RETURNING id;
  `;

  const orderId = inserted[0].id;

  for (const item of order.items) {
    await sql`
      INSERT INTO order_items (
        order_id, product_id, size, quantity, price
      ) VALUES (
        ${orderId}, ${item.product_id}, ${item.size}, ${item.quantity}, ${item.price}
      );
    `;
  }

  return { orderId };
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
