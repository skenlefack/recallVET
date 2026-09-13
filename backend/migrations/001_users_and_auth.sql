-- RecallVET Migration 001: Users and Authentication
-- Standalone user system (independent from AfricaVET)

CREATE TABLE IF NOT EXISTS rv_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  role ENUM('user','admin','superadmin') NOT NULL DEFAULT 'user',
  email_verified TINYINT(1) DEFAULT 0,
  email_verified_at DATETIME DEFAULT NULL,
  status ENUM('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
  avatar_url VARCHAR(500) DEFAULT NULL,
  preferred_language VARCHAR(5) DEFAULT 'fr',
  last_login_at DATETIME DEFAULT NULL,
  last_login_ip VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rv_users_email (email),
  INDEX idx_rv_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES rv_users(id) ON DELETE CASCADE,
  INDEX idx_rv_rt_token (token(255)),
  INDEX idx_rv_rt_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES rv_users(id) ON DELETE CASCADE,
  INDEX idx_rv_pr_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed superadmin user (password: Admin@2024)
INSERT INTO rv_users (email, password_hash, first_name, last_name, role, status, email_verified)
VALUES ('admin@recallvet.com', '$2a$10$OO3rT3nEHkfntgAg6bCsqODHgWp5zSmxPrH2Lh9VqiMunZMqt77qa', 'Super', 'Admin', 'superadmin', 'active', 1)
ON DUPLICATE KEY UPDATE id=id;
