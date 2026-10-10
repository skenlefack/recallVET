-- ============================================================
-- Migration 019: Missing Columns
-- Adds missing columns to rv_tenant, rv_plan, rv_saas_payment,
-- and rv_subscription tables
-- ============================================================

-- ---- rv_tenant: address_line ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'address_line');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN address_line VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: city ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'city');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN city VARCHAR(100) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: region ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'region');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN region VARCHAR(100) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: phone ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'phone');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN phone VARCHAR(30) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_plan: stripe_price_monthly ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_plan' AND column_name = 'stripe_price_monthly');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_plan ADD COLUMN stripe_price_monthly VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_plan: stripe_price_yearly ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_plan' AND column_name = 'stripe_price_yearly');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_plan ADD COLUMN stripe_price_yearly VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_saas_payment: stripe_payment_intent_id ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_saas_payment' AND column_name = 'stripe_payment_intent_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_saas_payment ADD COLUMN stripe_payment_intent_id VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_subscription: start_date ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_subscription' AND column_name = 'start_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_subscription ADD COLUMN start_date DATE DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_subscription: end_date ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_subscription' AND column_name = 'end_date');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_subscription ADD COLUMN end_date DATE DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
