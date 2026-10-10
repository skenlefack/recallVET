CREATE TABLE IF NOT EXISTS rv_lab_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  encounter_id INT DEFAULT NULL,
  animal_id INT NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  priority ENUM('routine','urgent') DEFAULT 'routine',
  notes TEXT,
  status ENUM('requested','in_progress','completed','cancelled') DEFAULT 'requested',
  requested_by INT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id),
  FOREIGN KEY (animal_id) REFERENCES rv_animal(id)
);

CREATE TABLE IF NOT EXISTS rv_lab_result (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  tenant_id INT NOT NULL,
  parameter_name VARCHAR(100) NOT NULL,
  result_value VARCHAR(255),
  unit VARCHAR(50),
  reference_range VARCHAR(100),
  is_abnormal TINYINT(1) DEFAULT 0,
  notes TEXT,
  recorded_by INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES rv_lab_request(id),
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id)
);

CREATE TABLE IF NOT EXISTS rv_vaccination_protocol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  species_id INT DEFAULT NULL,
  vaccine_type_id INT DEFAULT NULL,
  dose_number INT DEFAULT 1,
  interval_days INT DEFAULT 0,
  age_start_weeks INT DEFAULT NULL,
  notes TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id)
);
