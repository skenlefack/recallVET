-- ============================================================
-- Migration 014: Stripe Integration
-- Adds Stripe identifiers to tenant and subscription tables
-- ============================================================

-- Add stripe_customer_id to rv_tenant
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'stripe_customer_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN stripe_customer_id VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add stripe columns to rv_subscription
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_subscription' AND column_name = 'stripe_subscription_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_subscription ADD COLUMN stripe_subscription_id VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_subscription' AND column_name = 'stripe_price_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_subscription ADD COLUMN stripe_price_id VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_subscription' AND column_name = 'cancel_at_period_end');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_subscription ADD COLUMN cancel_at_period_end TINYINT(1) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
