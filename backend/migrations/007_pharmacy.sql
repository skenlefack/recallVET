-- RecallVET Migration 007: Pharmacy Module
-- PHA-001 to PHA-008: Products, Stock, Dispensing, Sales
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS rv_product_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT DEFAULT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) DEFAULT NULL,
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_pcat_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  category_id INT DEFAULT NULL,
  sku VARCHAR(50) DEFAULT NULL,
  barcode VARCHAR(50) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  unit ENUM('unit','box','bottle','vial','kg','g','ml','l','dose','tablet','sachet') DEFAULT 'unit',
  unit_price DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'XAF',
  vat_rate DECIMAL(5,2) DEFAULT 0,
  is_prescription_only TINYINT(1) DEFAULT 0,
  is_vaccine TINYINT(1) DEFAULT 0,
  species_applicable JSON DEFAULT NULL,
  storage_conditions VARCHAR(255) DEFAULT NULL,
  reorder_level INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES rv_product_category(id) ON DELETE SET NULL,
  INDEX idx_rv_prod_tenant (tenant_id),
  INDEX idx_rv_prod_sku (sku),
  INDEX idx_rv_prod_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  address_line VARCHAR(500) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  country_code CHAR(2) DEFAULT 'CM',
  tax_id VARCHAR(50) DEFAULT NULL,
  payment_terms_days INT DEFAULT 30,
  notes TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_supp_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_product_supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  supplier_id INT NOT NULL,
  supplier_sku VARCHAR(50) DEFAULT NULL,
  unit_cost DECIMAL(12,2) DEFAULT NULL,
  currency VARCHAR(3) DEFAULT 'XAF',
  lead_time_days INT DEFAULT NULL,
  is_preferred TINYINT(1) DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES rv_product(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES rv_supplier(id) ON DELETE CASCADE,
  UNIQUE KEY uk_prod_supp (product_id, supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_stock_location (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  site_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  location_type ENUM('main_store','dispensary','fridge','quarantine','mobile') DEFAULT 'main_store',
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (site_id) REFERENCES rv_site(id) ON DELETE SET NULL,
  INDEX idx_rv_sloc_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_purchase_order (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  po_number VARCHAR(30) NOT NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE DEFAULT NULL,
  status ENUM('draft','submitted','partially_received','received','cancelled') DEFAULT 'draft',
  total_amount DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'XAF',
  notes TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  approved_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES rv_supplier(id),
  UNIQUE KEY uk_po_number (tenant_id, po_number),
  INDEX idx_rv_po_tenant (tenant_id),
  INDEX idx_rv_po_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_purchase_order_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity_ordered DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  quantity_received DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES rv_purchase_order(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_goods_receipt (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  po_id INT DEFAULT NULL,
  supplier_id INT DEFAULT NULL,
  receipt_number VARCHAR(30) NOT NULL,
  receipt_date DATE NOT NULL,
  received_by INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (po_id) REFERENCES rv_purchase_order(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES rv_supplier(id),
  UNIQUE KEY uk_gr_number (tenant_id, receipt_number),
  INDEX idx_rv_gr_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_goods_receipt_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id INT NOT NULL,
  product_id INT NOT NULL,
  lot_number VARCHAR(50) DEFAULT NULL,
  batch_number VARCHAR(50) DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  quantity_received DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  location_id INT DEFAULT NULL,
  FOREIGN KEY (receipt_id) REFERENCES rv_goods_receipt(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id),
  FOREIGN KEY (location_id) REFERENCES rv_stock_location(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_stock_lot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  product_id INT NOT NULL,
  location_id INT NOT NULL,
  lot_number VARCHAR(50) DEFAULT NULL,
  batch_number VARCHAR(50) DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  quantity_on_hand DECIMAL(10,2) DEFAULT 0,
  quantity_reserved DECIMAL(10,2) DEFAULT 0,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  receipt_id INT DEFAULT NULL,
  status ENUM('available','expired','recalled','quarantine') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id),
  FOREIGN KEY (location_id) REFERENCES rv_stock_location(id),
  FOREIGN KEY (receipt_id) REFERENCES rv_goods_receipt(id) ON DELETE SET NULL,
  INDEX idx_rv_sl_tenant (tenant_id),
  INDEX idx_rv_sl_product (product_id),
  INDEX idx_rv_sl_expiry (expiry_date),
  INDEX idx_rv_sl_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_stock_movement (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  product_id INT NOT NULL,
  lot_id INT DEFAULT NULL,
  from_location_id INT DEFAULT NULL,
  to_location_id INT DEFAULT NULL,
  movement_type ENUM('receipt','transfer','dispense','sale','adjustment_in','adjustment_out','return','expired','damaged') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  reference_type VARCHAR(50) DEFAULT NULL,
  reference_id INT DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  performed_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id),
  FOREIGN KEY (lot_id) REFERENCES rv_stock_lot(id) ON DELETE SET NULL,
  INDEX idx_rv_sm_tenant (tenant_id),
  INDEX idx_rv_sm_product (product_id),
  INDEX idx_rv_sm_type (movement_type),
  INDEX idx_rv_sm_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_dispense_transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  prescription_id INT DEFAULT NULL,
  animal_id INT DEFAULT NULL,
  party_id INT DEFAULT NULL,
  dispensed_by INT DEFAULT NULL,
  dispense_date DATETIME NOT NULL,
  dispense_number VARCHAR(30) NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_disp_tenant (tenant_id),
  INDEX idx_rv_disp_rx (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_dispense_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dispense_id INT NOT NULL,
  prescription_line_id INT DEFAULT NULL,
  product_id INT DEFAULT NULL,
  lot_id INT DEFAULT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(12,2) DEFAULT 0,
  instructions TEXT DEFAULT NULL,
  FOREIGN KEY (dispense_id) REFERENCES rv_dispense_transaction(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id),
  FOREIGN KEY (lot_id) REFERENCES rv_stock_lot(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_retail_sale (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  site_id INT DEFAULT NULL,
  party_id INT DEFAULT NULL,
  sale_number VARCHAR(30) NOT NULL,
  sale_date DATETIME NOT NULL,
  sold_by INT DEFAULT NULL,
  subtotal DECIMAL(14,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  payment_method ENUM('cash','card','mobile_money','credit','cheque') DEFAULT 'cash',
  payment_reference VARCHAR(100) DEFAULT NULL,
  status ENUM('completed','voided','refunded') DEFAULT 'completed',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  UNIQUE KEY uk_sale_number (tenant_id, sale_number),
  INDEX idx_rv_sale_tenant (tenant_id),
  INDEX idx_rv_sale_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rv_retail_sale_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  lot_id INT DEFAULT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  line_total DECIMAL(14,2) DEFAULT 0,
  FOREIGN KEY (sale_id) REFERENCES rv_retail_sale(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES rv_product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
