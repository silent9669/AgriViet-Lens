# Clean Field-Utility UI/UX & Production MVP Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild AgriViet Lens into a clean, field-utility, production-ready MVP with zero "AI slop", instant drag-and-drop/paste/camera real-world image diagnostics, dynamic 16L/25L/200L spray tank calculation, and 1-click execution readiness on `ai.dev`.

**Architecture:** Client-side Single Page Application (SPA) utilizing ES Modules, Tailwind CSS CDN with custom agritech design tokens, client-side Canvas image optimization, Google Gemini 2.0 Flash Multimodal API with high-fidelity offline fallback, Web Speech API (`vi-VN`), Open-Meteo REST API, and LocalStorage-backed Farm Logbook with CSV export.

**Tech Stack:** HTML5, Modern Vanilla JavaScript (ES2022 Modules), Tailwind CSS, Web Speech API, Google Gemini REST API, Open-Meteo API.

**Spec:** `docs/superpowers/specs/2026-08-28-clean-agritech-uiux-design.md`

## Global Constraints
* **Zero Build Step:** Keep pure vanilla HTML5/ES modules so it runs instantly via `npx serve -l 3000 .` without npm build/compile scripts.
* **No AI Slop:** Strictly apply `#F8FAF9` light canvas (with `#091A11` dark toggle), `#047857` deep emerald primary, `#D97706` amber accents; no dark neon purple glowing aesthetics.
* **Vietnamese Diacritics & Field Legibility:** Use `Be Vietnam Pro` font family with high contrast (WCAG AA compliant) and touch targets ≥ 44px.
* **Fast Real-World Image Handling:** Automatically compress/resize client images to max 1600px dimension before sending to Gemini API.

---

### Task 1: Image Processing & Dosage Calculation Utility Helpers

**Files:**
- Create: `src/utils/image-processor.js`
- Create: `src/utils/dosage-calculator.js`
- Test: `tests/test_utils.js`

**Interfaces:**
- `ImageProcessor.optimizeImage(fileOrDataUrl, maxDim = 1600, quality = 0.85): Promise<{ base64: string, mimeType: string, width: number, height: number }>`
- `DosageCalculator.calculateTankDosage(baseInstruction, targetCapacityLiters): { capacityLiters: number, calculatedDosageText: string, multiplier: number }`

- [ ] **Step 1: Write the unit test for ImageProcessor & DosageCalculator**

```javascript
// tests/test_utils.js
import assert from 'node:assert';
import { DosageCalculator } from '../src/utils/dosage-calculator.js';

console.log('Testing DosageCalculator utility...');

// Test 1: Standard 16L base dosage scaling to 25L and 200L
const base20ml = '20ml / bình 16L';
const calc16 = DosageCalculator.calculateTankDosage(base20ml, 16);
assert.strictEqual(calc16.capacityLiters, 16);
assert.strictEqual(calc16.multiplier, 1.0);
assert.ok(calc16.calculatedDosageText.includes('20'));

const calc25 = DosageCalculator.calculateTankDosage(base20ml, 25);
assert.strictEqual(calc25.capacityLiters, 25);
assert.strictEqual(calc25.multiplier, 1.5625);
assert.ok(calc25.calculatedDosageText.includes('31.25') || calc25.calculatedDosageText.includes('31.3'));

const calc200 = DosageCalculator.calculateTankDosage(base20ml, 200);
assert.strictEqual(calc200.capacityLiters, 200);
assert.strictEqual(calc200.multiplier, 12.5);
assert.ok(calc200.calculatedDosageText.includes('250'));

// Test 2: Extraction when dosage contains grams
const baseGrams = '25g pha cho bình 16L nước';
const calcGrams200 = DosageCalculator.calculateTankDosage(baseGrams, 200);
assert.ok(calcGrams200.calculatedDosageText.includes('312.5') || calcGrams200.calculatedDosageText.includes('313'));

console.log('✅ DosageCalculator tests passed!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/test_utils.js`  
Expected: FAIL (`Cannot find module '../src/utils/dosage-calculator.js'`)

