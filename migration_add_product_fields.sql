-- Migration to add new fields to products table
-- Run this SQL in your database to add the new fields

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN products.old_price IS 'Original price before discount';
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (e.g., 20 for 20%)';
COMMENT ON COLUMN products.priority IS 'Display priority (0 = normal, 1 = high priority)';
