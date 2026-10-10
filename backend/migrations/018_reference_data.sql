-- ============================================================
-- Migration 018: Reference Data Management
-- Diseases, clinical signs, vaccine types, diagnosis codes, units
-- ============================================================

-- Diseases reference
CREATE TABLE IF NOT EXISTS rv_disease (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  code VARCHAR(20) NOT NULL,
  name_fr VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) DEFAULT NULL,
  category ENUM('infectious','parasitic','metabolic','genetic','traumatic','neoplastic','other') DEFAULT 'other',
  species_applicable JSON DEFAULT NULL,
  is_notifiable TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_disease_tenant (tenant_id),
  INDEX idx_disease_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clinical signs / symptoms
CREATE TABLE IF NOT EXISTS rv_clinical_sign (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  name_fr VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) DEFAULT NULL,
  category ENUM('general','digestive','respiratory','cardiovascular','neurological','dermatological','musculoskeletal','urogenital','ophthalmic','other') DEFAULT 'general',
  is_active TINYINT(1) DEFAULT 1,
  INDEX idx_sign_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Disease ↔ Clinical sign mapping
CREATE TABLE IF NOT EXISTS rv_disease_sign (
  disease_id INT NOT NULL,
  sign_id INT NOT NULL,
  PRIMARY KEY (disease_id, sign_id),
  FOREIGN KEY (disease_id) REFERENCES rv_disease(id) ON DELETE CASCADE,
  FOREIGN KEY (sign_id) REFERENCES rv_clinical_sign(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vaccine types
CREATE TABLE IF NOT EXISTS rv_vaccine_type (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  name_fr VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) DEFAULT NULL,
  species_applicable JSON DEFAULT NULL,
  protocol TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  INDEX idx_vaccine_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diagnosis codes (ex: veterinary ICD-like codes)
CREATE TABLE IF NOT EXISTS rv_diagnosis_code (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  code VARCHAR(20) NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) DEFAULT NULL,
  category VARCHAR(50) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  INDEX idx_diag_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Units of measurement
CREATE TABLE IF NOT EXISTS rv_unit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  code VARCHAR(20) NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) DEFAULT NULL,
  category ENUM('weight','volume','length','count','time','concentration') DEFAULT 'count',
  is_active TINYINT(1) DEFAULT 1,
  INDEX idx_unit_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add tenant_id to existing species and breed tables for tenant-specific entries
-- (existing entries have tenant_id NULL = global)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_species' AND column_name = 'tenant_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_species ADD COLUMN tenant_id INT DEFAULT NULL AFTER id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_breed' AND column_name = 'tenant_id');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_breed ADD COLUMN tenant_id INT DEFAULT NULL AFTER id', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'rv_species' AND column_name = 'sort_order');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE rv_species ADD COLUMN sort_order INT DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── Seed: Common diseases ──
INSERT INTO rv_disease (code, name_fr, name_en, category, is_notifiable) VALUES
('RAGE', 'Rage', 'Rabies', 'infectious', 1),
('PARVO', 'Parvovirose', 'Parvovirus', 'infectious', 0),
('LEPTO', 'Leptospirose', 'Leptospirosis', 'infectious', 1),
('MALADIE_CARRE', 'Maladie de Carré', 'Canine Distemper', 'infectious', 0),
('EHRLICH', 'Ehrlichiose', 'Ehrlichiosis', 'parasitic', 0),
('BABESIOSE', 'Babésiose', 'Babesiosis', 'parasitic', 0),
('LEISHMANIOSE', 'Leishmaniose', 'Leishmaniasis', 'parasitic', 1),
('DERMATOPHYTOSE', 'Dermatophytose (Teigne)', 'Dermatophytosis', 'infectious', 0),
('GALE', 'Gale', 'Mange/Scabies', 'parasitic', 0),
('FPV', 'Typhus du chat (Panleucopénie)', 'Feline Panleukopenia', 'infectious', 0),
('CALICI', 'Calicivirose féline', 'Feline Calicivirus', 'infectious', 0),
('CORYZA', 'Coryza', 'Feline Upper Respiratory', 'infectious', 0),
('FIEVRE_APHTEUSE', 'Fièvre aphteuse', 'Foot and Mouth Disease', 'infectious', 1),
('BRUCELLOSE', 'Brucellose', 'Brucellosis', 'infectious', 1),
('TUBERCULOSE', 'Tuberculose bovine', 'Bovine Tuberculosis', 'infectious', 1),
('CHARBON', 'Charbon bactéridien', 'Anthrax', 'infectious', 1),
('PPESTE_PR', 'Peste des petits ruminants', 'Peste des Petits Ruminants', 'infectious', 1),
('NEWCASTLE', 'Maladie de Newcastle', 'Newcastle Disease', 'infectious', 1),
('GRIPPE_AV', 'Grippe aviaire', 'Avian Influenza', 'infectious', 1),
('COCCIDIOSE', 'Coccidiose', 'Coccidiosis', 'parasitic', 0),
('TRYPANOSOMOSE', 'Trypanosomose', 'Trypanosomiasis', 'parasitic', 1),
('THEILERIOSE', 'Theilériose', 'Theileriosis', 'parasitic', 0),
('MAMMITE', 'Mammite', 'Mastitis', 'infectious', 0),
('METEORISME', 'Météorisme', 'Bloat', 'metabolic', 0),
('ACIDOSE', 'Acidose ruminale', 'Ruminal Acidosis', 'metabolic', 0)
ON DUPLICATE KEY UPDATE id=id;

