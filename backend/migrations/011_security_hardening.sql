-- ============================================================
-- Migration 011: Security Hardening
-- Adds account lockout fields, audit indexes
-- ============================================================

-- Account lockout columns (idempotent)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_users' AND column_name = 'failed_login_attempts');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_users' AND column_name = 'locked_until');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_users ADD COLUMN locked_until DATETIME DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
