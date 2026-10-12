-- ============================================================
-- Migration 024: Comprehensive Reference Data Seed
-- OMSA-inspired + African veterinary context
-- All system data: tenant_id = NULL (global/shared)
-- Idempotent: uses INSERT IGNORE throughout
-- ============================================================

-- ============================================================
-- 1. SPECIES
-- ============================================================
-- Add missing species for African veterinary practice
INSERT IGNORE INTO rv_species (code, name_fr, name_en, category, sort_order) VALUES
('COB', 'Cobaye (Cochon d''Inde)', 'Guinea Pig', 'exotic', 12);

-- Update sort_order for existing species to give logical ordering
UPDATE rv_species SET sort_order = 1 WHERE code = 'CAN';
UPDATE rv_species SET sort_order = 2 WHERE code = 'FEL';
UPDATE rv_species SET sort_order = 3 WHERE code = 'BOV';
UPDATE rv_species SET sort_order = 4 WHERE code = 'OVI';
UPDATE rv_species SET sort_order = 5 WHERE code = 'CAP';
UPDATE rv_species SET sort_order = 6 WHERE code = 'EQU';
UPDATE rv_species SET sort_order = 7 WHERE code = 'SUI';
UPDATE rv_species SET sort_order = 8 WHERE code = 'GAL';
UPDATE rv_species SET sort_order = 9 WHERE code = 'ASI';
UPDATE rv_species SET sort_order = 10 WHERE code = 'CAM';
UPDATE rv_species SET sort_order = 11 WHERE code = 'LAP';
UPDATE rv_species SET sort_order = 12 WHERE code = 'COB';


-- ============================================================
-- 2. BREEDS — African + common international breeds
-- ============================================================

-- ── Canin (Chien) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='CAN'), 'BASE', 'Basenji', 'Basenji'),
((SELECT id FROM rv_species WHERE code='CAN'), 'SLOU', 'Sloughi', 'Sloughi'),
((SELECT id FROM rv_species WHERE code='CAN'), 'AZAW', 'Azawakh', 'Azawakh'),
((SELECT id FROM rv_species WHERE code='CAN'), 'BOER', 'Boerboel', 'Boerboel'),
((SELECT id FROM rv_species WHERE code='CAN'), 'RHOD', 'Rhodesian Ridgeback', 'Rhodesian Ridgeback'),
((SELECT id FROM rv_species WHERE code='CAN'), 'CROI', 'Croisé local', 'Local crossbreed'),
((SELECT id FROM rv_species WHERE code='CAN'), 'YORK', 'Yorkshire Terrier', 'Yorkshire Terrier'),
((SELECT id FROM rv_species WHERE code='CAN'), 'CHIH', 'Chihuahua', 'Chihuahua'),
((SELECT id FROM rv_species WHERE code='CAN'), 'GOLD', 'Golden Retriever', 'Golden Retriever'),
((SELECT id FROM rv_species WHERE code='CAN'), 'HUSKY', 'Husky Sibérien', 'Siberian Husky'),
((SELECT id FROM rv_species WHERE code='CAN'), 'COCK', 'Cocker Spaniel', 'Cocker Spaniel'),
((SELECT id FROM rv_species WHERE code='CAN'), 'BFRA', 'Bouledogue Français', 'French Bulldog');

-- ── Félin (Chat) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='FEL'), 'EURO', 'Européen', 'European Shorthair'),
((SELECT id FROM rv_species WHERE code='FEL'), 'ABYS', 'Abyssin', 'Abyssinian'),
((SELECT id FROM rv_species WHERE code='FEL'), 'GOUT', 'Chat de gouttière', 'Domestic Shorthair'),
((SELECT id FROM rv_species WHERE code='FEL'), 'MAIN', 'Maine Coon', 'Maine Coon'),
((SELECT id FROM rv_species WHERE code='FEL'), 'BRIT', 'British Shorthair', 'British Shorthair'),
((SELECT id FROM rv_species WHERE code='FEL'), 'BENG', 'Bengal', 'Bengal'),
((SELECT id FROM rv_species WHERE code='FEL'), 'RAGA', 'Ragdoll', 'Ragdoll');

-- ── Bovin ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='BOV'), 'BORG', 'Borgou', 'Borgou'),
((SELECT id FROM rv_species WHERE code='BOV'), 'KOUR', 'Kouri', 'Kouri'),
((SELECT id FROM rv_species WHERE code='BOV'), 'AZAK', 'Azawak', 'Azawak'),
((SELECT id FROM rv_species WHERE code='BOV'), 'GUDA', 'Gudali', 'Gudali'),
((SELECT id FROM rv_species WHERE code='BOV'), 'WFUL', 'White Fulani', 'White Fulani'),
((SELECT id FROM rv_species WHERE code='BOV'), 'RBOR', 'Red Bororo', 'Red Bororo'),
((SELECT id FROM rv_species WHERE code='BOV'), 'CHAR', 'Charolais (importé)', 'Charolais (imported)'),
((SELECT id FROM rv_species WHERE code='BOV'), 'JERS', 'Jersey (importé)', 'Jersey (imported)'),
((SELECT id FROM rv_species WHERE code='BOV'), 'CRBO', 'Croisé local bovin', 'Local crossbreed cattle'),
((SELECT id FROM rv_species WHERE code='BOV'), 'MONT', 'Montbéliarde (importé)', 'Montbeliarde (imported)');

