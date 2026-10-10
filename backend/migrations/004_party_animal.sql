-- RecallVET Migration 004: Party & Animal
-- CLI-001: Fiche client/proprietaire | CLI-002: Fiche animal/patient
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS rv_party (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  client_code VARCHAR(30) NOT NULL,
  party_type ENUM('individual','organization','institution','association') NOT NULL DEFAULT 'individual',
  display_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  legal_name VARCHAR(255) DEFAULT NULL,
  customer_segment ENUM('private','farm','institution','association') NOT NULL DEFAULT 'private',
  phone_primary VARCHAR(30) DEFAULT NULL,
  phone_secondary VARCHAR(30) DEFAULT NULL,
  whatsapp_number VARCHAR(30) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  country_code CHAR(2) DEFAULT 'CM',
  region VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  geo_lat DECIMAL(10,7) DEFAULT NULL,
  geo_lng DECIMAL(10,7) DEFAULT NULL,
  preferred_currency VARCHAR(3) DEFAULT 'XAF',
  credit_limit DECIMAL(12,2) DEFAULT 0,
  preferred_channel ENUM('sms','whatsapp','email','phone') DEFAULT NULL,
  data_processing_consent TINYINT(1) DEFAULT 0,
  notes TEXT DEFAULT NULL,
  status ENUM('active','inactive','blacklisted','archived') NOT NULL DEFAULT 'active',
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  UNIQUE KEY uk_party_code (tenant_id, client_code),
  INDEX idx_rv_party_tenant (tenant_id),
  INDEX idx_rv_party_name (display_name),
  INDEX idx_rv_party_phone (phone_primary),
  INDEX idx_rv_party_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_party_contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NOT NULL,
  contact_type ENUM('phone','email','whatsapp','fax','other') NOT NULL,
  contact_value VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  label VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (party_id) REFERENCES rv_party(id) ON DELETE CASCADE,
  INDEX idx_rv_pc_party (party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NOT NULL,
  address_type ENUM('home','work','farm','billing','other') NOT NULL DEFAULT 'home',
  line1 VARCHAR(255) DEFAULT NULL,
  line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  region VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country_code CHAR(2) DEFAULT 'CM',
  gps_lat DECIMAL(10,7) DEFAULT NULL,
  gps_lng DECIMAL(10,7) DEFAULT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  FOREIGN KEY (party_id) REFERENCES rv_party(id) ON DELETE CASCADE,
  INDEX idx_rv_addr_party (party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_animal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  animal_code VARCHAR(30) NOT NULL,
  owner_party_id INT NOT NULL,
  name VARCHAR(100) DEFAULT NULL,
  species_id INT NOT NULL,
  breed_id INT DEFAULT NULL,
  sex ENUM('M','F','unknown','neutered_M','neutered_F') NOT NULL DEFAULT 'unknown',
  date_of_birth DATE DEFAULT NULL,
  estimated_age_months INT DEFAULT NULL,
  color_markings VARCHAR(255) DEFAULT NULL,
  weight_kg DECIMAL(8,2) DEFAULT NULL,
  reproductive_status ENUM('intact','neutered','pregnant','lactating','unknown') DEFAULT 'unknown',
  microchip_number VARCHAR(50) DEFAULT NULL,
  tattoo_number VARCHAR(50) DEFAULT NULL,
  ear_tag_number VARCHAR(50) DEFAULT NULL,
  passport_number VARCHAR(50) DEFAULT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  allergies TEXT DEFAULT NULL,
  medical_history_summary TEXT DEFAULT NULL,
  is_alive TINYINT(1) NOT NULL DEFAULT 1,
  death_date DATE DEFAULT NULL,
  death_cause VARCHAR(255) DEFAULT NULL,
  farm_id INT DEFAULT NULL,
  herd_id INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_party_id) REFERENCES rv_party(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES rv_species(id),
  FOREIGN KEY (breed_id) REFERENCES rv_breed(id) ON DELETE SET NULL,
  UNIQUE KEY uk_animal_code (tenant_id, animal_code),
  INDEX idx_rv_animal_tenant (tenant_id),
  INDEX idx_rv_animal_owner (owner_party_id),
  INDEX idx_rv_animal_species (species_id),
  INDEX idx_rv_animal_chip (microchip_number),
  INDEX idx_rv_animal_alive (is_alive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_animal_identifier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  identifier_type ENUM('microchip','tattoo','ear_tag','passport','ring','other') NOT NULL,
  identifier_value VARCHAR(100) NOT NULL,
  applied_date DATE DEFAULT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (animal_id) REFERENCES rv_animal(id) ON DELETE CASCADE,
  INDEX idx_rv_ai_animal (animal_id),
  INDEX idx_rv_ai_value (identifier_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
