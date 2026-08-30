# AgriViet Lens - System Redesign, Virtual Garden Game & Medicine Shopee Finder Specification

**Date:** 2026-08-30  
**Status:** Approved by User  
**Design Standard:** Hallmark Anti-AI-Slop · Utilitarian Botanical · Mobile-First Responsive  

---

## 1. Overview & Objectives

This specification outlines the comprehensive architectural upgrade for **AgriViet Lens**:
1. **Responsive & Uncluttered Layout:** Replace cramped zero-scroll design with a spacious, highly readable mobile-first layout. Remove synthetic sample presets to prioritize real user photo uploads and live camera capture.
2. **5-Tab Navigation System:**
   - 🌿 **Chẩn đoán (Scan):** AI-powered crop diagnosis, severity scoring, VietGAP dosage calculator, and integrated Shopee medicine cards.
   - 🌱 **Vườn ảo (Virtual Garden):** Real-life farming simulation game engine with growth stages, care actions (watering, fertilizing, treating), real-time weather integration, disease logging, and care reminders.
   - 💊 **Tủ thuốc (Pharmacy & Shopee):** Searchable agricultural medicine catalog (biological and chemical) with market price estimates (VND), PHI quarantine days, safe dosage guides, and direct Shopee Vietnam search links.
   - 🌦️ **Vi khí hậu (Weather Radar):** Live microclimate metrics, agricultural risk alerts, and spraying feasibility.
   - 📓 **Nhật ký (VietGAP Logbook):** Farm audit logs, spray records, and harvest reports.
3. **Anti-AI-Slop Aesthetic:** Built with Hallmark design tokens (Be Vietnam Pro, JetBrains Mono, organic moss `#1b4332`, warm paper `#f7f9f4`, terracotta accents, crisp borders, 48px touch targets, zero oversaturated generic gradients).
4. **Offline Resilience & Data Persistence:** Local storage synchronization (`agriviet_virtual_garden_v1`, `agriviet_logbook_v1`) ensuring full usability even without internet or when API quotas are exceeded.

---

## 2. Architecture & Component Structure

### 2.1 Navigation & Main Shell
- **Sticky Top Bar:**
  - Brand identity: Logo mark + `AgriViet Lens` + `Bác sĩ cây trồng AI & Vườn nông nghiệp thông minh`.
  - Model switcher toggle: `⚡ Gemini 2.0 Flash` (instant) vs `🧠 Gemini Pro Chuyên Sâu` (deep reasoning).
  - System controls: API key configuration modal trigger with connection status dot + Dark/Light theme toggle.
- **Segmented Tab Navigation:**
  - 5 interactive tabs with SVG icons: `Chẩn đoán`, `Vườn ảo`, `Tủ thuốc`, `Vi khí hậu`, `Nhật ký`.
  - Horizontally scrollable with touch-friendly 52px height on mobile screens; full-width flex bar on desktop.

### 2.2 Scanner & Diagnosis View (`viewScanner`)
- **Input Column:**
  - Drag-and-drop dropzone with device file picker.
  - Dedicated **"Chụp ảnh từ camera"** action button opening the device environment camera.
  - Crop category selector pills (Lúa nước, Sầu riêng, Cà phê, Thanh long, Rau màu, Tự động phát hiện).
  - Selected image preview card with dimension, file size, and crop metadata.
- **Results Column:**
  - Diagnosis status banner (Confidence rating, Disease severity badge: *Nhẹ*, *Trung bình*, *Nguy hiểm*).
  - Vietnamese disease name and Latin scientific name.
  - Cause & Field symptoms description.
  - Segmented treatment protocol:
    - 🟢 **Sinh học (VietGAP)**: Safe bio-fungicides/pesticides with 0-day PHI.
    - 🔵 **Hóa học đặc trị**: Targeted chemical fungicides with quarantine warnings.
  - Backpack/Phuy tank sprayer calculator (16L, 25L, 200L).
  - **Embedded Shopee Medicine Cards:** Direct links to purchase matching treatments on Shopee Vietnam with verified price ranges.

### 2.3 Virtual Garden Simulation Game (`viewGarden`)
- **Core Engine (`GardenService`):**
  - **Crop Templates:**
    - `Lúa Nước ST25` (Ngũ cốc — 95 ngày)
    - `Sầu Riêng Ri6` (Cây ăn trái — 120 ngày)
    - `Cà Phê Robusta` (Cây công nghiệp — 180 ngày)
    - `Thanh Long Ruột Đỏ` (Cây ăn quả nhiệt đới — 45 ngày)
    - `Rau Cải Xanh VietGAP` (Rau ngắn ngày — 30 ngày)
    - *Custom crop creation:* Support any user-specified plant name and category.
  - **Growth Stages & Visual Progression:**
    - Seedling (Mầm) → Vegetative (Cây non / Đẻ nhánh) → Flowering (Làm đòng / Ra hoa) → Fruiting (Nuôi trái) → Ready to Harvest (Thu hoạch).
  - **Plot State Metrics:**
    - Health Score (0% – 100%).
    - Soil Moisture Level (Khô hạn / Vừa đủ / Quá ẩm).
    - Days Planted & Days Remaining until Harvest.
    - Active Disease List (attached symptoms & diagnosis references).
  - **Interactive Player Actions:**
    - 💧 **Tưới nước (Water):** Increases moisture and vitality.
    - 🌿 **Bón phân (Fertilize):** Increases growth stage progress and health.
    - 🔍 **Ghi bệnh (Log Disease):** Links diagnosis notes from scanner to this plot.
    - 💊 **Phun thuốc trị bệnh (Treat):** Clears disease status using pharmacy items.
    - 🌾 **Thu hoạch (Harvest):** Marks crop complete, awards harvest summary, and logs entry to VietGAP Logbook.
  - **Weather Integration:**
    - High heat (>35°C) increases moisture depletion.
    - Rain increases moisture automatically and alerts to fungal disease vulnerability if humidity >85%.
  - **Plot Management:** Add new plot, delete plot, reset farm.