-- ── Ovin (Mouton) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='OVI'), 'OUDA', 'Oudah', 'Oudah'),
((SELECT id FROM rv_species WHERE code='OVI'), 'BALA', 'Balami', 'Balami'),
((SELECT id FROM rv_species WHERE code='OVI'), 'PEUL', 'Peul', 'Fulani'),
((SELECT id FROM rv_species WHERE code='OVI'), 'DORP', 'Dorper', 'Dorper'),
((SELECT id FROM rv_species WHERE code='OVI'), 'CRMO', 'Croisé local ovin', 'Local crossbreed sheep'),
((SELECT id FROM rv_species WHERE code='OVI'), 'TOUA', 'Touabire', 'Touabire'),
((SELECT id FROM rv_species WHERE code='OVI'), 'MACINA', 'Macina', 'Macina');

-- ── Caprin (Chèvre) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='CAP'), 'WDWF', 'Chèvre naine (WAD)', 'West African Dwarf'),
((SELECT id FROM rv_species WHERE code='CAP'), 'MARA', 'Chèvre rousse de Maradi', 'Red Maradi Goat'),
((SELECT id FROM rv_species WHERE code='CAP'), 'SAHE', 'Chèvre du Sahel', 'Sahel Goat'),
((SELECT id FROM rv_species WHERE code='CAP'), 'BOER', 'Boer', 'Boer'),
((SELECT id FROM rv_species WHERE code='CAP'), 'CRCA', 'Croisé local caprin', 'Local crossbreed goat'),
((SELECT id FROM rv_species WHERE code='CAP'), 'ALPI', 'Alpine (importé)', 'Alpine (imported)'),
((SELECT id FROM rv_species WHERE code='CAP'), 'SAAN', 'Saanen (importé)', 'Saanen (imported)');

-- ── Volaille (Poule/Poulet) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='GAL'), 'PINT', 'Pintade', 'Guinea Fowl'),
((SELECT id FROM rv_species WHERE code='GAL'), 'CANA', 'Canard', 'Duck'),
((SELECT id FROM rv_species WHERE code='GAL'), 'DIND', 'Dinde/Dindon', 'Turkey'),
((SELECT id FROM rv_species WHERE code='GAL'), 'COQR', 'Coq de race', 'Purebred Rooster'),
((SELECT id FROM rv_species WHERE code='GAL'), 'CAIL', 'Caille', 'Quail');

-- ── Équin (Cheval) ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='EQU'), 'ARAB', 'Pur-sang Arabe', 'Arabian'),
((SELECT id FROM rv_species WHERE code='EQU'), 'BARB', 'Barbe', 'Barb'),
((SELECT id FROM rv_species WHERE code='EQU'), 'DONG', 'Dongolaw', 'Dongolaw'),
((SELECT id FROM rv_species WHERE code='EQU'), 'CREQ', 'Croisé local équin', 'Local crossbreed horse'),
((SELECT id FROM rv_species WHERE code='EQU'), 'PSAG', 'Pur-sang Anglais', 'Thoroughbred');

-- ── Porcin ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='SUI'), 'LWHI', 'Large White', 'Large White'),
((SELECT id FROM rv_species WHERE code='SUI'), 'LAND', 'Landrace', 'Landrace'),
((SELECT id FROM rv_species WHERE code='SUI'), 'PLOC', 'Porc local', 'Local Pig'),
((SELECT id FROM rv_species WHERE code='SUI'), 'DUROC', 'Duroc', 'Duroc'),
((SELECT id FROM rv_species WHERE code='SUI'), 'PIET', 'Piétrain', 'Pietrain');

-- ── Âne ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='ASI'), 'ALOC', 'Âne local', 'Local Donkey'),
((SELECT id FROM rv_species WHERE code='ASI'), 'AGRI', 'Âne gris', 'Grey Donkey');

-- ── Chameau/Dromadaire ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='CAM'), 'DROM', 'Dromadaire', 'Dromedary'),
((SELECT id FROM rv_species WHERE code='CAM'), 'BACH', 'Chameau de Bactriane', 'Bactrian Camel');

-- ── Lapin ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='LAP'), 'NZBL', 'Néo-Zélandais Blanc', 'New Zealand White'),
((SELECT id FROM rv_species WHERE code='LAP'), 'CALI', 'Californien', 'Californian'),
((SELECT id FROM rv_species WHERE code='LAP'), 'LLAP', 'Lapin local', 'Local Rabbit'),
((SELECT id FROM rv_species WHERE code='LAP'), 'CHIN', 'Chinchilla', 'Chinchilla Rabbit'),
((SELECT id FROM rv_species WHERE code='LAP'), 'BELI', 'Bélier', 'Lop');

-- ── Cobaye ──
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
((SELECT id FROM rv_species WHERE code='COB'), 'CLOC', 'Cobaye local', 'Local Guinea Pig'),
((SELECT id FROM rv_species WHERE code='COB'), 'CABY', 'Abyssinien', 'Abyssinian Guinea Pig'),
((SELECT id FROM rv_species WHERE code='COB'), 'CPÉR', 'Péruvien', 'Peruvian Guinea Pig');


-- ============================================================
-- 3. DISEASES — OMSA notifiable + regional African diseases
-- ============================================================
-- (Complement the 25 diseases already seeded in migration 018)

INSERT IGNORE INTO rv_disease (code, name_fr, name_en, category, is_notifiable) VALUES
-- OMSA notifiable diseases not yet in seed
('PESTE_BOV', 'Peste bovine', 'Rinderpest', 'infectious', 1),
('PPCB', 'Péripneumonie contagieuse bovine (PPCB)', 'Contagious Bovine Pleuropneumonia', 'infectious', 1),
('RIFT', 'Fièvre de la vallée du Rift', 'Rift Valley Fever', 'infectious', 1),
('LSD', 'Dermatose nodulaire contagieuse (LSD)', 'Lumpy Skin Disease', 'infectious', 1),
('CHARB_SYM', 'Charbon symptomatique', 'Blackleg', 'infectious', 1),
('BLUETONGUE', 'Fièvre catarrhale du mouton (Bluetongue)', 'Bluetongue', 'infectious', 1),
('PPA', 'Peste porcine africaine', 'African Swine Fever', 'infectious', 1),
('PPC', 'Peste porcine classique', 'Classical Swine Fever', 'infectious', 1),
('FIEVRE_Q', 'Fièvre Q', 'Q Fever', 'infectious', 1),

