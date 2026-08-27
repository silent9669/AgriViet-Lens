# AgriViet Lens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, competition-grade multimodal AI crop disease diagnostic and field advisory Single Page Application for Google AI Riser Vietnam 2026, deploying to Google AI Studio with $0 cost.

**Architecture:** Single Page Application (SPA) with pure client-side ES6 modular JavaScript, Tailwind CSS, Lucide icons, Google Gemini 2.0/1.5 Flash API (Vision + JSON Schema), Web Speech API for Vietnamese voice interactions, Open-Meteo for agricultural weather risk forecasting, and local storage farm logbook.

**Tech Stack:** HTML5, Modern ES6 JavaScript, Tailwind CSS (CDN), Lucide Icons (CDN), Google Gemini API (2.0/1.5 Flash), Web Speech API, Open-Meteo API, LocalStorage.

**Spec:** `docs/superpowers/specs/2026-08-27-agriviet-lens-design.md`

## Global Constraints

- Standalone Single-Page Application (SPA) runnable locally via any static web server and deployable with 1-click on Google AI Studio (`ai.dev` / `ai.studio`) or Cloud Run.
- Zero paid API dependencies — $0 total operational cost using Google AI Studio free tier and free open APIs.
- Bilingual Vietnamese UI by default (localized for Vietnamese farmers) with scientific Latin names for plant pathology.
- Must include built-in offline preset samples for the top 4 Vietnamese agricultural crops (Lúa gạo, Sầu riêng, Cà phê, Thanh long) so judges can evaluate instantaneously without image uploads.
- Strictly formatted JSON schema output from Gemini API with fallback recovery.

---

### Task 1: Project Scaffolding & Core Offline Knowledge Base

**Files:**
- Create: `src/data/offline-diseases.js`
- Create: `tests/test_offline_db.js`
- Create: `package.json`

**Interfaces:**
- Produces: `OFFLINE_DISEASES` dictionary mapping crop keys (`rice`, `durian`, `coffee`, `dragonfruit`) to rich structured diagnostic objects matching the Gemini JSON schema.
- Produces: `getOfflineDiagnosis(cropKey, fallbackQuery)` helper function.

- [ ] **Step 1: Write test for offline disease knowledge base**
  Create `tests/test_offline_db.js` asserting all 4 major Vietnamese crops have comprehensive diagnosis entries with organic remedies, chemical active ingredients, and quarantine days.

- [ ] **Step 2: Run test to verify failure**
  Run: `node tests/test_offline_db.js`
  Expected: FAIL with `Cannot find module '../src/data/offline-diseases.js'`

- [ ] **Step 3: Implement `src/data/offline-diseases.js` and `package.json`**
  Implement the comprehensive offline plant pathology dataset containing authentic diagnostic profiles for:
  - Bệnh Đạo ôn lá lúa (*Pyricularia oryzae*)
  - Bệnh Nứt thân xì mủ sầu riêng (*Phytophthora palmivora*)
  - Bệnh Rỉ sắt cà phê (*Hemileia vastatrix*)
  - Bệnh Đốm nâu mắt cua thanh long (*Neoscytalidium dimidiatum*)

- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/test_offline_db.js`
  Expected: PASS with 4/4 crops verified.

---

### Task 2: Gemini Multimodal Vision & Chat Service Layer

**Files:**
- Create: `src/services/gemini-service.js`
- Create: `tests/test_gemini_service.js`

**Interfaces:**
- Consumes: `OFFLINE_DISEASES` from `src/data/offline-diseases.js`
- Produces: `GeminiService.diagnoseCropImage(base64Image, cropHint, apiKey)`
- Produces: `GeminiService.askFarmingAssistant(question, context, apiKey)`
- Produces: `GeminiService.resizeImageToMax(file, maxDimension)`

- [ ] **Step 1: Write test for Gemini service payload formatting & schema validation**
  Create `tests/test_gemini_service.js` mocking Gemini API endpoints, validating prompt generation, JSON response parsing, and error-fallback to offline database.

- [ ] **Step 2: Run test to verify failure**
  Run: `node tests/test_gemini_service.js`
  Expected: FAIL with `Cannot find module '../src/services/gemini-service.js'`

- [ ] **Step 3: Implement `src/services/gemini-service.js`**
  Implement the Gemini API connector supporting both `gemini-2.0-flash` and `gemini-1.5-flash`, structured JSON schema mode, base64 payload packing, and graceful fallback to offline database when offline or API key is absent.

- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/test_gemini_service.js`
  Expected: PASS