-- ── Seed: Clinical signs ──
INSERT INTO rv_clinical_sign (name_fr, name_en, category) VALUES
('Fièvre', 'Fever', 'general'),
('Anorexie / Perte d''appétit', 'Anorexia / Loss of appetite', 'general'),
('Abattement / Léthargie', 'Lethargy / Depression', 'general'),
('Perte de poids', 'Weight loss', 'general'),
('Déshydratation', 'Dehydration', 'general'),
('Vomissement', 'Vomiting', 'digestive'),
('Diarrhée', 'Diarrhea', 'digestive'),
('Diarrhée hémorragique', 'Hemorrhagic diarrhea', 'digestive'),
('Constipation', 'Constipation', 'digestive'),
('Ballonnement abdominal', 'Abdominal distension', 'digestive'),
('Toux', 'Cough', 'respiratory'),
('Dyspnée (difficulté respiratoire)', 'Dyspnea', 'respiratory'),
('Jetage nasal', 'Nasal discharge', 'respiratory'),
('Éternuements', 'Sneezing', 'respiratory'),
('Ictère (jaunisse)', 'Jaundice / Icterus', 'general'),
('Anémie (muqueuses pâles)', 'Anemia / Pale mucous membranes', 'cardiovascular'),
('Convulsions', 'Seizures', 'neurological'),
('Paralysie', 'Paralysis', 'neurological'),
('Ataxie (incoordination)', 'Ataxia', 'neurological'),
('Agressivité inhabituelle', 'Unusual aggression', 'neurological'),
('Prurit (démangeaisons)', 'Pruritus / Itching', 'dermatological'),
('Alopécie (perte de poils)', 'Alopecia / Hair loss', 'dermatological'),
('Lésions cutanées / Croûtes', 'Skin lesions / Crusts', 'dermatological'),
('Boiterie', 'Lameness', 'musculoskeletal'),
('Gonflement articulaire', 'Joint swelling', 'musculoskeletal'),
('Salivation excessive', 'Excessive salivation', 'digestive'),
('Écoulement oculaire', 'Ocular discharge', 'ophthalmic'),
('Conjonctivite', 'Conjunctivitis', 'ophthalmic'),
('Polyurie / Polydipsie', 'Polyuria / Polydipsia', 'urogenital'),
('Avortement', 'Abortion', 'urogenital'),
('Baisse de production laitière', 'Decreased milk production', 'general'),
('Mortalité subite', 'Sudden death', 'general')
ON DUPLICATE KEY UPDATE id=id;