- [ ] **Step 3: Implement DosageCalculator and ImageProcessor**

Create `src/utils/dosage-calculator.js`:
```javascript
/**
 * Utility for parsing and scaling agricultural chemical & biological dosage for spray tanks
 */
export class DosageCalculator {
  /**
   * Calculates scaled dosage for 16L, 25L or 200L tanks based on base dosage instruction
   * @param {string} baseInstruction e.g., "20ml / bình 16L" or "25g / 16L"
   * @param {number} targetCapacityLiters 16 | 25 | 200
   * @returns {{ capacityLiters: number, multiplier: number, calculatedDosageText: string }}
   */
  static calculateTankDosage(baseInstruction, targetCapacityLiters = 16) {
    const targetLiters = Number(targetCapacityLiters) || 16;
    const multiplier = targetLiters / 16;

    if (!baseInstruction) {
      return {
        capacityLiters: targetLiters,
        multiplier,
        calculatedDosageText: `Pha đúng tỷ lệ khuyến cáo cho bình ${targetLiters}L.`
      };
    }

    // Match numbers with units (ml, g, gam, cc, gói)
    const match = baseInstruction.match(/(\d+(?:[.,]\d+)?)\s*(ml|g|gam|cc|gói|viên)/i);
    if (match) {
      const originalAmount = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toLowerCase();
      const scaledAmount = (originalAmount * multiplier).toFixed(1).replace(/\.0$/, '');

      return {
        capacityLiters: targetLiters,
        multiplier,
        calculatedDosageText: `${scaledAmount} ${unit} / bình ${targetLiters}L nước (Tỷ lệ gốc: ${originalAmount} ${unit} / 16L)`
      };
    }

    return {
      capacityLiters: targetLiters,
      multiplier,
      calculatedDosageText: `${baseInstruction} (Dung tích áp dụng: ${targetLiters}L, hệ số x${multiplier})`
    };
  }
}
```

Create `src/utils/image-processor.js`:
```javascript
/**
 * Client-side high-performance image compression and canvas scaling
 */
export class ImageProcessor {
  /**
   * Resizes an image file or data URI to max dimension to prevent API payload bloat
   * @param {File|string} source File object or base64 data URI
   * @param {number} maxDim Maximum width/height in px (default: 1600)
   * @param {number} quality JPEG compression quality 0-1 (default: 0.85)
   * @returns {Promise<{ base64: string, mimeType: string, width: number, height: number }>}
   */
  static async optimizeImage(source, maxDim = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      // In Node.js / test environments without window/Image
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        const base64Str = typeof source === 'string' ? source : '';
        return resolve({
          base64: base64Str,
          mimeType: 'image/jpeg',
          width: 800,
          height: 600
        });
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);

        resolve({ base64, mimeType, width, height });
      };

      img.onerror = (err) => reject(new Error('Failed to load image for optimization: ' + err));

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File || source instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      } else {
        reject(new Error('Invalid image source type'));
      }
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/test_utils.js`  
Expected: PASS (`✅ DosageCalculator tests passed!`)

- [ ] **Step 5: Commit**

```bash
git add src/utils/dosage-calculator.js src/utils/image-processor.js tests/test_utils.js
git commit -m "feat: add client image optimizer and spray tank dosage calculator utilities"
```

---

### Task 2: Rebuild `index.html` with Clean Agritech Design Tokens

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Tailwind CSS CDN, Google Fonts (`Be Vietnam Pro`, `JetBrains Mono`)
- Produces: Clean UI structure with Light/Dark mode support, Hero Scanner Dropzone, 4 Presets Bar, Diagnostic Results Card with Dual Tabs, 16L/25L/200L Tank Selector, Voice Assistant Tab, Weather Radar Tab, and Farm Logbook Table.

- [ ] **Step 1: Update `index.html`**

