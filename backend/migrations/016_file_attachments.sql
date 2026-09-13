CREATE TABLE rv_attachment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attachment_entity (tenant_id, entity_type, entity_id),
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id),
  FOREIGN KEY (uploaded_by) REFERENCES rv_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
