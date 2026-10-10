CREATE TABLE rv_user_invitation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'user',
  invited_by INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  status ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending',
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invitation_token (token),
  INDEX idx_invitation_tenant (tenant_id),
  INDEX idx_invitation_email (email),
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id),
  FOREIGN KEY (invited_by) REFERENCES rv_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
