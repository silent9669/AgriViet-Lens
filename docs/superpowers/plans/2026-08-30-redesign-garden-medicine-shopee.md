# Mobile-First Redesign, Virtual Garden & Shopee Medicine Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform AgriViet Lens into a spacious, mobile-first agricultural assistant with a 5-tab navigation system, removing sample test clutter for real camera/image drops, adding a realistic Virtual Garden farming simulation game engine, and integrating a Vietnam Shopee medicine finder.

**Architecture:** A modular vanilla JS ES-modules architecture with dedicated services for AI diagnosis (`GeminiService`), weather analysis (`WeatherRadarService`), agricultural pharmacy with Shopee links (`MedicineService`), real-life farming game mechanics (`GardenService`), and VietGAP audit trail (`LogbookService`). All state is coordinated by `AgriVietApp` in `src/app.js` and styled with Hallmark anti-AI-slop design tokens.

**Tech Stack:** Vanilla JavaScript (ES2022 Modules), Tailwind CSS v3 (Play CDN) with Hallmark custom CSS variables (`tokens.css`), HTML5 Camera & Canvas, LocalStorage persistence, Node.js test runner (`node --test` / `assert`).

**Spec:** `docs/superpowers/specs/2026-08-30-redesign-garden-medicine-shopee-design.md`

## Global Constraints

- **Design Philosophy:** Hallmark Anti-AI-Slop (utilitarian-botanical tone, moss `#1b4332`, warm paper `#f7f9f4`, terracotta accents, crisp borders, 48px touch targets, zero oversaturated gradients).
- **Navigation:** 5 accessible tabs (`scanner`, `garden`, `medicine`, `weather`, `logbook`) with ARIA roles (`tablist`, `tab`, `tabpanel`).
- **Data Persistence:** Offline-resilient `localStorage` caching with keys `agriviet_virtual_garden_v1`, `agriviet_logbook_v1`, and `agriviet_theme`.
- **E-Commerce URL Format:** Shopee Vietnam search URL format `https://shopee.vn/search?keyword={encoded_query}`.
- **Testing:** 100% passing tests via `npm test`.

---

### Task 1: Complete and Verify Medicine Service & Shopee Link Generator

**Files:**
- Create/Modify: `src/services/medicine-service.js`
- Test: `tests/test_medicine_service.js`

**Interfaces:**
- Consumes: Predefined catalog `MEDICINE_CATALOG` with active ingredients, target diseases, price ranges, and dosage guides.
- Produces:
  - `MedicineService.getAllMedicines()`: returns `Medicine[]`
  - `MedicineService.searchMedicines(query, category)`: returns filtered `Medicine[]`
  - `MedicineService.findMedicinesForDisease(diseaseName)`: returns matching `Medicine[]`
  - `MedicineService.getShopeeSearchUrl(medicine)`: returns formatted URL string `https://shopee.vn/search?keyword=...`

- [ ] **Step 1: Write the unit test for MedicineService**

```javascript
// tests/test_medicine_service.js
import assert from 'node:assert';
import { MedicineService, MEDICINE_CATALOG } from '../src/services/medicine-service.js';

console.log('Testing MedicineService & Shopee URL generation...');

// 1. Catalog length and structure
assert(Array.isArray(MEDICINE_CATALOG), 'MEDICINE_CATALOG should be an array');
assert(MEDICINE_CATALOG.length >= 8, 'Should have at least 8 catalog items');

// 2. Search by keyword
const searchResult = MedicineService.searchMedicines('Trichoderma');
assert(searchResult.length > 0, 'Should find Trichoderma');
assert(searchResult[0].category === 'bio', 'Trichoderma should be bio category');

// 3. Filter by category
const bioOnly = MedicineService.searchMedicines('', 'bio');
assert(bioOnly.every(m => m.category === 'bio'), 'Should only return bio products');

const chemOnly = MedicineService.searchMedicines('', 'chemical');
assert(chemOnly.every(m => m.category === 'chemical'), 'Should only return chemical products');

// 4. Disease matching
const daoOnMeds = MedicineService.findMedicinesForDisease('Bệnh đạo ôn lá lúa');
assert(daoOnMeds.length >= 2, 'Should find multiple medicines for Dao On');

// 5. Shopee URL generation
const shopeeUrl = MedicineService.getShopeeSearchUrl(MEDICINE_CATALOG[0]);
assert(shopeeUrl.startsWith('https://shopee.vn/search?keyword='), 'Should generate valid Shopee Vietnam search URL');
assert(shopeeUrl.includes(encodeURIComponent(MEDICINE_CATALOG[0].shopeeKeyword)), 'URL must encode keyword');

console.log('✅ MedicineService tests passed successfully!');
```