---

### Task 3: Weather Radar & Farm Logbook Service Layers

**Files:**
- Create: `src/services/weather-radar.js`
- Create: `src/services/logbook-service.js`
- Create: `tests/test_services.js`

**Interfaces:**
- Produces: `WeatherRadarService.getAgriculturalRisk(lat, lon)`
- Produces: `LogbookService.getLogs()`, `LogbookService.addLog(entry)`, `LogbookService.updateStatus(id, status)`, `LogbookService.exportToCSV()`

- [ ] **Step 1: Write unit tests for Weather Radar & Logbook Service**
  Create `tests/test_services.js` testing risk score calculations based on humidity/temp thresholds and CRUD operations on the logbook.

- [ ] **Step 2: Run test to verify failure**
  Run: `node tests/test_services.js`
  Expected: FAIL

- [ ] **Step 3: Implement `src/services/weather-radar.js` and `src/services/logbook-service.js`**
  Implement Open-Meteo agricultural risk calculations (humidity > 80% + warm temperatures = high fungal outbreak risk) and LocalStorage backed logbook with CSV export.

- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/test_services.js`
  Expected: PASS

---

### Task 4: Complete Production Single-Page Application (`index.html`)

**Files:**
- Create: `index.html`
- Create: `src/app.js`

**Interfaces:**
- Integrates: `GeminiService`, `WeatherRadarService`, `LogbookService`, `OFFLINE_DISEASES`, and Web Speech API.
- Delivers: Standalone UI with Header, Scanner & Camera stream, Preset Sample Bar, Intelligent Diagnosis View with Dual Organic/Chemical Tabs, Vietnamese Voice Field Assistant, Weather Radar, and Farm Logbook.

- [ ] **Step 1: Implement full interactive UI in `index.html` and modular controllers in `src/app.js`**
  Build the complete responsive user interface with Tailwind CSS, Lucide icons, camera stream selector, drag-drop uploader, interactive tabs, voice audio visualizer, risk radar tiles, and logbook tables. Embed standalone fallback script so `index.html` functions both as a standalone single-file bundle and modular project.

- [ ] **Step 2: Verify static server startup**
  Start static server and test HTTP 200 response on `index.html`.

---

### Task 5: End-to-End Automated Browser Testing

**Files:**
- Create: `tests/e2e_test.js`

**Interfaces:**
- Consumes: `index.html` served locally
- Produces: Comprehensive Playwright / Puppeteer automated test validating UI interactions.

- [ ] **Step 1: Write E2E test script covering all core user journeys**
  - Loading preset sample (Rice Blast) and rendering diagnostic result.
  - Tab switching between "Sinh học / Hữu cơ" and "Hóa học".
  - Adding scan to Farm Logbook and updating status.
  - Querying Vietnamese Voice Copilot.
  - Rendering Weather & Pest Outbreak Radar.

- [ ] **Step 2: Run E2E test suite**
  Run: `node tests/e2e_test.js`
  Expected: PASS with 100% assertions green.

---

### Task 6: AI Studio Packaging, Master Prompt & Submission Guide

**Files:**
- Create: `docs/ai-studio-prompt.md`
- Create: `README.md`

**Interfaces:**
- Produces: Polished master prompt for Google AI Studio (`ai.dev`) vibe-coding.
- Produces: Complete submission documentation with architecture overview, scoring checklist, and deployment links.

- [ ] **Step 1: Create `docs/ai-studio-prompt.md`**
  Format the exact refined prompt following the AI Riser Participant Handbook guidelines.

- [ ] **Step 2: Create `README.md`**
  Document project overview, features, Google tech stack, local run instructions, and 1-click deployment guide.