-- Common companion animal diseases
('FIV', 'Immunodéficience féline (FIV)', 'Feline Immunodeficiency Virus', 'infectious', 0),
('FELV', 'Leucose féline (FeLV)', 'Feline Leukemia Virus', 'infectious', 0),
('HERPES_FEL', 'Herpèsvirose féline', 'Feline Herpesvirus', 'infectious', 0),

-- Parasitic diseases important in Africa
('FASCIOLOSE', 'Fasciolose (Douve du foie)', 'Fasciolosis (Liver Fluke)', 'parasitic', 0),
('HELMINTH', 'Helminthiases (Strongyloses)', 'Helminthiasis (Strongylosis)', 'parasitic', 0),
('ANAPLASMOSE', 'Anaplasmose', 'Anaplasmosis', 'parasitic', 0),
('COWDRIOSE', 'Cowdriose (Heartwater)', 'Cowdriosis (Heartwater)', 'parasitic', 1),

-- Poultry diseases
('GUMBORO', 'Maladie de Gumboro', 'Infectious Bursal Disease (Gumboro)', 'infectious', 1),
('COCC_AVI', 'Coccidiose aviaire', 'Avian Coccidiosis', 'parasitic', 0),
('VARIOLE_AV', 'Variole aviaire', 'Avian Pox', 'infectious', 0),
('MAREK', 'Maladie de Marek', 'Marek''s Disease', 'infectious', 0),
('BRONCH_INF', 'Bronchite infectieuse aviaire', 'Avian Infectious Bronchitis', 'infectious', 0),

-- Reproductive / metabolic diseases
('METRITE', 'Métrite', 'Metritis', 'infectious', 0),
('DIARR_NEO', 'Diarrhée néonatale', 'Neonatal Diarrhea', 'infectious', 0),
('PASTEUR', 'Pasteurellose', 'Pasteurellosis', 'infectious', 0),
('SALMON', 'Salmonellose', 'Salmonellosis', 'infectious', 1),
('COLIB', 'Colibacillose', 'Colibacillosis', 'infectious', 0),
('PYOMETRE', 'Pyomètre', 'Pyometra', 'infectious', 0),
('DYSTOCIE', 'Dystocie', 'Dystocia', 'other', 0),
('ACIDOSE_LAC', 'Acidose lactique', 'Lactic Acidosis', 'metabolic', 0),
('CETONURIE', 'Cétose (Acétonémie)', 'Ketosis (Acetonemia)', 'metabolic', 0),
('HYPOCA', 'Hypocalcémie (Fièvre de lait)', 'Hypocalcemia (Milk Fever)', 'metabolic', 0),
('TYMPAN', 'Tympanisme (Météorisme aigu)', 'Tympany (Acute Bloat)', 'metabolic', 0),

-- Other common conditions
('PIROPL_EQU', 'Piroplasmose équine', 'Equine Piroplasmosis', 'parasitic', 0),
('GOURME', 'Gourme', 'Strangles', 'infectious', 0),
('TETANOS', 'Tétanos', 'Tetanus', 'infectious', 0),
('MYIASE', 'Myiase', 'Myiasis', 'parasitic', 0),
('TOXOPL', 'Toxoplasmose', 'Toxoplasmosis', 'parasitic', 0),
('DIROFI', 'Dirofilariose', 'Heartworm Disease', 'parasitic', 0);


-- ============================================================
-- 4. CLINICAL SIGNS — Additional signs
-- ============================================================
-- (Complement the 32 signs already seeded in migration 018)

INSERT IGNORE INTO rv_clinical_sign (name_fr, name_en, category) VALUES
('Oedème', 'Edema', 'general'),
('Hématurie (sang dans les urines)', 'Hematuria', 'urogenital'),
('Épistaxis (saignement nasal)', 'Epistaxis (Nosebleed)', 'respiratory'),
('Lymphadénopathie', 'Lymphadenopathy', 'general'),
('Photosensibilisation', 'Photosensitization', 'dermatological'),
('Douleur abdominale (coliques)', 'Abdominal pain (colic)', 'digestive'),
('Rétention placentaire', 'Retained placenta', 'urogenital'),
('Écoulement vaginal', 'Vaginal discharge', 'urogenital'),
('Tachycardie', 'Tachycardia', 'cardiovascular'),
('Bradycardie', 'Bradycardia', 'cardiovascular'),
('Hypothermie', 'Hypothermia', 'general'),
('Opisthotonos', 'Opisthotonos', 'neurological'),
('Nystagmus', 'Nystagmus', 'neurological'),
('Dysphagie (difficulté à avaler)', 'Dysphagia', 'digestive'),
('Méléna (sang dans les selles)', 'Melena', 'digestive'),
('Distension abdominale gazeuse', 'Gaseous abdominal distension', 'digestive'),
('Chute de production des oeufs', 'Drop in egg production', 'general'),
('Nodules cutanés', 'Skin nodules', 'dermatological'),
('Vésicules / aphtes buccaux', 'Oral vesicles / aphthae', 'digestive'),
('Jetage muco-purulent', 'Mucopurulent discharge', 'respiratory'),
('Stomatite', 'Stomatitis', 'digestive'),
('Hémoglobinurie', 'Hemoglobinuria', 'urogenital'),
('Tremblements musculaires', 'Muscle tremors', 'neurological'),
('Décubitus (animal couché)', 'Recumbency', 'musculoskeletal'),
('Pica (ingestion de corps étrangers)', 'Pica', 'digestive'),
('Cachexie', 'Cachexia', 'general'),
('Cyanose', 'Cyanosis', 'cardiovascular'),
('Toux productive', 'Productive cough', 'respiratory'),
('Râles pulmonaires', 'Lung rales', 'respiratory'),
('Torticolis', 'Torticollis', 'neurological');