Update `index.html` with:
1. Palette tokens: `#F8FAF9` light canvas ground, `#047857` deep emerald, `#D97706` amber accents, `#DC2626` urgent alerts.
2. Light mode by default with seamless toggle to `#091A11` night mode.
3. Clean, tactile dropzone with clipboard paste notice, camera trigger, drag-hover visual cues, and 4 preset buttons.
4. Structured pathology dashboard with confidence meter, severity pill, symptoms list, dual treatment tabs, and spray tank capacity selector (`16L`, `25L`, `200L`).
5. Voice Assistant, Weather Radar, and Farm Logbook UI panels.
6. API Key modal with clear Gemini Free Tier instructions.

- [ ] **Step 2: Verify HTML syntax & local server rendering**

Run: `node -e "const fs = require('fs'); const html = fs.readFileSync('index.html', 'utf8'); console.log('HTML size:', html.length, 'bytes');"`  
Expected: Valid HTML file loaded without syntax errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): rebuild index.html with clean field-utility agritech layout and tokens"
```

---

### Task 3: Update Controller `src/app.js` with Real-World Image & Dosage Logic

**Files:**
- Modify: `src/app.js`

**Interfaces:**
- Consumes: `ImageProcessor`, `DosageCalculator`, `GeminiService`, `WeatherRadarService`, `LogbookService`, `SAMPLE_PRESETS`
- Produces: Integrated controller managing drag/drop, paste, real-world image resizing, instant preset diagnostics, interactive tank dosage switching, voice assistant, and logbook updates.

- [ ] **Step 1: Wire ImageProcessor, DosageCalculator, and Theme Toggle in `src/app.js`**

1. Integrate clipboard `paste` event listener on `window` to capture pasted screenshots.
2. Integrate drag-and-drop events on the scanner dropzone.
3. Use `ImageProcessor.optimizeImage` for all uploaded/dropped/pasted images before triggering diagnosis.
4. Implement dynamic tank capacity switching (`16L`, `25L`, `200L`) that triggers `DosageCalculator.calculateTankDosage` and updates the chemical dosage display in real-time.
5. Implement Light/Dark theme toggle with `localStorage` persistence.
6. Update results display to match the clean agritech design.

- [ ] **Step 2: Run unit and service test suites**

Run: `npm test`  
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "feat(app): integrate client image optimizer, clipboard paste, and dynamic tank dosage in controller"
```

---

### Task 4: Enhance End-to-End Test Suite for Real-World Workflows

**Files:**
- Modify: `tests/e2e_test.js`
- Modify: `package.json` (add `test_utils.js` to `npm test`)

**Interfaces:**
- Consumes: All services and utilities
- Produces: 100% automated verification of image pipeline, dosage calculator, Gemini service, weather risk index, and logbook CSV export.

- [ ] **Step 1: Update `package.json` and `tests/e2e_test.js`**

Ensure `npm test` runs all unit tests including `tests/test_utils.js`.
Add test assertions in `tests/e2e_test.js` for:
1. Tank dosage calculation across 16L, 25L, and 200L.
2. Offline diagnosis fallback for all 4 crop presets.
3. Weather radar risk index calculation for all 4 Vietnamese regions.
4. Logbook record creation and CSV string export.

- [ ] **Step 2: Run the full test suite**

Run: `npm test && npm run test:e2e`  
Expected: All test suites PASS with 100% green output.

- [ ] **Step 3: Commit**

```bash
git add package.json tests/e2e_test.js
git commit -m "test: add comprehensive e2e verification for clean agritech rebuild"
```

---

### Task 5: Update `docs/ai-studio-prompt.md` & `README.md` for 1-Click `ai.dev` Publishing

**Files:**
- Modify: `docs/ai-studio-prompt.md`
- Modify: `README.md`

**Interfaces:**
- Produces: 1-click instruction and master prompt for Google AI Studio / `ai.dev` web builder.

- [ ] **Step 1: Update documentation files**

Include clear instructions for `ai.dev` import, local testing (`npx serve -l 3000 .`), and 1-click publishing.

- [ ] **Step 2: Commit**

```bash
git add docs/ai-studio-prompt.md README.md
git commit -m "docs: update 1-click ai.dev execution and publishing guide"
```
