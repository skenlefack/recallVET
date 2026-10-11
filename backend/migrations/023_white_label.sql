-- ============================================================
-- Migration 023: White-Label Support
-- Adds branding/customization columns to rv_tenant for
-- Enterprise white-label features
-- ============================================================

-- ---- rv_tenant: primary_color ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'primary_color');
SET @sql = IF(@col_exists = 0, "ALTER TABLE rv_tenant ADD COLUMN primary_color VARCHAR(7) DEFAULT '#2563eb'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: secondary_color ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'secondary_color');
SET @sql = IF(@col_exists = 0, "ALTER TABLE rv_tenant ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#1e40af'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: custom_domain ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'custom_domain');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN custom_domain VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: email_footer ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'email_footer');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN email_footer TEXT DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---- rv_tenant: login_banner_url ----
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_tenant' AND column_name = 'login_banner_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_tenant ADD COLUMN login_banner_url VARCHAR(500) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