- [ ] **Step 2: Run test to verify status**

Run: `node tests/test_medicine_service.js`
Expected: Output showing test assertions.

- [ ] **Step 3: Implement `src/services/medicine-service.js`**

Ensure all 10+ items are well structured (Trichoderma, Bacillus, Nano Bạc, Beam 75WP, Aliette 800WG, Anvil 5SC, Amistar Top, Ridomil Gold, Score 250EC, SK Enspray 99 EC).

- [ ] **Step 4: Run test and verify it passes**

Run: `node tests/test_medicine_service.js`
Expected: PASS with `✅ MedicineService tests passed successfully!`

- [ ] **Step 5: Commit**

```bash
git add src/services/medicine-service.js tests/test_medicine_service.js
git commit -m "feat: complete MedicineService with Shopee Vietnam search generator"
```

---

### Task 2: Implement and Verify Virtual Garden Simulation Engine

**Files:**
- Create/Modify: `src/services/garden-service.js`
- Test: `tests/test_garden_service.js`

**Interfaces:**
- Consumes: `localStorage` (or mock storage in tests), plant templates `PLANT_TEMPLATES`.
- Produces:
  - `GardenService.getPlots()`: returns `FarmPlot[]`
  - `GardenService.addPlot(templateKey, customName)`: returns new `FarmPlot`
  - `GardenService.performCare(plotId, actionType)`: actions: `'water' | 'fertilize' | 'treat' | 'harvest'`
  - `GardenService.logDisease(plotId, diseaseData)`: attaches diagnosis note to plot
  - `GardenService.applyWeatherEffect(weatherData)`: updates plots based on live microclimate
  - `GardenService.deletePlot(plotId)`: removes plot

- [ ] **Step 1: Write the unit test for GardenService**

```javascript
// tests/test_garden_service.js
import assert from 'node:assert';
import { GardenService, PLANT_TEMPLATES } from '../src/services/garden-service.js';

// Setup mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

console.log('Testing GardenService simulation game engine...');

// 1. Initial plots
const initialPlots = GardenService.getPlots();
assert(Array.isArray(initialPlots), 'Should return an array of plots');
assert(initialPlots.length >= 2, 'Should pre-seed starter plots');

// 2. Add new plot
const newPlot = GardenService.addPlot('rice', 'Ruộng thử nghiệm ST25');
assert(newPlot.id, 'New plot must have an ID');
assert.strictEqual(newPlot.plantKey, 'rice');
assert.strictEqual(newPlot.growthStage, 'seedling');

// 3. Care actions (Water, Fertilize)
const watered = GardenService.performCare(newPlot.id, 'water');
assert(watered.moisture >= 80, 'Watering should increase moisture');

const fertilized = GardenService.performCare(newPlot.id, 'fertilize');
assert(fertilized.growthProgress > 0, 'Fertilizing should advance growth progress');

// 4. Disease logging & treatment
const diseased = GardenService.logDisease(newPlot.id, {
  diseaseName: 'Đạo ôn lá',
  severity: 'medium',
  notes: 'Đốm mắt én xuất hiện'
});
assert(diseased.activeDiseases.length === 1, 'Plot should record active disease');
assert(diseased.healthScore < 100, 'Disease should lower health score');

const treated = GardenService.performCare(newPlot.id, 'treat');
assert(treated.activeDiseases.length === 0, 'Treatment should cure active disease');

// 5. Weather reaction
GardenService.applyWeatherEffect({ temp: 36, humidity: 90, rainProb: 80 });
const updatedPlots = GardenService.getPlots();
assert(updatedPlots.length > 0);

console.log('✅ GardenService tests passed successfully!');
```

- [ ] **Step 2: Run test to verify fails/passes**

Run: `node tests/test_garden_service.js`

- [ ] **Step 3: Implement `src/services/garden-service.js`**

Implement complete simulation logic with 5 growth stages, realistic growth cycles, moisture depletion, disease recovery, weather reactions, and localStorage saving.

- [ ] **Step 4: Run test and verify it passes**

Run: `node tests/test_garden_service.js`
Expected: PASS with `✅ GardenService tests passed successfully!`

