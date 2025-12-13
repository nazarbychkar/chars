-- ========================================
-- PostgreSQL Indexes for Performance Optimization
-- ========================================
-- Execute this file to add all necessary indexes
-- Run: psql $DATABASE_URL -f database/indexes.sql

-- ========================================
-- PRODUCTS TABLE INDEXES
-- ========================================

-- Category filtering (very common)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Subcategory filtering
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);

-- Top sale products (partial index for better performance)
CREATE INDEX IF NOT EXISTS idx_products_top_sale ON products(top_sale) WHERE top_sale = true;

-- Limited edition products (partial index)
CREATE INDEX IF NOT EXISTS idx_products_limited ON products(limited_edition) WHERE limited_edition = true;

-- Sorting by creation date (most common sort order)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Product name search
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Season array search (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_products_season_gin ON products USING GIN (season);

-- ========================================
-- PRODUCT MEDIA/SIZES/COLORS INDEXES
-- ========================================

-- Media lookups (composite index for product_id + ordering)
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id, id);

-- Sizes lookups
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);

-- Sizes stock updates (composite for WHERE product_id = X AND size = Y)
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_size ON product_sizes(product_id, size);

-- Sizes stock updates (composite for WHERE product_id = X AND size = Y)
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_size ON product_sizes(product_id, size);

-- Colors lookups
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);

-- ========================================
-- SUBCATEGORIES INDEXES
-- ========================================

-- Case-insensitive name search (expression index)
CREATE INDEX IF NOT EXISTS idx_subcategories_name_lower ON subcategories (LOWER(name));

-- ========================================
-- ORDERS INDEXES
-- ========================================

-- Payment status filtering (very common)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Invoice ID lookups (for webhooks, unique should already have index)
CREATE INDEX IF NOT EXISTS idx_orders_invoice_id ON orders(invoice_id);

-- Order items by order_id (very common JOIN)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Order items by product_id (for analytics/reports)
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ========================================
-- ANALYZE TABLES (update statistics)
-- ========================================

ANALYZE products;
ANALYZE product_media;
ANALYZE product_sizes;
ANALYZE product_colors;
ANALYZE orders;
ANALYZE order_items;
ANALYZE categories;
ANALYZE subcategories;

