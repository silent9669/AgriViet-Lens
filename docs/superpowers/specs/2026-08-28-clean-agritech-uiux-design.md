# 🌾 AgriViet Lens — Clean Field-Utility UI/UX & Production MVP Design Spec

**Date:** 2026-08-28  
**Target Platform:** Google AI Studio / ai.dev, Modern Web Browsers, Mobile Viewports  
**Project:** AgriViet Lens (Google AI Riser Vietnam 2026)  
**Status:** Approved & Ready for Implementation  

---

## 1. Executive Summary & Vision

AgriViet Lens is a multimodal AI crop pathology and microclimate field advisory application designed specifically for Vietnamese farmers, agronomists, and agricultural cooperatives.

This design specification establishes a **Clean Field-Utility UI/UX** redesign:
1. **Elimination of Generic "AI Slop":** Remove dark neon glowing artifacts and replace them with high-contrast, sunlight-visible, tactile agritech design tokens tailored for outdoor and field conditions.
2. **Real-World Image Ingestion & Pathology Scanner:** Streamline drag-and-drop, clipboard paste (`Ctrl+V`), and native camera capture with automatic client-side image optimization (max 1600px canvas scaling) for sub-second Gemini 2.0 Flash multimodal vision diagnosis.
3. **Dual Treatment & Dynamic Spray Tank Dosage Calculator:** Offer clear dual-path treatments (Biological / VietGAP vs. Targeted Chemical) with an interactive dosage calculator for 16L, 25L, and 200L spray tanks, highlighting pre-harvest interval (PHI) quarantine periods.
4. **Voice Field Assistant, Weather Outbreak Radar, & Farm Logbook:** Provide hands-free Vietnamese speech input/output (`vi-VN`), real-time microclimate fungal risk calculations via Open-Meteo API, and a VietGAP-compliant farm logbook with 1-click CSV export.
5. **Zero-Build ai.dev Instant-Run & 1-Click Publishing:** Pure client-side SPA architecture using standard ES Modules and Tailwind CSS with 0 compilation overhead, allowing instant preview and publishing on `ai.dev`.

---

## 2. Visual Identity & Design System (Tokens)

### 2.1 Color Palette
* **Canvas Light (Default):** `#F8FAF9` (Natural soft field ground, anti-glare under bright sunlight)
* **Canvas Dark (Toggle):** `#091A11` (Deep night forest ground for low-light evening inspections)
* **Surface Containers Light:** `#FFFFFF` with subtle border `#E2E8F0` / Shadow `0 1px 3px 0 rgb(0 0 0 / 0.08)`
* **Surface Containers Dark:** `#10261A` with border `#1B3D2B`
* **Primary Agritech Green:** `#047857` (Emerald 700 - healthy crop canopy) and `#065F46` (Emerald 800 - high-emphasis buttons)
* **Accent Crop Amber:** `#D97706` (Amber 600 - ripening grain / moderate risk & organic treatment badges)
* **Urgent Pathology Red:** `#DC2626` (Red 600 - severe infection alert, high fungal risk index, PHI isolation warning)
* **Text Primary:** `#0F172A` (Slate 900) in Light Mode / `#F1F5F9` (Slate 100) in Dark Mode
* **Text Secondary:** `#475569` (Slate 600) in Light Mode / `#94A3B8` (Slate 400) in Dark Mode

### 2.2 Typography Scale
* **Display / Brand / Headers:** `Be Vietnam Pro` (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold) — full Vietnamese diacritical ligature accuracy.
* **Body Text:** `Be Vietnam Pro` (Weights: 400 Regular, 500 Medium) — line-height 1.6 for enhanced field readability.
* **Numerical Metrics & Dosage Data:** `JetBrains Mono` / Tabular figures — clear distinction of `ml`, `g`, `L`, `%`, `days`.

---