### 2.4 Agricultural Pharmacy & Shopee Link Generator (`viewMedicine`)
- **Core Engine (`MedicineService`):**
  - **Curated Medicine Catalog:**
    - Biologicals: *Trichoderma viride/harzianum*, *Bacillus subtilis*, *Nano Bạc Đồng sinh học*, *Dầu khoáng SK Enspray*.
    - Specific Chemicals: *Beam 75WP (Tricyclazole)*, *Aliette 800WG (Fosetyl-Aluminium)*, *Anvil 5SC (Hexaconazole)*, *Amistar Top 325SC*, *Ridomil Gold 68WG*, *Score 250EC*.
  - **Search & Filter Functions:**
    - Search by product name, active ingredient, or disease keyword.
    - Filter by category: `all`, `bio` (VietGAP Sinh học), `chemical` (Hóa học đặc trị).
  - **Information Architecture per Card:**
    - Product title, category badge, and active ingredients.
    - Target diseases list as tags.
    - Market price estimate in VND (e.g. `45.000₫ – 70.000₫ / gói 500g`).
    - Dosage instructions per 16L sprayer and 200L tank.
    - Quarantine period (PHI days) & safety guidance.
    - **Shopee Search Button:** URL formatted as `https://shopee.vn/search?keyword={encoded_keyword}` for instant purchase on Shopee Vietnam.

### 2.5 Weather Radar & Microclimate (`viewWeather`)
- Region selector (Đồng bằng Sông Cửu Long, Tây Nguyên, Đông Nam Bộ, Đồng bằng Sông Hồng, Duyên hải Miền Trung).
- Temperature, Humidity, Rainfall, Wind speed, and UV index.
- Fungal & Pest outbreak risk level calculator.
- Spraying feasibility indicator (Nên phun / Không nên phun).

### 2.6 VietGAP Logbook (`viewLogbook`)
- Filterable log entries (Chẩn đoán, Phun thuốc, Bón phân, Thu hoạch).
- Search by crop, disease, or date range.
- Export to JSON and CSV for VietGAP compliance auditing.

---

## 3. Data Flow & State Management

```
[ Camera / Photo Upload ] ──► [ ImageProcessor ] ──► [ GeminiService (Flash/Pro) / Offline DB ]
                                                              │
                                                              ▼
                                                     [ Diagnosis Result ]
                                                              │
                     ┌────────────────────────────────────────┴──────────────────────────────────────┐
                     ▼                                                                               ▼
         [ Scanner Results UI ]                                                        [ Shopee Medicine Links ]
                     │                                                                               │
                     ▼                                                                               ▼
     [ "Gán vào Vườn Ảo" / "Ghi Nhật Ký" ]                                              [ Direct Buy on Shopee.vn ]
                     │
                     ▼
         [ GardenService State ] ◄──── [ WeatherRadarService Data ]
         (localStorage persistence)
```

---

## 4. Design System Tokens (Hallmark Anti-AI-Slop)

- **Palette:**
  - `--color-primary`: `#1b4332` (Forest Moss Green)
  - `--color-primary-hover`: `#143225`
  - `--color-primary-soft`: `#e8f0eb`
  - `--color-accent`: `#b25d38` (Terracotta Clay)
  - `--color-accent-soft`: `#f9ede8`
  - `--color-paper`: `#f7f9f4` (Warm Agricultural Ground)
  - `--color-surface`: `#ffffff`
  - `--color-surface-soft`: `#eef2e6`
  - `--color-ink`: `#1a201b` (Deep Charcoal Ink)
  - `--color-muted`: `#4a554b`
  - `--color-border`: `#d8dfd5`
- **Typography:**
  - Primary sans: `'Be Vietnam Pro', system-ui, sans-serif`
  - Monospace (metrics, prices, dosages): `'JetBrains Mono', monospace`
- **Component Geometry:**
  - Button min-height: `48px` (touch-friendly mobile target)
  - Card radius: `12px` / `16px`
  - Border width: `1px` solid semantic border

---

## 5. Verification & Test Plan

1. **Tokens & Anti-Slop:** `tests/test_hallmark_tokens.js` verifies all CSS tokens, Be Vietnam Pro font declarations, and absence of generic AI slop styles.
2. **Gemini & Offline Fallback:** `tests/test_gemini_service.js` verifies multimodal Gemini 2.0 Flash / Pro calling and offline fallback knowledge base.
3. **Medicine & Shopee Service:** `tests/test_medicine_service.js` verifies catalog search, category filters, price ranges, and valid Shopee URL generation.
4. **Virtual Garden Service:** `tests/test_garden_service.js` verifies plot creation, growth stages, daily care actions (water, fertilize, treat), disease attachment, weather reaction, and harvest flow.
5. **Weather & Logbook Services:** `tests/test_services.js` verifies microclimate alerts and logbook persistence.
6. **E2E & UI Flow Verification:** Verify all 5 tab switches, file uploads, medicine search, and garden simulation actions.
