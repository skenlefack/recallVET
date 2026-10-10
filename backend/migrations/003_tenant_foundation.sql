-- RecallVET Migration 003: Tenant Foundation
-- Multi-tenant core tables, species/breed reference data

CREATE TABLE IF NOT EXISTS rv_tenant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url VARCHAR(500) DEFAULT NULL,
  default_currency VARCHAR(3) DEFAULT 'XAF',
  default_language VARCHAR(5) DEFAULT 'fr',
  country_code CHAR(2) DEFAULT 'CM',
  timezone VARCHAR(50) DEFAULT 'Africa/Douala',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rv_tenant_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_subscription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('trialing','active','past_due','cancelled','expired') NOT NULL DEFAULT 'trialing',
  billing_cycle ENUM('monthly','yearly') DEFAULT 'monthly',
  trial_starts_at DATE DEFAULT NULL,
  trial_ends_at DATE DEFAULT NULL,
  current_period_start DATE DEFAULT NULL,
  current_period_end DATE DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  cancellation_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES rv_plan(id),
  INDEX idx_rv_sub_tenant (tenant_id),
  INDEX idx_rv_sub_status (status),
  INDEX idx_rv_sub_trial_end (trial_ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_saas_invoice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id INT NOT NULL,
  tenant_id INT NOT NULL,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'XAF',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  due_date DATE NOT NULL,
  paid_at DATETIME DEFAULT NULL,
  pdf_url VARCHAR(500) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES rv_subscription(id),
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_sinv_tenant (tenant_id),
  INDEX idx_rv_sinv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_saas_payment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('mobile_money','bank_transfer','card','cash') DEFAULT 'mobile_money',
  payment_reference VARCHAR(255) DEFAULT NULL,
  payment_date DATETIME NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES rv_saas_invoice(id),
  INDEX idx_rv_spay_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_structure (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('clinic','pharmacy','farm_practice','mixed') DEFAULT 'mixed',
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_structure_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_site (
  id INT AUTO_INCREMENT PRIMARY KEY,
  structure_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  gps_lat DECIMAL(10,7) DEFAULT NULL,
  gps_lng DECIMAL(10,7) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (structure_id) REFERENCES rv_structure(id) ON DELETE CASCADE,
  INDEX idx_rv_site_structure (structure_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_user_tenant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  structure_id INT DEFAULT NULL,
  site_id INT DEFAULT NULL,
  role ENUM('owner','vet','assistant','pharmacist','receptionist','farm_tech','admin') NOT NULL DEFAULT 'vet',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES rv_users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (structure_id) REFERENCES rv_structure(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES rv_site(id) ON DELETE SET NULL,
  UNIQUE KEY uk_rv_user_tenant (user_id, tenant_id),
  INDEX idx_rv_ut_user (user_id),
  INDEX idx_rv_ut_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT DEFAULT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSON DEFAULT NULL,
  new_values JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rv_audit_tenant (tenant_id),
  INDEX idx_rv_audit_entity (entity_type, entity_id),
  INDEX idx_rv_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reference data: Species
CREATE TABLE IF NOT EXISTS rv_species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  category ENUM('companion','livestock','equine','exotic','poultry','aquatic') DEFAULT 'companion',
  is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rv_species (code, name_fr, name_en, category) VALUES
('CAN', 'Chien', 'Dog', 'companion'),
('FEL', 'Chat', 'Cat', 'companion'),
('EQU', 'Cheval', 'Horse', 'equine'),
('BOV', 'Bovin', 'Cattle', 'livestock'),
('OVI', 'Ovin', 'Sheep', 'livestock'),
('CAP', 'Caprin', 'Goat', 'livestock'),
('SUI', 'Porcin', 'Pig', 'livestock'),
('GAL', 'Poule/Poulet', 'Chicken', 'poultry'),
('LAP', 'Lapin', 'Rabbit', 'livestock'),
('ASI', 'Ane', 'Donkey', 'equine'),
('CAM', 'Chameau/Dromadaire', 'Camel', 'livestock'),
('AUT', 'Autre', 'Other', 'exotic')
ON DUPLICATE KEY UPDATE id=id;

-- Reference data: Breeds
CREATE TABLE IF NOT EXISTS rv_breed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  species_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  FOREIGN KEY (species_id) REFERENCES rv_species(id) ON DELETE CASCADE,
  UNIQUE KEY uk_rv_breed (species_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='CAN'), 'BGER', 'Berger Allemand', 'German Shepherd'),
((SELECT id FROM rv_species WHERE code='CAN'), 'LABR', 'Labrador', 'Labrador Retriever'),
((SELECT id FROM rv_species WHERE code='CAN'), 'ROTT', 'Rottweiler', 'Rottweiler'),
((SELECT id FROM rv_species WHERE code='CAN'), 'PITT', 'Pitbull', 'Pitbull'),
((SELECT id FROM rv_species WHERE code='CAN'), 'LOCL', 'Race locale', 'Local breed'),
((SELECT id FROM rv_species WHERE code='FEL'), 'PERS', 'Persan', 'Persian'),
((SELECT id FROM rv_species WHERE code='FEL'), 'SIAM', 'Siamois', 'Siamese'),
((SELECT id FROM rv_species WHERE code='FEL'), 'LOCL', 'Race locale', 'Local breed'),
((SELECT id FROM rv_species WHERE code='BOV'), 'ZEBU', 'Zebu', 'Zebu'),
((SELECT id FROM rv_species WHERE code='BOV'), 'NDMA', 'Ndama', 'Ndama'),
((SELECT id FROM rv_species WHERE code='BOV'), 'HOLS', 'Holstein', 'Holstein'),
((SELECT id FROM rv_species WHERE code='BOV'), 'BRAH', 'Brahman', 'Brahman'),
((SELECT id FROM rv_species WHERE code='BOV'), 'LOCL', 'Race locale', 'Local breed'),
((SELECT id FROM rv_species WHERE code='OVI'), 'DJAL', 'Djallonke', 'Djallonke'),
((SELECT id FROM rv_species WHERE code='OVI'), 'LOCL', 'Race locale', 'Local breed'),
((SELECT id FROM rv_species WHERE code='CAP'), 'NAIN', 'Chevre naine', 'Dwarf goat'),
((SELECT id FROM rv_species WHERE code='CAP'), 'LOCL', 'Race locale', 'Local breed'),
((SELECT id FROM rv_species WHERE code='GAL'), 'BROI', 'Poulet de chair', 'Broiler'),
((SELECT id FROM rv_species WHERE code='GAL'), 'POND', 'Poule pondeuse', 'Layer'),
((SELECT id FROM rv_species WHERE code='GAL'), 'LOCL', 'Race locale', 'Local breed')
ON DUPLICATE KEY UPDATE id=id;
