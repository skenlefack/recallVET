-- RecallVET Migration 006: Vaccination & Prescription
-- CLI-005: Vaccination | CLI-010: Prescription
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS rv_vaccination_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  encounter_id INT DEFAULT NULL,
  animal_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) DEFAULT NULL,
  lot_number VARCHAR(50) DEFAULT NULL,
  batch_number VARCHAR(50) DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  vaccination_date DATETIME NOT NULL,
  dose_administered DECIMAL(6,2) DEFAULT NULL,
  route ENUM('SC','IM','oral','intranasal','IV','topical') DEFAULT 'SC',
  injection_site VARCHAR(100) DEFAULT NULL,
  protocol_id INT DEFAULT NULL,
  dose_number INT DEFAULT 1,
  next_due_date DATE DEFAULT NULL,
  adverse_event TINYINT(1) DEFAULT 0,
  adverse_event_notes TEXT DEFAULT NULL,
  certificate_number VARCHAR(50) DEFAULT NULL,
  certificate_needed TINYINT(1) DEFAULT 0,
  administered_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES rv_animal(id),
  FOREIGN KEY (encounter_id) REFERENCES rv_encounter(id) ON DELETE SET NULL,
  INDEX idx_rv_vacc_tenant (tenant_id),
  INDEX idx_rv_vacc_animal (animal_id),
  INDEX idx_rv_vacc_date (vaccination_date),
  INDEX idx_rv_vacc_next (next_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_prescription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  encounter_id INT DEFAULT NULL,
  animal_id INT NOT NULL,
  party_id INT NOT NULL,
  prescriber_user_id INT NOT NULL,
  prescription_number VARCHAR(30) NOT NULL,
  prescription_date DATE NOT NULL,
  status ENUM('draft','active','dispensed','partially_dispensed','cancelled','expired') DEFAULT 'draft',
  valid_until DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES rv_animal(id),
  FOREIGN KEY (party_id) REFERENCES rv_party(id),
  FOREIGN KEY (encounter_id) REFERENCES rv_encounter(id) ON DELETE SET NULL,
  UNIQUE KEY uk_rx_number (tenant_id, prescription_number),
  INDEX idx_rv_rx_tenant (tenant_id),
  INDEX idx_rv_rx_animal (animal_id),
  INDEX idx_rv_rx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_prescription_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_id INT DEFAULT NULL,
  dosage VARCHAR(100) DEFAULT NULL,
  dosage_unit VARCHAR(30) DEFAULT NULL,
  frequency VARCHAR(100) DEFAULT NULL,
  duration_days INT DEFAULT NULL,
  quantity DECIMAL(10,2) DEFAULT NULL,
  route VARCHAR(30) DEFAULT NULL,
  instructions TEXT DEFAULT NULL,
  is_dispensed TINYINT(1) DEFAULT 0,
  FOREIGN KEY (prescription_id) REFERENCES rv_prescription(id) ON DELETE CASCADE,
  INDEX idx_rv_rxl_rx (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