## 3. Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGRIVIET LENS HEADER                             │
│  [🌾 Logo & Brand]  [Target Crop Dropdown]  [Theme Toggle]  [API Key]   │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────┐
│                    MAIN NAVIGATION TAB BAR                              │
│  [🔬 Chẩn Đoán Bệnh]  [🎙️ Trợ Lý Giọng Nói]  [⛅ Radar]  [📜 Nhật Ký]  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
 ┌─────────────────────────────────┴────────────────────────────────────┐
 │ TAB 1: SCANNER & PATHOLOGY DIAGNOSIS (Default Active)                │
 │  ┌─────────────────────────────────┐ ┌────────────────────────────┐  │
 │  │ 1. Drag & Dropzone / Camera Snap │ │ 2. Diagnosis Results Card │  │
 │  │    - Real photo upload (4K safe)│ │    - Vietnamese + Latin ID │  │
 │  │    - Clipboard paste (Ctrl+V)   │ │    - Confidence & Severity │  │
 │  │    - 4 Sample Preset Buttons    │ │    - Symptoms breakdown    │  │
 │  │    - Instant thumbnail preview  │ │    - Dual Treatment Tabs:  │  │
 │  │    - "Phân Tích Bằng AI" CTA    │ │      * VietGAP Biological  │  │
 │  │                                 │ │      * Chemical + PHI Days │  │
 │  │                                 │ │    - 16L/25L/200L Tank Calc│  │
 │  │                                 │ │    - Audio & Save Actions  │  │
 │  └─────────────────────────────────┘ └────────────────────────────┘  │
 ├──────────────────────────────────────────────────────────────────────┤
 │ TAB 2: VOICE FIELD ASSISTANT (Web Speech vi-VN + Gemini 2.0 Flash)  │
 │  - Tactile Voice Record Button with active soundwave animation       │
 │  - Quick Voice Question Chips ("Trị rầy nâu", "Xì mủ sầu riêng")     │
 │  - Interactive Chat Feed with TTS Audio Playback button per message │
 ├──────────────────────────────────────────────────────────────────────┤
 │ TAB 3: WEATHER & FUNGAL OUTBREAK RADAR (Open-Meteo API)              │
 │  - 4 Agricultural Regions (ĐBSCL, Tây Nguyên, Đông Nam Bộ, ĐBSH)    │
 │  - Fungal Disease Risk Gauge (Calculated from Temp >22°C & Humidity) │
 │  - 24-Hour Forecast & Timely Pre-Rain Spraying Advisory              │
 ├──────────────────────────────────────────────────────────────────────┤
 │ TAB 4: FARM LOGBOOK & TRACEABILITY (LocalStorage + CSV Export)       │
 │  - Diagnostic History Table with Thumbnails & Status Badges          │
 │  - Lifecycle Status Management (Đang theo dõi -> Đã xử lý -> Đã khỏi)│
 │  - 1-Click "Xuất Báo Cáo CSV (VietGAP)" Button                       │
 └──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Workflow & Real-World Image Handling

### 4.1 Client-Side Image Ingestion Pipeline
```
[User Action: Drag/Drop / File Select / Ctrl+V / Mobile Camera Snap]
                                ↓
[HTML5 FileReader -> Image Object]
                                ↓
[Client Canvas Resizer: Max Dimension 1600px, JPEG Quality 0.85]
  - Prevents multi-MB payload bloat from 48MP smartphone cameras
  - Ensures sub-second Gemini 2.0 Flash API round-trip
                                ↓
[Store base64 URI in State -> Render High-Res Preview with Crop Selector]
                                ↓
[User clicks "🔬 Chẩn Đoán Ngay" OR Preset Click]
                                ↓
[GeminiService.analyzeCropDisease(base64Uri, cropType, apiKey)]
  - IF apiKey present: Call Gemini 2.0 Flash Multimodal REST endpoint
  - IF no apiKey: Fallback to High-Fidelity Offline Diagnostic Database
                                ↓
[Parse & Validate Structured JSON Schema]
                                ↓
[Render Diagnosis Result View + Auto-populate Dosage Calculator + Enable TTS]
```

### 4.2 Spray Tank Dosage Calculator Logic
* **Base Reference Dosage:** Extracted from diagnosis (e.g. `20ml / 16L bình`).
* **Multiplier Matrix:**
  * 16L Bình = `Base × 1.0` (e.g. `20ml`)
  * 25L Bình = `Base × (25 / 16)` = `Base × 1.5625` (e.g. `31.25ml`)
  * 200L Phuy = `Base × (200 / 16)` = `Base × 12.5` (e.g. `250ml`)
* Live calculation updates instantaneously when toggling tank capacity buttons without page reload.

---

## 5. ai.dev Execution & Deployment Protocol

### 5.1 Project Compatibility
* **Zero Native Compilation:** All dependencies loaded via modern browser ES modules (`import`/`export`) and CDN (Tailwind CSS CDN, Google Fonts).
* **Cross-Origin Compatibility:** Gemini REST API and Open-Meteo REST API support direct browser CORS requests.
* **Storage Persistence:** Uses `window.localStorage` for API keys, user settings, and farm logbook records.

### 5.2 1-Prompt Launch in `ai.dev`
Users importing the GitHub repository into `ai.dev` can execute:
```bash
npx serve -l 3000 .
```
and click **Publish** on `ai.dev` to generate an immediate production URL.

---

## 6. Verification & Quality Assurance Criteria

1. **Test Suite Verification:**
   * Unit tests (`tests/test_offline_db.js`, `tests/test_gemini_service.js`, `tests/test_services.js`) pass with 100% success rate.
   * End-to-End integration test (`tests/e2e_test.js`) verifies all 4 tabs and real image pipeline payloads.
2. **Real-World Image Ingestion Verification:**
   * Drag-and-drop, clipboard paste, and preset clicks successfully load and display thumbnail previews without layout shifting.
   * Large image files (5MB+) resize seamlessly without freezing UI.
3. **Accessibility & Contrast Verification:**
   * All text and interactive buttons meet WCAG 2.1 AA contrast ratios in both light and dark modes.
   * Buttons and touch targets exceed 44×44px for effortless field touch interaction.
