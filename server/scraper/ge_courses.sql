-- ========================================================
-- STEP 1: DEFINE FIXED REQUIREMENT IDs
-- ========================================================

SET @r_hist_id = 138; -- Society and Culture: Historical Analysis
SET @r_social_id = 139; -- Society and Culture: Social Analysis
SET @r_life_sci_id = 140; -- Scientific Inquiry: Life Sciences
SET @r_lit_cult_id = 141; -- Arts and Humanities: Literary and Cultural Analysis
SET @r_phil_ling_id = 142; -- Arts and Humanities: Philosophical and Linguistic Analysis
SET @r_vis_perf_id = 143; -- Arts and Humanities: Visual and Performance Arts Analysis

-- ========================================================
-- STEP 2: INSERT CLASSES AND LINK THEM TO GE CATEGORIES
-- ========================================================

-- ANTHRO 1: Human Evolution (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ANTHRO 1', 4, 'Human Evolution');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ANTHRO 1' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ARCHAEOLOGY 30: Science in Archaeology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ARCHAEOLOGY 30', 4, 'Science in Archaeology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ARCHAEOLOGY 30' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ASTRONOMY 5: Life in Universe (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ASTRONOMY 5', 4, 'Life in Universe');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ASTRONOMY 5' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- BIOMEDICAL RESEARCH 1A: Science in Your Time (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('BIOMEDICAL RESEARCH 1A', 4, 'Science in Your Time');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'BIOMEDICAL RESEARCH 1A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- CLUSTER M1A: Food: Lens for Environment and Sustainability (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M1A', 5, 'Food: Lens for Environment and Sustainability');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M1A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M1B: Food: Lens for Environment and Sustainability (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M1B', 5, 'Food: Lens for Environment and Sustainability');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M1B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M1CW: Food: Lens for Environment and Sustainability--Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M1CW', 5, 'Food: Lens for Environment and Sustainability--Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M1CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 2A: Building Climates (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 2A', 5, 'Building Climates');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 2A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_vis_perf_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 2B: Building Climates (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 2B', 5, 'Building Climates');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 2B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_vis_perf_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 2CW: Building Climates: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 2CW', 5, 'Building Climates: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 2CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_vis_perf_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 26A: Poverty and Health in Latin America (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 26A', 5, 'Poverty and Health in Latin America');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 26A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 26B: Poverty and Health in Latin America (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 26B', 5, 'Poverty and Health in Latin America');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 26B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 26CW: Poverty and Health in Latin America: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 26CW', 5, 'Poverty and Health in Latin America: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 26CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 70A: Evolution of Cosmos and Life (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 70A', 4, 'Evolution of Cosmos and Life');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 70A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- CLUSTER 70B: Evolution of Cosmos and Life (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 70B', 4, 'Evolution of Cosmos and Life');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 70B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- CLUSTER 70CW: Evolution of Cosmos and Life: Special Topics in Life and Physical Sciences (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 70CW', 4, 'Evolution of Cosmos and Life: Special Topics in Life and Physical Sciences');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 70CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- CLUSTER M71A: Biotechnology and Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M71A', 5, 'Biotechnology and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M71A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M71B: Biotechnology and Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M71B', 5, 'Biotechnology and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M71B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M71CW: Biotechnology and Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M71CW', 5, 'Biotechnology and Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M71CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M72A: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M72A', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M72A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M72B: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M72B', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M72B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER M72CW: Sex from Biology to Gendered Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER M72CW', 5, 'Sex from Biology to Gendered Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER M72CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 73A: Brain, Bodymind, and Society: All in Your Head? (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 73A', 5, 'Brain, Bodymind, and Society: All in Your Head?');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 73A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_phil_ling_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 73B: Brain, Bodymind, and Society: All in Your Head? (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 73B', 5, 'Brain, Bodymind, and Society: All in Your Head?');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 73B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_phil_ling_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 73CW: Brain, Bodymind, and Society: All in Your Head?--Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 73CW', 5, 'Brain, Bodymind, and Society: All in Your Head?--Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 73CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_phil_ling_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 80A: Frontiers in Human Aging (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 80A', 5, 'Frontiers in Human Aging');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 80A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 80BX: Frontiers in Human Aging (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 80BX', 5, 'Frontiers in Human Aging');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 80BX' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CLUSTER 80CW: Frontiers in Human Aging--Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CLUSTER 80CW', 5, 'Frontiers in Human Aging--Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CLUSTER 80CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- COMM M72A: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('COMM M72A', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'COMM M72A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- COMM M72B: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('COMM M72B', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'COMM M72B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- COMM M72CW: Sex from Biology to Gendered Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('COMM M72CW', 5, 'Sex from Biology to Gendered Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'COMM M72CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- CHS 48: Nutrition and Food Studies: Principles and Practice (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('CHS 48', 4, 'Nutrition and Food Studies: Principles and Practice');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'CHS 48' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- EARTH, PLANETARY, AND SPACE SCIENCES 3: Astrobiology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('EARTH, PLANETARY, AND SPACE SCIENCES 3', 4, 'Astrobiology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'EARTH, PLANETARY, AND SPACE SCIENCES 3' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- EARTH, PLANETARY, AND SPACE SCIENCES 15: Blue Planet: Introduction to Oceanography (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('EARTH, PLANETARY, AND SPACE SCIENCES 15', 4, 'Blue Planet: Introduction to Oceanography');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'EARTH, PLANETARY, AND SPACE SCIENCES 15' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- EARTH, PLANETARY, AND SPACE SCIENCES 16: Major Events in History of Life (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('EARTH, PLANETARY, AND SPACE SCIENCES 16', 4, 'Major Events in History of Life');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'EARTH, PLANETARY, AND SPACE SCIENCES 16' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- EARTH, PLANETARY, AND SPACE SCIENCES 17: Dinosaurs and Their Relatives (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('EARTH, PLANETARY, AND SPACE SCIENCES 17', 4, 'Dinosaurs and Their Relatives');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'EARTH, PLANETARY, AND SPACE SCIENCES 17' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- EARTH, PLANETARY, AND SPACE SCIENCES 20: Natural History of Southern California (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('EARTH, PLANETARY, AND SPACE SCIENCES 20', 4, 'Natural History of Southern California');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'EARTH, PLANETARY, AND SPACE SCIENCES 20' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 10: Plants and Civilization (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 10', 4, 'Plants and Civilization');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 10' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 11: Biomedical Research Issues in Minority Communities (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 11', 4, 'Biomedical Research Issues in Minority Communities');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 11' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 17: Evolution for Everyone (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 17', 4, 'Evolution for Everyone');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 17' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 18: Why Ecology Matters: Science Behind Environmental Issues (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 18', 4, 'Why Ecology Matters: Science Behind Environmental Issues');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 18' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 21: Field Biology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 21', 4, 'Field Biology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 21' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 25: Living Ocean (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 25', 4, 'Living Ocean');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 25' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ECOLOGY AND EVOLUTIONARY BIOLOGY 98T: Plants and Humans: Ancient Connection (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ECOLOGY AND EVOLUTIONARY BIOLOGY 98T', 4, 'Plants and Humans: Ancient Connection');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ECOLOGY AND EVOLUTIONARY BIOLOGY 98T' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ENVIRON M1A: Food: Lens for Environment and Sustainability (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ENVIRON M1A', 5, 'Food: Lens for Environment and Sustainability');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ENVIRON M1A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- ENVIRON M1B: Food: Lens for Environment and Sustainability (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ENVIRON M1B', 5, 'Food: Lens for Environment and Sustainability');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ENVIRON M1B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- ENVIRON M1CW: Food: Lens for Environment and Sustainability--Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ENVIRON M1CW', 5, 'Food: Lens for Environment and Sustainability--Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ENVIRON M1CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- ENVIRON 12: Sustainability and Environment (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ENVIRON 12', 4, 'Sustainability and Environment');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ENVIRON 12' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- ENVIRON 25: Good Food for Everyone: Health, Sustainability, and Culture (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('ENVIRON 25', 4, 'Good Food for Everyone: Health, Sustainability, and Culture');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'ENVIRON 25' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- FOOD 27: Critical Thinking about Food and Science Publications (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('FOOD 27', 4, 'Critical Thinking about Food and Science Publications');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'FOOD 27' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- GEOG 2: Biodiversity in Changing World (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('GEOG 2', 4, 'Biodiversity in Changing World');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'GEOG 2' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- GEOG 5: People and Earth''s Ecosystems (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('GEOG 5', 4, 'People and Earth''s Ecosystems');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'GEOG 5' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- GEOG 7: Introduction to Geographic Information Systems (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('GEOG 7', 5, 'Introduction to Geographic Information Systems');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'GEOG 7' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- GEOG 88GE: Seminar Sequence: Special Topics in Geography (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('GEOG 88GE', 4, 'Seminar Sequence: Special Topics in Geography');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'GEOG 88GE' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- HONORS 3: Personal Brain Management (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('HONORS 3', 4, 'Personal Brain Management');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'HONORS 3' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- HONORS 14: Interaction of Science and Society (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('HONORS 14', 4, 'Interaction of Science and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'HONORS 14' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- HONORS 41: Understanding Ecology: Finding Interdisciplinary Solutions to Environmental Problems (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('HONORS 41', 5, 'Understanding Ecology: Finding Interdisciplinary Solutions to Environmental Problems');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'HONORS 41' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- HONORS 64: Neuroscience and Psychology of Art and Biology of Aesthetics (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('HONORS 64', 4, 'Neuroscience and Psychology of Art and Biology of Aesthetics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'HONORS 64' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- HONORS 70A: Genetic Engineering in Medicine, Agriculture, and Law (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('HONORS 70A', 4, 'Genetic Engineering in Medicine, Agriculture, and Law');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'HONORS 70A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- LIFE SCIENCES 7A: Cell and Molecular Biology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('LIFE SCIENCES 7A', 4, 'Cell and Molecular Biology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'LIFE SCIENCES 7A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- LIFE SCIENCES 15: Life: Concepts and Issues (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('LIFE SCIENCES 15', 4, 'Life: Concepts and Issues');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'LIFE SCIENCES 15' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- LIFE SCIENCES 15L: Life: Concepts and Issues Laboratory (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('LIFE SCIENCES 15L', 4, 'Life: Concepts and Issues Laboratory');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'LIFE SCIENCES 15L' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- LIFE SCIENCES 30A: Mathematics for Life Scientists (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('LIFE SCIENCES 30A', 4, 'Mathematics for Life Scientists');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'LIFE SCIENCES 30A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- LING 1: Introduction to Study of Language (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('LING 1', 5, 'Introduction to Study of Language');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'LING 1' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_phil_ling_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- MEDICINE 185: Integrative East-West Medicine for Health and Wellness (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('MEDICINE 185', 4, 'Integrative East-West Medicine for Health and Wellness');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'MEDICINE 185' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 5: Science of Memory and Learning (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 5', 4, 'Science of Memory and Learning');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 5' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 6: Microbiology for Nonmajors (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 6', 4, 'Microbiology for Nonmajors');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'MICROBIOLOGY, IMMUNOLOGY, AND MOLECULAR GENETICS 6' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 50: Stem Cell Biology, Politics, and Ethics: Teasing Apart Issues (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 50', 4, 'Stem Cell Biology, Politics, and Ethics: Teasing Apart Issues');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 50' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 90: Human Stem Cells and Medicine (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 90', 4, 'Human Stem Cells and Medicine');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'MOLECULAR, CELL, AND DEVELOPMENTAL BIOLOGY 90' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- NEUROSCIENCE 10: Brain Made Simple: Neuroscience for 21st Century (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('NEUROSCIENCE 10', 4, 'Brain Made Simple: Neuroscience for 21st Century');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'NEUROSCIENCE 10' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- NEUROSCIENCE 17: Science of Music (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('NEUROSCIENCE 17', 4, 'Science of Music');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'NEUROSCIENCE 17' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- NURSING 3: Human Physiology for Healthcare Providers (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('NURSING 3', 4, 'Human Physiology for Healthcare Providers');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'NURSING 3' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- NURSING 3: Human Physiology for Healthcare Providers (effective Winter 2026) (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('NURSING 3', 4, 'Human Physiology for Healthcare Providers (effective Winter 2026)');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'NURSING 3' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- NURSING 13: Introduction to Human Anatomy (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('NURSING 13', 4, 'Introduction to Human Anatomy');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'NURSING 13' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PHILOS 8: Introduction to Philosophy of Science (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PHILOS 8', 5, 'Introduction to Philosophy of Science');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PHILOS 8' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_phil_ling_id, @c_id);

-- PHYSIOLOGICAL SCIENCE 3: Introduction to Human Physiology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PHYSIOLOGICAL SCIENCE 3', 4, 'Introduction to Human Physiology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PHYSIOLOGICAL SCIENCE 3' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PHYSIOLOGICAL SCIENCE 5: Issues in Human Physiology: Diet and Exercise (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PHYSIOLOGICAL SCIENCE 5', 4, 'Issues in Human Physiology: Diet and Exercise');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PHYSIOLOGICAL SCIENCE 5' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PHYSIOLOGICAL SCIENCE 7: Science and Food: Physical and Molecular Origins of What We Eat (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PHYSIOLOGICAL SCIENCE 7', 4, 'Science and Food: Physical and Molecular Origins of What We Eat');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PHYSIOLOGICAL SCIENCE 7' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PHYSIOLOGICAL SCIENCE 13: Introduction to Human Anatomy (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PHYSIOLOGICAL SCIENCE 13', 4, 'Introduction to Human Anatomy');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PHYSIOLOGICAL SCIENCE 13' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PSYCHIATRY AND BIOBEHAVIORAL SCIENCES 79: Applied Positive Neuroscience: Skills for Improving Productivity and Well-Being (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PSYCHIATRY AND BIOBEHAVIORAL SCIENCES 79', 4, 'Applied Positive Neuroscience: Skills for Improving Productivity and Well-Being');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PSYCHIATRY AND BIOBEHAVIORAL SCIENCES 79' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- PSYCHOLOGY 15: Introductory Psychobiology (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('PSYCHOLOGY 15', 4, 'Introductory Psychobiology');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'PSYCHOLOGY 15' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- SOCGEN 5: Integrative Approaches to Human Biology and Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN 5', 5, 'Integrative Approaches to Human Biology and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN 5' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M71A: Biotechnology and Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M71A', 5, 'Biotechnology and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M71A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M71B: Biotechnology and Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M71B', 5, 'Biotechnology and Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M71B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M71CW: Biotechnology and Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M71CW', 5, 'Biotechnology and Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M71CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_lit_cult_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M72A: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M72A', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M72A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M72B: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M72B', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M72B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN M72CW: Sex from Biology to Gendered Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN M72CW', 5, 'Sex from Biology to Gendered Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN M72CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCGEN 101: Genetic Concepts for Human Sciences (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN 101', 4, 'Genetic Concepts for Human Sciences');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN 101' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- SOCGEN 102: Societal and Medical Issues in Human Genetics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCGEN 102', 5, 'Societal and Medical Issues in Human Genetics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCGEN 102' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCIOL M72A: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCIOL M72A', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCIOL M72A' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCIOL M72B: Sex from Biology to Gendered Society (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCIOL M72B', 5, 'Sex from Biology to Gendered Society');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCIOL M72B' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- SOCIOL M72CW: Sex from Biology to Gendered Society: Special Topics (5 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('SOCIOL M72CW', 5, 'Sex from Biology to Gendered Society: Special Topics');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'SOCIOL M72CW' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_hist_id, @c_id);
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_social_id, @c_id);

-- STATS 10: Introduction to Statistical Reasoning (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('STATS 10', 4, 'Introduction to Statistical Reasoning');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'STATS 10' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);

-- STATS 13: Introduction to Statistical Methods for Life and Health Sciences (4 units)
INSERT IGNORE INTO Class (code, units, description) VALUES ('STATS 13', 4, 'Introduction to Statistical Methods for Life and Health Sciences');
SET @c_id = NULL;
SELECT id INTO @c_id FROM Class WHERE code = 'STATS 13' COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES (@r_life_sci_id, @c_id);