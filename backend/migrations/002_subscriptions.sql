-- RecallVET Migration 002: SaaS Subscription & Billing

CREATE TABLE IF NOT EXISTS rv_plan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_fr TEXT DEFAULT NULL,
  description_en TEXT DEFAULT NULL,
  price_monthly DECIMAL(12,2) NOT NULL,
  price_yearly DECIMAL(12,2) DEFAULT NULL,
  currency VARCHAR(3) DEFAULT 'XAF',
  max_users INT DEFAULT 1,
  max_animals INT DEFAULT NULL,
  max_structures INT DEFAULT 1,
  features JSON DEFAULT NULL,
  trial_days INT DEFAULT 14,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed plans
INSERT INTO rv_plan (code, name_fr, name_en, description_fr, description_en, price_monthly, price_yearly, max_users, max_animals, max_structures, features, trial_days, sort_order) VALUES
('starter', 'Starter', 'Starter',
 'Ideal pour les cabinets veterinaires individuels', 'Ideal for individual veterinary practices',
 15000, 150000, 2, 500, 1,
 '{"clinic": true, "farm": false, "pharmacy": false, "reports": false}', 14, 1),
('professional', 'Professionnel', 'Professional',
 'Pour les cliniques veterinaires avec pharmacie et suivi elevage', 'For veterinary clinics with pharmacy and farm monitoring',
 35000, 350000, 5, NULL, 3,
 '{"clinic": true, "farm": true, "pharmacy": true, "reports": true}', 14, 2),
('enterprise', 'Entreprise', 'Enterprise',
 'Pour les grands reseaux veterinaires et les organisations', 'For large veterinary networks and organizations',
 75000, 750000, -1, NULL, -1,
 '{"clinic": true, "farm": true, "pharmacy": true, "reports": true, "api_access": true, "priority_support": true}', 30, 3)
ON DUPLICATE KEY UPDATE id=id;
