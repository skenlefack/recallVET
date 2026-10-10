ALTER TABLE rv_animal ADD FULLTEXT INDEX ft_animal_search (name, animal_code, microchip_number);
ALTER TABLE rv_party ADD FULLTEXT INDEX ft_party_search (display_name, phone_primary, email);
ALTER TABLE rv_product ADD FULLTEXT INDEX ft_product_search (name, sku, barcode);
