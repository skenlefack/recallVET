-- Push notification device tokens for mobile apps
CREATE TABLE IF NOT EXISTS rv_device_token (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  token VARCHAR(512) NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL DEFAULT 'android',
  device_name VARCHAR(100) DEFAULT NULL,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token (token),
  INDEX idx_user (user_id),
  INDEX idx_tenant (tenant_id),
  FOREIGN KEY (user_id) REFERENCES rv_users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
