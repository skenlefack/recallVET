-- RecallVET Migration 009: Invoicing & Payments
-- CLI-011: Facturation clinique
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS rv_invoice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  site_id INT DEFAULT NULL,
  party_id INT NOT NULL,
  animal_id INT DEFAULT NULL,
  encounter_id INT DEFAULT NULL,
  invoice_number VARCHAR(30) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE DEFAULT NULL,
  subtotal DECIMAL(14,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'XAF',
  status ENUM('draft','sent','paid','partially_paid','overdue','cancelled','refunded') DEFAULT 'draft',
  notes TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES rv_party(id),
  UNIQUE KEY uk_inv_number (tenant_id, invoice_number),
  INDEX idx_rv_inv_tenant (tenant_id),
  INDEX idx_rv_inv_status (status),
  INDEX idx_rv_inv_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_invoice_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(14,2) DEFAULT 0,
  reference_type ENUM('consultation','vaccination','product','service','hospitalization','surgery','lab','other') DEFAULT 'service',
  reference_id INT DEFAULT NULL,
  FOREIGN KEY (invoice_id) REFERENCES rv_invoice(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_payment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  invoice_id INT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  payment_method ENUM('cash','card','mobile_money','cheque','bank_transfer','credit') DEFAULT 'cash',
  payment_reference VARCHAR(100) DEFAULT NULL,
  payment_date DATETIME NOT NULL,
  received_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES rv_invoice(id),
  INDEX idx_rv_pay_tenant (tenant_id),
  INDEX idx_rv_pay_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
