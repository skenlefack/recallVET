-- ============================================================
-- Migration 012: Performance Indexes
-- Adds missing indexes on foreign keys and frequently queried columns
-- ============================================================

-- ── Animals ──
CREATE INDEX idx_animal_tenant_owner ON rv_animal(tenant_id, owner_party_id);
CREATE INDEX idx_animal_tenant_species ON rv_animal(tenant_id, species_id);
CREATE INDEX idx_animal_tenant_farm ON rv_animal(tenant_id, farm_id);
CREATE INDEX idx_animal_code ON rv_animal(tenant_id, animal_code);
CREATE INDEX idx_animal_microchip ON rv_animal(microchip_number);

-- ── Parties ──
CREATE INDEX idx_party_tenant_type ON rv_party(tenant_id, party_type);
CREATE INDEX idx_party_tenant_status ON rv_party(tenant_id, status);
CREATE INDEX idx_party_code ON rv_party(tenant_id, client_code);

-- ── Appointments ──
CREATE INDEX idx_appointment_tenant_date ON rv_appointment(tenant_id, scheduled_date);
CREATE INDEX idx_appointment_tenant_vet ON rv_appointment(tenant_id, vet_user_id);
CREATE INDEX idx_appointment_tenant_status ON rv_appointment(tenant_id, status);
CREATE INDEX idx_appointment_animal ON rv_appointment(animal_id);

-- ── Encounters ──
CREATE INDEX idx_encounter_tenant_date ON rv_encounter(tenant_id, encounter_date);
CREATE INDEX idx_encounter_tenant_vet ON rv_encounter(tenant_id, vet_user_id);
CREATE INDEX idx_encounter_tenant_status ON rv_encounter(tenant_id, status);
CREATE INDEX idx_encounter_animal ON rv_encounter(animal_id);
CREATE INDEX idx_encounter_appointment ON rv_encounter(appointment_id);

-- ── Vaccinations ──
CREATE INDEX idx_vaccination_tenant_animal ON rv_vaccination_event(tenant_id, animal_id);
CREATE INDEX idx_vaccination_tenant_date ON rv_vaccination_event(tenant_id, vaccination_date);
CREATE INDEX idx_vaccination_next_due ON rv_vaccination_event(next_due_date);

-- ── Prescriptions ──
CREATE INDEX idx_prescription_tenant ON rv_prescription(tenant_id);
CREATE INDEX idx_prescription_tenant_animal ON rv_prescription(tenant_id, animal_id);
CREATE INDEX idx_prescription_tenant_status ON rv_prescription(tenant_id, status);
CREATE INDEX idx_prescription_line_rx ON rv_prescription_line(prescription_id);

-- ── Invoices ──
CREATE INDEX idx_invoice_tenant_party ON rv_invoice(tenant_id, party_id);
CREATE INDEX idx_invoice_tenant_status ON rv_invoice(tenant_id, status);
CREATE INDEX idx_invoice_tenant_date ON rv_invoice(tenant_id, invoice_date);
CREATE INDEX idx_invoice_number ON rv_invoice(tenant_id, invoice_number);
CREATE INDEX idx_invoice_line_invoice ON rv_invoice_line(invoice_id);
CREATE INDEX idx_payment_invoice ON rv_payment(invoice_id);

-- ── Farm ──
CREATE INDEX idx_farm_tenant_owner ON rv_farm(tenant_id, owner_party_id);
CREATE INDEX idx_farm_code ON rv_farm(tenant_id, farm_code);
CREATE INDEX idx_herd_farm ON rv_herd_lot(farm_id);
CREATE INDEX idx_herd_tenant ON rv_herd_lot(tenant_id);
CREATE INDEX idx_farm_visit_tenant_farm ON rv_farm_visit(tenant_id, farm_id);
CREATE INDEX idx_farm_visit_tenant_date ON rv_farm_visit(tenant_id, visit_date);
CREATE INDEX idx_health_event_tenant_farm ON rv_health_event(tenant_id, farm_id);
CREATE INDEX idx_health_event_tenant_status ON rv_health_event(tenant_id, status);

-- ── Pharmacy: Products ──
CREATE INDEX idx_product_tenant_category ON rv_product(tenant_id, category_id);
CREATE INDEX idx_product_tenant_active ON rv_product(tenant_id, is_active);
CREATE INDEX idx_product_sku ON rv_product(tenant_id, sku);
CREATE INDEX idx_product_barcode ON rv_product(barcode);

-- ── Pharmacy: Stock ──
CREATE INDEX idx_stock_lot_tenant_product ON rv_stock_lot(tenant_id, product_id, status);
CREATE INDEX idx_stock_lot_location ON rv_stock_lot(location_id);
CREATE INDEX idx_stock_lot_expiry ON rv_stock_lot(expiry_date);
CREATE INDEX idx_stock_movement_tenant_product ON rv_stock_movement(tenant_id, product_id);
CREATE INDEX idx_stock_movement_type ON rv_stock_movement(tenant_id, movement_type);

-- ── Pharmacy: Suppliers & PO ──
CREATE INDEX idx_supplier_tenant ON rv_supplier(tenant_id);
CREATE INDEX idx_po_tenant_supplier ON rv_purchase_order(tenant_id, supplier_id);
CREATE INDEX idx_po_tenant_status ON rv_purchase_order(tenant_id, status);
CREATE INDEX idx_po_line_po ON rv_purchase_order_line(po_id);
CREATE INDEX idx_goods_receipt_tenant ON rv_goods_receipt(tenant_id);
CREATE INDEX idx_goods_receipt_po ON rv_goods_receipt(po_id);
CREATE INDEX idx_goods_receipt_line ON rv_goods_receipt_line(receipt_id);

-- ── Pharmacy: Sales & Dispensing ──
CREATE INDEX idx_retail_sale_tenant ON rv_retail_sale(tenant_id);
CREATE INDEX idx_retail_sale_tenant_date ON rv_retail_sale(tenant_id, sale_date);
CREATE INDEX idx_retail_sale_line ON rv_retail_sale_line(sale_id);
CREATE INDEX idx_dispense_tenant ON rv_dispense_transaction(tenant_id);
CREATE INDEX idx_dispense_prescription ON rv_dispense_transaction(prescription_id);
CREATE INDEX idx_dispense_line ON rv_dispense_line(dispense_id);

-- ── Subscriptions & Tenants ──
CREATE INDEX idx_subscription_tenant ON rv_subscription(tenant_id);
CREATE INDEX idx_subscription_status ON rv_subscription(status);
CREATE INDEX idx_user_tenant_user ON rv_user_tenant(user_id);
CREATE INDEX idx_user_tenant_tenant ON rv_user_tenant(tenant_id);