- [ ] **Step 5: Commit**

```bash
git add src/services/garden-service.js tests/test_garden_service.js
git commit -m "feat: implement Virtual Garden simulation engine with real-life growth cycles"
```

---

### Task 3: Redesign Layout, Tokens & Responsive Hallmark CSS

**Files:**
- Modify: `tokens.css`
- Modify: `index.html` (CSS styles in `<style>`)
- Test: `tests/test_hallmark_tokens.js`

**Interfaces:**
- Consumes: CSS variables for colors, typography, elevations, and radii.
- Produces:
  - 5-tab responsive navigation (`#navTabScanner`, `#navTabGarden`, `#navTabMedicine`, `#navTabWeather`, `#navTabLogbook`).
  - Mobile-first layout: stacked column layout on mobile (`< 768px`) and readable spacious 2-column on desktop (`>= 1024px`).
  - Virtual Garden interactive plot grid (`.garden-grid`, `.plot-card`, `.progress-bar`, `.care-btn-group`).
  - Pharmacy product cards (`.medicine-grid`, `.medicine-card`, `.shopee-btn`).
  - Clean Scanner view without sample presets clutter.

- [ ] **Step 1: Update `tokens.css` with garden and pharmacy badge tokens**
- [ ] **Step 2: Update `index.html` styles for 5 tabs, garden grid, pharmacy catalog, and mobile responsiveness**
- [ ] **Step 3: Run token test**

Run: `node tests/test_hallmark_tokens.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tokens.css index.html
git commit -m "style: implement responsive 5-tab layout and hallmark anti-slop styling"
```

---

### Task 4: Implement HTML Markup & App Controller for All 5 Tabs

**Files:**
- Modify: `index.html` (HTML structure)
- Modify: `src/app.js` (Event handlers, tab switching, garden UI rendering, medicine search & Shopee integration)

**Interfaces:**
- Consumes: `GardenService`, `MedicineService`, `GeminiService`, `WeatherRadarService`, `LogbookService`.
- Produces:
  - `AgriVietApp.switchTab(tabKey)`: switches active view among `scanner`, `garden`, `medicine`, `weather`, `logbook`.
  - `AgriVietApp.renderGarden()`: renders plot cards, stage badges, care buttons, and add-plot modal.
  - `AgriVietApp.renderMedicineCatalog(query, category)`: renders filtered medicine cards with Shopee direct links.
  - `AgriVietApp.handleCameraCapture()`: triggers camera input and processes preview.
  - `AgriVietApp.renderDiagnosis(diagnosis)`: renders diagnosis + matching Shopee treatment cards.

- [ ] **Step 1: Update `index.html` markup**
  - Add `navTabGarden` and `navTabMedicine` to header tablist.
  - Clean `viewScanner` by removing sample presets grid and adding camera action button and Shopee treatment recommendations.
  - Add `viewGarden` section with plot summary stats, "+ Thêm thửa ruộng" button, weather advisory banner, and interactive plot cards.
  - Add `viewMedicine` section with search bar, category tabs, and medicine cards grid.
- [ ] **Step 2: Update `src/app.js` controller**
  - Import `GardenService` and `MedicineService`.
  - Add tab handling for `garden` and `medicine`.
  - Implement plot action event delegations (`data-plot-id`, `data-action`).
  - Implement medicine search & filter listeners.
  - Connect diagnosis result to both Shopee links and "Thêm vào vườn ảo" / "Ghi nhật ký" flows.
- [ ] **Step 3: Test and verify manually / via unit tests**
- [ ] **Step 4: Commit**

```bash
git add index.html src/app.js
git commit -m "feat: wire 5-tab workspace, virtual garden game, and pharmacy shopee finder"
```

---

### Task 5: Update Test Suites, E2E Verification & Browser Check

**Files:**
- Modify: `package.json`
- Modify: `tests/test_services.js`
- Modify: `tests/e2e_test.js`

- [ ] **Step 1: Update `package.json` test script to run all unit test files**
- [ ] **Step 2: Update `tests/test_services.js` and `tests/e2e_test.js` to cover 5 tabs and new services**
- [ ] **Step 3: Run `npm test` and verify 100% pass rate**
- [ ] **Step 4: Launch local server and verify visually in browser**
- [ ] **Step 5: Commit**

```bash
git add package.json tests/
git commit -m "test: add comprehensive test suite for garden and medicine shopee services"
```
