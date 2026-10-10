-- ============================================================
-- Migration 022: Stripe Billing Enhancements
-- Adds stripe_invoice_id to rv_saas_invoice and seeds
-- placeholder Stripe price IDs on rv_plan
-- ============================================================

-- ---- rv_saas_invoice: stripe_invoice_id ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_saas_invoice' AND column_name = 'stripe_invoice_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_saas_invoice ADD COLUMN stripe_invoice_id VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index on stripe_invoice_id for webhook lookups
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'rv_saas_invoice' AND index_name = 'idx_rv_sinv_stripe');
SET @sql = IF(@idx_exists = 0, 'CREATE INDEX idx_rv_sinv_stripe ON rv_saas_invoice (stripe_invoice_id)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================================
-- Stripe Price ID Seeds
-- IMPORTANT: Replace these with your actual Stripe Price IDs from your Stripe Dashboard
-- To get these: Stripe Dashboard > Products > Select product > Copy Price ID (starts with price_)
-- ============================================================
UPDATE rv_plan SET stripe_price_monthly = 'price_starter_monthly_REPLACE_ME', stripe_price_yearly = 'price_starter_yearly_REPLACE_ME' WHERE code = 'starter';
UPDATE rv_plan SET stripe_price_monthly = 'price_pro_monthly_REPLACE_ME', stripe_price_yearly = 'price_pro_yearly_REPLACE_ME' WHERE code = 'professional';
UPDATE rv_plan SET stripe_price_monthly = 'price_enterprise_monthly_REPLACE_ME', stripe_price_yearly = 'price_enterprise_yearly_REPLACE_ME' WHERE code = 'enterprise';
