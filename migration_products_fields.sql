-- Migration script for adding new product fields
-- Run this on your production database

-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN products.old_price IS 'Original price before discount';
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (e.g., 20 for 20%)';
COMMENT ON COLUMN products.priority IS 'Display priority (0 = normal, 1+ = high priority)';

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('old_price', 'discount_percentage', 'priority')
ORDER BY column_name;