-- ============================================================
-- 5. DISEASE-SIGN MAPPINGS
-- ============================================================
-- Link diseases to their typical clinical signs
-- Using subqueries for robustness (code-based for diseases, name_fr-based for signs)

INSERT IGNORE INTO rv_disease_sign (disease_id, sign_id) VALUES
-- Rage: Fièvre, Agressivité, Salivation excessive, Paralysie, Convulsions, Dysphagie
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Agressivité inhabituelle')),
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Salivation excessive')),
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Paralysie')),
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Convulsions')),
((SELECT id FROM rv_disease WHERE code='RAGE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dysphagie%')),

-- Parvovirose: Diarrhée hémorragique, Vomissement, Déshydratation, Anorexie, Léthargie, Fièvre
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Vomissement')),
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Déshydratation')),
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),
((SELECT id FROM rv_disease WHERE code='PARVO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),

-- Maladie de Carré: Fièvre, Jetage nasal, Toux, Diarrhée, Convulsions, Jetage oculaire
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Jetage nasal')),
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Toux')),
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Convulsions')),
((SELECT id FROM rv_disease WHERE code='MALADIE_CARRE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Écoulement oculaire')),

-- Leptospirose: Fièvre, Ictère, Vomissement, Diarrhée, Anorexie, Hématurie
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Vomissement')),
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='LEPTO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Hématurie%')),

