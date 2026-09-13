-- RecallVET Migration 008: Farm Module
-- FRM-001, FRM-003, FRM-004, FRM-005
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS rv_farm (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  owner_party_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  farm_code VARCHAR(30) DEFAULT NULL,
  farm_type ENUM('livestock','mixed','poultry','dairy','aquaculture','apiculture') DEFAULT 'mixed',
  total_area_ha DECIMAL(10,2) DEFAULT NULL,
  gps_lat DECIMAL(10,7) DEFAULT NULL,
  gps_lng DECIMAL(10,7) DEFAULT NULL,
  address_line VARCHAR(500) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  region VARCHAR(100) DEFAULT NULL,
  country_code CHAR(2) DEFAULT 'CM',
  registration_number VARCHAR(100) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_party_id) REFERENCES rv_party(id),
  INDEX idx_rv_farm_tenant (tenant_id),
  INDEX idx_rv_farm_owner (owner_party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_herd_lot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  farm_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  species_id INT DEFAULT NULL,
  breed_id INT DEFAULT NULL,
  purpose ENUM('breeding','fattening','dairy','layer','mixed','other') DEFAULT 'mixed',
  head_count INT DEFAULT 0,
  avg_age_months INT DEFAULT NULL,
  housing_type VARCHAR(100) DEFAULT NULL,
  identification_method VARCHAR(100) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (farm_id) REFERENCES rv_farm(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES rv_species(id),
  FOREIGN KEY (breed_id) REFERENCES rv_breed(id) ON DELETE SET NULL,
  INDEX idx_rv_herd_tenant (tenant_id),
  INDEX idx_rv_herd_farm (farm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_farm_visit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  farm_id INT NOT NULL,
  vet_user_id INT NOT NULL,
  visit_date DATE NOT NULL,
  visit_type ENUM('routine','emergency','vaccination_campaign','inspection','follow_up','advisory') DEFAULT 'routine',
  herds_inspected JSON DEFAULT NULL,
  general_findings TEXT DEFAULT NULL,
  recommendations TEXT DEFAULT NULL,
  follow_up_date DATE DEFAULT NULL,
  follow_up_notes TEXT DEFAULT NULL,
  status ENUM('planned','in_progress','completed','report_sent') DEFAULT 'planned',
  report_url VARCHAR(500) DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (farm_id) REFERENCES rv_farm(id) ON DELETE CASCADE,
  INDEX idx_rv_fv_tenant (tenant_id),
  INDEX idx_rv_fv_farm (farm_id),
  INDEX idx_rv_fv_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_health_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  farm_id INT NOT NULL,
  herd_lot_id INT DEFAULT NULL,
  event_date DATE NOT NULL,
  event_type ENUM('disease_outbreak','mortality','abortion','treatment','vaccination_mass','quarantine','test_result','observation') DEFAULT 'observation',
  disease_suspected VARCHAR(255) DEFAULT NULL,
  animals_affected INT DEFAULT 0,
  animals_dead INT DEFAULT 0,
  symptoms TEXT DEFAULT NULL,
  actions_taken TEXT DEFAULT NULL,
  reported_to_authorities TINYINT(1) DEFAULT 0,
  report_date DATE DEFAULT NULL,
  notifiable_disease TINYINT(1) DEFAULT 0,
  lab_results TEXT DEFAULT NULL,
  status ENUM('active','monitoring','resolved','escalated') DEFAULT 'active',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (farm_id) REFERENCES rv_farm(id) ON DELETE CASCADE,
  FOREIGN KEY (herd_lot_id) REFERENCES rv_herd_lot(id) ON DELETE SET NULL,
  INDEX idx_rv_he_tenant (tenant_id),
  INDEX idx_rv_he_farm (farm_id),
  INDEX idx_rv_he_date (event_date),
  INDEX idx_rv_he_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