-- ── Seed: Vaccine types ──
INSERT INTO rv_vaccine_type (name_fr, name_en, species_applicable) VALUES
('Vaccin antirabique', 'Rabies vaccine', '["CAN","FEL","BOV","EQU"]'),
('DHPP (Carré, Hépatite, Parvo, Parainfluenza)', 'DHPP vaccine', '["CAN"]'),
('Leptospirose', 'Leptospirosis vaccine', '["CAN"]'),
('Leucose féline (FeLV)', 'FeLV vaccine', '["FEL"]'),
('Typhus félin', 'Feline Panleukopenia vaccine', '["FEL"]'),
('Coryza félin', 'Feline Rhinotracheitis vaccine', '["FEL"]'),
('Charbon bactéridien', 'Anthrax vaccine', '["BOV","OVI","CAP"]'),
('Fièvre aphteuse', 'FMD vaccine', '["BOV","OVI","CAP","SUI"]'),
('Peste des petits ruminants', 'PPR vaccine', '["OVI","CAP"]'),
('Newcastle', 'Newcastle vaccine', '["GAL"]'),
('Gumboro', 'IBD vaccine', '["GAL"]'),
('Bronchite infectieuse', 'IB vaccine', '["GAL"]')
ON DUPLICATE KEY UPDATE id=id;

-- ── Seed: Units ──
INSERT INTO rv_unit (code, name_fr, name_en, category) VALUES
('mg', 'Milligramme', 'Milligram', 'weight'),
('g', 'Gramme', 'Gram', 'weight'),
('kg', 'Kilogramme', 'Kilogram', 'weight'),
('ml', 'Millilitre', 'Milliliter', 'volume'),
('L', 'Litre', 'Liter', 'volume'),
('cp', 'Comprimé', 'Tablet', 'count'),
('gel', 'Gélule', 'Capsule', 'count'),
('amp', 'Ampoule', 'Ampoule', 'count'),
('fl', 'Flacon', 'Vial', 'count'),
('dose', 'Dose', 'Dose', 'count'),
('UI', 'Unité internationale', 'International Unit', 'concentration'),
('mg/kg', 'mg par kg', 'mg per kg', 'concentration'),
('ml/kg', 'ml par kg', 'ml per kg', 'concentration'),
('j', 'Jour', 'Day', 'time'),
('sem', 'Semaine', 'Week', 'time'),
('mois', 'Mois', 'Month', 'time')
ON DUPLICATE KEY UPDATE id=id;

-- ── Seed: Diagnosis codes ──
INSERT INTO rv_diagnosis_code (code, name_fr, name_en, category) VALUES
('DIG-001', 'Gastro-entérite', 'Gastroenteritis', 'digestive'),
('DIG-002', 'Obstruction intestinale', 'Intestinal obstruction', 'digestive'),
('DIG-003', 'Pancréatite', 'Pancreatitis', 'digestive'),
('RESP-001', 'Pneumonie', 'Pneumonia', 'respiratory'),
('RESP-002', 'Bronchite', 'Bronchitis', 'respiratory'),
('DERM-001', 'Dermatite allergique', 'Allergic dermatitis', 'dermatological'),
('DERM-002', 'Pyodermite', 'Pyoderma', 'dermatological'),
('DERM-003', 'Otite externe', 'Otitis externa', 'dermatological'),
('MUSC-001', 'Arthrose', 'Osteoarthritis', 'musculoskeletal'),
('MUSC-002', 'Fracture', 'Fracture', 'musculoskeletal'),
('MUSC-003', 'Luxation', 'Luxation', 'musculoskeletal'),
('URO-001', 'Insuffisance rénale', 'Renal failure', 'urogenital'),
('URO-002', 'Cystite', 'Cystitis', 'urogenital'),
('CARD-001', 'Insuffisance cardiaque', 'Heart failure', 'cardiovascular'),
('NEUR-001', 'Épilepsie', 'Epilepsy', 'neurological'),
('OPHT-001', 'Ulcère cornéen', 'Corneal ulcer', 'ophthalmic'),
('ENDO-001', 'Diabète sucré', 'Diabetes mellitus', 'endocrine'),
('ENDO-002', 'Hypothyroïdie', 'Hypothyroidism', 'endocrine'),
('REPRO-001', 'Pyomètre', 'Pyometra', 'reproductive'),
('REPRO-002', 'Dystocie', 'Dystocia', 'reproductive')
ON DUPLICATE KEY UPDATE id=id;