-- Ehrlichiose: Fièvre, Anémie, Léthargie, Anorexie, Épistaxis, Lymphadénopathie
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Épistaxis%')),
((SELECT id FROM rv_disease WHERE code='EHRLICH'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),

-- Babésiose: Fièvre, Anémie, Ictère, Hémoglobinurie, Léthargie, Anorexie
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Hémoglobinurie')),
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),
((SELECT id FROM rv_disease WHERE code='BABESIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Leishmaniose: Alopécie, Lésions cutanées, Perte de poids, Lymphadénopathie, Boiterie
((SELECT id FROM rv_disease WHERE code='LEISHMANIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Alopécie%')),
((SELECT id FROM rv_disease WHERE code='LEISHMANIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Lésions cutanées%')),
((SELECT id FROM rv_disease WHERE code='LEISHMANIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='LEISHMANIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='LEISHMANIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Boiterie')),

-- Dermatophytose (Teigne): Alopécie, Lésions cutanées, Prurit
((SELECT id FROM rv_disease WHERE code='DERMATOPHYTOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Alopécie%')),
((SELECT id FROM rv_disease WHERE code='DERMATOPHYTOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Lésions cutanées%')),
((SELECT id FROM rv_disease WHERE code='DERMATOPHYTOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Prurit%')),

-- Gale: Prurit, Alopécie, Lésions cutanées
((SELECT id FROM rv_disease WHERE code='GALE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Prurit%')),
((SELECT id FROM rv_disease WHERE code='GALE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Alopécie%')),
((SELECT id FROM rv_disease WHERE code='GALE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Lésions cutanées%')),

-- Typhus félin (Panleucopénie): Fièvre, Vomissement, Diarrhée hémorragique, Déshydratation, Léthargie
((SELECT id FROM rv_disease WHERE code='FPV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='FPV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Vomissement')),
((SELECT id FROM rv_disease WHERE code='FPV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),
((SELECT id FROM rv_disease WHERE code='FPV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Déshydratation')),
((SELECT id FROM rv_disease WHERE code='FPV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),

-- Coryza félin: Éternuements, Jetage nasal, Écoulement oculaire, Conjonctivite, Fièvre
((SELECT id FROM rv_disease WHERE code='CORYZA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Éternuements')),
((SELECT id FROM rv_disease WHERE code='CORYZA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Jetage nasal')),
((SELECT id FROM rv_disease WHERE code='CORYZA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Écoulement oculaire')),
((SELECT id FROM rv_disease WHERE code='CORYZA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Conjonctivite')),
((SELECT id FROM rv_disease WHERE code='CORYZA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),

-- Fièvre aphteuse: Fièvre, Salivation excessive, Boiterie, Vésicules buccaux, Anorexie, Baisse production laitière
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Salivation excessive')),
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Boiterie')),
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Vésicules%')),
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='FIEVRE_APHTEUSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),

-- Brucellose: Avortement, Fièvre, Gonflement articulaire, Rétention placentaire, Baisse production laitière
((SELECT id FROM rv_disease WHERE code='BRUCELLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Avortement')),
((SELECT id FROM rv_disease WHERE code='BRUCELLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='BRUCELLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Gonflement articulaire')),
((SELECT id FROM rv_disease WHERE code='BRUCELLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Rétention placentaire')),
((SELECT id FROM rv_disease WHERE code='BRUCELLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),

-- Tuberculose bovine: Toux, Perte de poids, Dyspnée, Lymphadénopathie, Anorexie
((SELECT id FROM rv_disease WHERE code='TUBERCULOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Toux')),
((SELECT id FROM rv_disease WHERE code='TUBERCULOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='TUBERCULOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='TUBERCULOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='TUBERCULOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Charbon bactéridien (Anthrax): Mortalité subite, Fièvre, Oedème, Salivation, Diarrhée hémorragique
((SELECT id FROM rv_disease WHERE code='CHARBON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='CHARBON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='CHARBON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='CHARBON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Salivation excessive')),
((SELECT id FROM rv_disease WHERE code='CHARBON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),

-- PPR (Peste des petits ruminants): Fièvre, Jetage nasal, Diarrhée, Toux, Stomatite, Pneumonie/Dyspnée
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Jetage nasal')),
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Toux')),
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Stomatite')),
((SELECT id FROM rv_disease WHERE code='PPESTE_PR'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),

-- Newcastle: Fièvre, Dyspnée, Diarrhée, Torticolis, Mortalité subite, Chute production oeufs
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Torticolis')),
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='NEWCASTLE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Chute de production%')),

-- Grippe aviaire: Fièvre, Dyspnée, Mortalité subite, Oedème, Diarrhée, Chute production oeufs
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='GRIPPE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Chute de production%')),

-- Coccidiose: Diarrhée, Diarrhée hémorragique, Déshydratation, Perte de poids, Anorexie
((SELECT id FROM rv_disease WHERE code='COCCIDIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='COCCIDIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),
((SELECT id FROM rv_disease WHERE code='COCCIDIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Déshydratation')),
((SELECT id FROM rv_disease WHERE code='COCCIDIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='COCCIDIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Trypanosomose: Fièvre, Anémie, Perte de poids, Oedème, Léthargie, Baisse production laitière
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),
((SELECT id FROM rv_disease WHERE code='TRYPANOSOMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),

-- Theilériose: Fièvre, Lymphadénopathie, Anémie, Ictère, Dyspnée
((SELECT id FROM rv_disease WHERE code='THEILERIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='THEILERIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='THEILERIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='THEILERIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='THEILERIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),

-- Mammite: Fièvre, Oedème, Baisse production laitière, Douleur abdominale
((SELECT id FROM rv_disease WHERE code='MAMMITE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='MAMMITE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='MAMMITE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),
((SELECT id FROM rv_disease WHERE code='MAMMITE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Douleur abdominale%')),

-- PPCB: Toux, Dyspnée, Fièvre, Jetage nasal, Anorexie
((SELECT id FROM rv_disease WHERE code='PPCB'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Toux')),
((SELECT id FROM rv_disease WHERE code='PPCB'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='PPCB'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='PPCB'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Jetage nasal')),
((SELECT id FROM rv_disease WHERE code='PPCB'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Fièvre de la vallée du Rift: Fièvre, Avortement, Ictère, Mortalité subite, Diarrhée hémorragique
((SELECT id FROM rv_disease WHERE code='RIFT'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='RIFT'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Avortement')),
((SELECT id FROM rv_disease WHERE code='RIFT'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='RIFT'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='RIFT'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),

-- LSD (Dermatose nodulaire): Fièvre, Nodules cutanés, Oedème, Lymphadénopathie, Baisse production laitière
((SELECT id FROM rv_disease WHERE code='LSD'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='LSD'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Nodules cutanés')),
((SELECT id FROM rv_disease WHERE code='LSD'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='LSD'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='LSD'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),

-- Charbon symptomatique: Fièvre, Boiterie, Oedème, Mortalité subite
((SELECT id FROM rv_disease WHERE code='CHARB_SYM'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='CHARB_SYM'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Boiterie')),
((SELECT id FROM rv_disease WHERE code='CHARB_SYM'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='CHARB_SYM'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),

-- Peste porcine africaine: Fièvre, Diarrhée hémorragique, Cyanose, Mortalité subite, Anorexie, Vomissement
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Cyanose')),
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='PPA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Vomissement')),

-- Gumboro: Diarrhée, Déshydratation, Tremblements musculaires, Mortalité subite, Anorexie
((SELECT id FROM rv_disease WHERE code='GUMBORO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='GUMBORO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Déshydratation')),
((SELECT id FROM rv_disease WHERE code='GUMBORO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Tremblements musculaires')),
((SELECT id FROM rv_disease WHERE code='GUMBORO'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),
((SELECT id FROM rv_disease WHERE code='GUMBORO'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Fasciolose: Anémie, Perte de poids, Oedème, Ictère, Diarrhée
((SELECT id FROM rv_disease WHERE code='FASCIOLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='FASCIOLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='FASCIOLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Oedème')),
((SELECT id FROM rv_disease WHERE code='FASCIOLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='FASCIOLOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),

-- Cowdriose (Heartwater): Fièvre, Convulsions, Opisthotonos, Diarrhée, Dyspnée
((SELECT id FROM rv_disease WHERE code='COWDRIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='COWDRIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Convulsions')),
((SELECT id FROM rv_disease WHERE code='COWDRIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Opisthotonos')),
((SELECT id FROM rv_disease WHERE code='COWDRIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='COWDRIOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),

-- Anaplasmose: Fièvre, Anémie, Ictère, Anorexie, Perte de poids
((SELECT id FROM rv_disease WHERE code='ANAPLASMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='ANAPLASMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='ANAPLASMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Ictère%')),
((SELECT id FROM rv_disease WHERE code='ANAPLASMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='ANAPLASMOSE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),

-- Salmonellose: Fièvre, Diarrhée, Diarrhée hémorragique, Déshydratation, Avortement
((SELECT id FROM rv_disease WHERE code='SALMON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='SALMON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='SALMON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée hémorragique')),
((SELECT id FROM rv_disease WHERE code='SALMON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Déshydratation')),
((SELECT id FROM rv_disease WHERE code='SALMON'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Avortement')),

-- Pasteurellose: Fièvre, Dyspnée, Toux, Jetage nasal, Mortalité subite
((SELECT id FROM rv_disease WHERE code='PASTEUR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='PASTEUR'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='PASTEUR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Toux')),
((SELECT id FROM rv_disease WHERE code='PASTEUR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Jetage nasal')),
((SELECT id FROM rv_disease WHERE code='PASTEUR'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Mortalité subite')),

-- Tétanos: Convulsions, Opisthotonos, Paralysie, Tremblements musculaires, Salivation excessive
((SELECT id FROM rv_disease WHERE code='TETANOS'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Convulsions')),
((SELECT id FROM rv_disease WHERE code='TETANOS'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Opisthotonos')),
((SELECT id FROM rv_disease WHERE code='TETANOS'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Paralysie')),
((SELECT id FROM rv_disease WHERE code='TETANOS'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Tremblements musculaires')),
((SELECT id FROM rv_disease WHERE code='TETANOS'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Salivation excessive')),

-- FIV: Perte de poids, Fièvre, Lymphadénopathie, Anorexie, Léthargie
((SELECT id FROM rv_disease WHERE code='FIV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='FIV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='FIV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='FIV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='FIV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),

-- FeLV: Perte de poids, Anémie, Fièvre, Lymphadénopathie, Léthargie
((SELECT id FROM rv_disease WHERE code='FELV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='FELV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='FELV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Fièvre')),
((SELECT id FROM rv_disease WHERE code='FELV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Lymphadénopathie')),
((SELECT id FROM rv_disease WHERE code='FELV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Abattement%')),

-- Hypocalcémie (Fièvre de lait): Tremblements musculaires, Décubitus, Hypothermie, Tachycardie, Anorexie
((SELECT id FROM rv_disease WHERE code='HYPOCA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Tremblements musculaires')),
((SELECT id FROM rv_disease WHERE code='HYPOCA'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Décubitus%')),
((SELECT id FROM rv_disease WHERE code='HYPOCA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Hypothermie')),
((SELECT id FROM rv_disease WHERE code='HYPOCA'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Tachycardie')),
((SELECT id FROM rv_disease WHERE code='HYPOCA'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Cétose: Anorexie, Perte de poids, Baisse production laitière, Constipation
((SELECT id FROM rv_disease WHERE code='CETONURIE'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='CETONURIE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='CETONURIE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Baisse de production laitière')),
((SELECT id FROM rv_disease WHERE code='CETONURIE'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Constipation')),

-- Météorisme: Distension abdominale, Dyspnée, Anorexie, Salivation excessive
((SELECT id FROM rv_disease WHERE code='METEORISME'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Ballonnement abdominal')),
((SELECT id FROM rv_disease WHERE code='METEORISME'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='METEORISME'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='METEORISME'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Salivation excessive')),

-- Helminthiases: Diarrhée, Perte de poids, Anémie, Ballonnement abdominal, Anorexie
((SELECT id FROM rv_disease WHERE code='HELMINTH'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Diarrhée')),
((SELECT id FROM rv_disease WHERE code='HELMINTH'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Perte de poids')),
((SELECT id FROM rv_disease WHERE code='HELMINTH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anémie%')),
((SELECT id FROM rv_disease WHERE code='HELMINTH'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Ballonnement abdominal')),
((SELECT id FROM rv_disease WHERE code='HELMINTH'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),

-- Variole aviaire: Lésions cutanées, Nodules cutanés, Dyspnée, Anorexie, Chute production oeufs
((SELECT id FROM rv_disease WHERE code='VARIOLE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Lésions cutanées%')),
((SELECT id FROM rv_disease WHERE code='VARIOLE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr='Nodules cutanés')),
((SELECT id FROM rv_disease WHERE code='VARIOLE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Dyspnée%')),
((SELECT id FROM rv_disease WHERE code='VARIOLE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Anorexie%')),
((SELECT id FROM rv_disease WHERE code='VARIOLE_AV'), (SELECT id FROM rv_clinical_sign WHERE name_fr LIKE 'Chute de production%'));


-- ============================================================
-- 6. VACCINE TYPES — Additional vaccines for African practice
-- ============================================================
-- (Complement the 12 vaccines already seeded in migration 018)

INSERT IGNORE INTO rv_vaccine_type (name_fr, name_en, species_applicable, protocol) VALUES
('Vaccin Piroplasmose canine', 'Canine Piroplasmosis vaccine', '["CAN"]', 'Primo-vaccination: 2 injections à 3-4 semaines d''intervalle. Rappel annuel.'),
('Vaccin PPCB', 'CBPP vaccine', '["BOV"]', 'Une injection annuelle en zone endémique.'),
('Vaccin Charbon symptomatique', 'Blackleg vaccine', '["BOV","OVI","CAP"]', 'Primo-vaccination à 3-6 mois. Rappel annuel.'),
('Vaccin Pasteurellose bovine', 'Bovine Pasteurellosis vaccine', '["BOV","OVI","CAP"]', 'Une injection. Rappel tous les 6 mois en zone à risque.'),
('Vaccin Brucellose (Rev-1/S19)', 'Brucellosis vaccine (Rev-1/S19)', '["BOV","OVI","CAP"]', 'Vaccination des femelles entre 3-6 mois. Dose unique.'),
('Vaccin Dermatose nodulaire (LSD)', 'LSD vaccine', '["BOV"]', 'Une injection annuelle en zone endémique.'),
('Vaccin Variole aviaire', 'Avian Pox vaccine', '["GAL"]', 'Scarification de l''aile à 6-8 semaines.'),
('Vaccin Peste porcine classique', 'CSF vaccine', '["SUI"]', 'Primo-vaccination à 6-8 semaines. Rappel à 6 mois puis annuel.'),
('Vaccin Fièvre de la vallée du Rift', 'RVF vaccine', '["BOV","OVI","CAP"]', 'Vaccination annuelle en zone endémique avant la saison des pluies.'),
('Vaccin Marek (volaille)', 'Marek''s Disease vaccine', '["GAL"]', 'Vaccination au couvoir, jour 1. Dose unique.'),
('Vaccin Bronchite infectieuse aviaire', 'IB vaccine (avian)', '["GAL"]', 'Primo-vaccination à 1 jour, rappel à 2-3 semaines.'),
('Vaccin Tétanos', 'Tetanus vaccine', '["EQU","BOV","OVI","CAP"]', 'Primo-vaccination: 2 injections à 4 semaines d''intervalle. Rappel annuel.'),
('Vaccin Grippe équine', 'Equine Influenza vaccine', '["EQU"]', 'Primo-vaccination: 2 injections à 4-6 semaines. Rappel tous les 6 mois.'),
('Vaccin Myxomatose', 'Myxomatosis vaccine', '["LAP"]', 'Primo-vaccination à 5 semaines. Rappel tous les 6 mois.'),
('Vaccin VHD (Maladie hémorragique du lapin)', 'RHD vaccine', '["LAP"]', 'Primo-vaccination à 10 semaines. Rappel annuel.'),
('Vaccin RCP félin (Typhus-Coryza-Chlamydiose)', 'RCP feline vaccine', '["FEL"]', 'Primo-vaccination: 2 injections à 3-4 semaines d''intervalle dès 8 semaines. Rappel annuel.'),
('Vaccin CHPL canin (Carré-Hépatite-Parvo-Lepto)', 'CHPL canine vaccine', '["CAN"]', 'Primo-vaccination: 3 injections à 3-4 semaines d''intervalle dès 6-8 semaines. Rappel annuel.'),
('Vaccin Bluetongue', 'Bluetongue vaccine', '["BOV","OVI"]', 'Vaccination annuelle en zone endémique.');


-- ============================================================
-- 7. DIAGNOSIS CODES — Comprehensive veterinary coding system
-- ============================================================
-- (Complement the 20 codes already seeded in migration 018)

INSERT IGNORE INTO rv_diagnosis_code (code, name_fr, name_en, category) VALUES
-- INF - Infectieux
('INF-001', 'Infection bactérienne systémique', 'Systemic bacterial infection', 'infectious'),
('INF-002', 'Infection virale systémique', 'Systemic viral infection', 'infectious'),
('INF-003', 'Septicémie', 'Septicemia', 'infectious'),
('INF-004', 'Abcès', 'Abscess', 'infectious'),
('INF-005', 'Péritonite', 'Peritonitis', 'infectious'),

-- PAR - Parasitaire
('PAR-001', 'Infestation par ectoparasites (tiques/puces)', 'Ectoparasite infestation (ticks/fleas)', 'parasitic'),
('PAR-002', 'Infestation par endoparasites (vers)', 'Endoparasite infestation (worms)', 'parasitic'),
('PAR-003', 'Protozoose sanguine', 'Blood protozoan infection', 'parasitic'),
('PAR-004', 'Gale sarcoptique', 'Sarcoptic mange', 'parasitic'),
('PAR-005', 'Gale démodécique', 'Demodectic mange', 'parasitic'),

-- MET - Métabolique
('MET-001', 'Hypocalcémie', 'Hypocalcemia', 'metabolic'),
('MET-002', 'Cétose / Acétonémie', 'Ketosis / Acetonemia', 'metabolic'),
('MET-003', 'Hypoglycémie', 'Hypoglycemia', 'metabolic'),
('MET-004', 'Carence en minéraux', 'Mineral deficiency', 'metabolic'),
('MET-005', 'Carence en vitamines', 'Vitamin deficiency', 'metabolic'),

-- TRA - Traumatisme
('TRA-001', 'Plaie cutanée', 'Skin wound', 'traumatic'),
('TRA-002', 'Morsure (animal)', 'Animal bite wound', 'traumatic'),
('TRA-003', 'Accident de la voie publique (AVP)', 'Road traffic accident', 'traumatic'),
('TRA-004', 'Brûlure', 'Burn', 'traumatic'),
('TRA-005', 'Corps étranger', 'Foreign body', 'traumatic'),

-- NEO - Néoplasie
('NEO-001', 'Tumeur cutanée bénigne', 'Benign skin tumor', 'neoplastic'),
('NEO-002', 'Tumeur cutanée maligne', 'Malignant skin tumor', 'neoplastic'),
('NEO-003', 'Lymphome', 'Lymphoma', 'neoplastic'),
('NEO-004', 'Tumeur mammaire', 'Mammary tumor', 'neoplastic'),
('NEO-005', 'Tumeur abdominale', 'Abdominal tumor', 'neoplastic'),

-- REP - Reproduction
('REP-001', 'Pyomètre', 'Pyometra', 'reproductive'),
('REP-002', 'Dystocie', 'Dystocia', 'reproductive'),
('REP-003', 'Prolapsus utérin', 'Uterine prolapse', 'reproductive'),
('REP-004', 'Rétention placentaire', 'Retained placenta', 'reproductive'),
('REP-005', 'Infertilité', 'Infertility', 'reproductive'),

-- DER - Dermatologie
('DER-001', 'Dermatite atopique', 'Atopic dermatitis', 'dermatological'),
('DER-002', 'Dermatite par allergie aux piqûres de puces (DAPP)', 'Flea allergy dermatitis (FAD)', 'dermatological'),
('DER-003', 'Hot spot (dermatite pyotraumatique)', 'Hot spot (pyotraumatic dermatitis)', 'dermatological'),
('DER-004', 'Dermatophytose', 'Dermatophytosis', 'dermatological'),
('DER-005', 'Dermatite de contact', 'Contact dermatitis', 'dermatological'),

-- GAS - Gastro-intestinal
('GAS-001', 'Gastrite', 'Gastritis', 'digestive'),
('GAS-002', 'Entérite', 'Enteritis', 'digestive'),
('GAS-003', 'Gastro-entérite hémorragique', 'Hemorrhagic gastroenteritis', 'digestive'),
('GAS-004', 'Intoxication alimentaire', 'Food poisoning', 'digestive'),
('GAS-005', 'Dilatation-torsion de l''estomac (SDTE)', 'Gastric dilatation-volvulus (GDV)', 'digestive'),

-- RES - Respiratoire
('RES-001', 'Trachéobronchite infectieuse (toux de chenil)', 'Infectious tracheobronchitis (kennel cough)', 'respiratory'),
('RES-002', 'Pneumonie bactérienne', 'Bacterial pneumonia', 'respiratory'),
('RES-003', 'Pneumonie parasitaire', 'Parasitic pneumonia', 'respiratory'),
('RES-004', 'Épanchement pleural', 'Pleural effusion', 'respiratory'),
('RES-005', 'Syndrome respiratoire brachycéphale', 'Brachycephalic airway syndrome', 'respiratory'),

-- URO - Urologie
('URO-003', 'Urolithiase (calculs urinaires)', 'Urolithiasis (urinary stones)', 'urogenital'),
('URO-004', 'Insuffisance rénale chronique', 'Chronic renal failure', 'urogenital'),
('URO-005', 'Obstruction urétrale', 'Urethral obstruction', 'urogenital'),

-- NEU - Neurologie
('NEU-001', 'Épilepsie idiopathique', 'Idiopathic epilepsy', 'neurological'),
('NEU-002', 'Hernie discale', 'Disc herniation', 'neurological'),
('NEU-003', 'Syndrome vestibulaire', 'Vestibular syndrome', 'neurological'),
('NEU-004', 'Méningite', 'Meningitis', 'neurological'),
('NEU-005', 'Paralysie du nerf radial', 'Radial nerve paralysis', 'neurological'),

-- OPH - Ophtalmologie
('OPH-001', 'Ulcère cornéen', 'Corneal ulcer', 'ophthalmic'),
('OPH-002', 'Conjonctivite infectieuse', 'Infectious conjunctivitis', 'ophthalmic'),
('OPH-003', 'Glaucome', 'Glaucoma', 'ophthalmic'),
('OPH-004', 'Cataracte', 'Cataract', 'ophthalmic'),
('OPH-005', 'Kératite', 'Keratitis', 'ophthalmic'),

-- CAR - Cardiologie
('CAR-001', 'Cardiomyopathie dilatée', 'Dilated cardiomyopathy', 'cardiovascular'),
('CAR-002', 'Insuffisance valvulaire mitrale', 'Mitral valve insufficiency', 'cardiovascular'),
('CAR-003', 'Péricardite', 'Pericarditis', 'cardiovascular'),
('CAR-004', 'Dirofilariose cardiaque', 'Cardiac heartworm disease', 'cardiovascular'),

-- MUS - Musculo-squelettique
('MUS-001', 'Arthrite septique', 'Septic arthritis', 'musculoskeletal'),
('MUS-002', 'Rupture du ligament croisé', 'Cruciate ligament rupture', 'musculoskeletal'),
('MUS-003', 'Dysplasie de la hanche', 'Hip dysplasia', 'musculoskeletal'),
('MUS-004', 'Ostéomyélite', 'Osteomyelitis', 'musculoskeletal'),
('MUS-005', 'Myosite', 'Myositis', 'musculoskeletal');


-- ============================================================
-- 8. UNITS — Additional measurement units
-- ============================================================
-- (Complement the 16 units already seeded in migration 018)

INSERT IGNORE INTO rv_unit (code, name_fr, name_en, category) VALUES
('%', 'Pourcentage', 'Percentage', 'concentration'),
('°C', 'Degré Celsius', 'Degree Celsius', 'count'),
('bpm', 'Battements par minute', 'Beats per minute', 'count'),
('rpm', 'Respirations par minute', 'Breaths per minute', 'count'),
('mmHg', 'Millimètre de mercure', 'Millimeter of mercury', 'concentration'),
('mmol/L', 'Millimole par litre', 'Millimole per liter', 'concentration'),
('g/L', 'Gramme par litre', 'Gram per liter', 'concentration'),
('g/dL', 'Gramme par décilitre', 'Gram per deciliter', 'concentration'),
('cell/µL', 'Cellules par microlitre', 'Cells per microliter', 'concentration'),
('sachet', 'Sachet', 'Sachet', 'count'),
('µg', 'Microgramme', 'Microgram', 'weight'),
('µg/kg', 'Microgramme par kilogramme', 'Microgram per kilogram', 'concentration'),
('µL', 'Microlitre', 'Microliter', 'volume'),
('mEq/L', 'Milliéquivalent par litre', 'Milliequivalent per liter', 'concentration'),
('cm', 'Centimètre', 'Centimeter', 'length'),
('mm', 'Millimètre', 'Millimeter', 'length'),
('h', 'Heure', 'Hour', 'time'),
('min', 'Minute', 'Minute', 'time'),
('an', 'Année', 'Year', 'time');
