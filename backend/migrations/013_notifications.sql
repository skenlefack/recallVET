CREATE TABLE rv_notification (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSON,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user_read (user_id, is_read),
  INDEX idx_notif_tenant_user (tenant_id, user_id),
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id),
  FOREIGN KEY (user_id) REFERENCES rv_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rv_notification_preference (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'in_app',
  event_type VARCHAR(50) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uk_user_channel_event (user_id, channel, event_type),
  FOREIGN KEY (user_id) REFERENCES rv_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
