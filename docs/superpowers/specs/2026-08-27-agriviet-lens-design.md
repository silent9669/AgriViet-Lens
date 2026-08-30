# AgriViet Lens - Design Specification
**Project:** AgriViet Lens (Trợ Lý Nông Nghiệp & Cảnh Báo Sâu Bệnh Đa Phương Thức)
**Competition:** Google AI Riser Vietnam 2026
**Target Platform:** Google AI Studio (ai.dev / ai.studio) + Responsive Web SPA
**Date:** 2026-08-27
**Author:** AI Riser Builder Team

---

## 1. Executive Summary & Goals

AgriViet Lens is an AI-powered agricultural diagnosis and field advisory platform designed specifically for Vietnamese farmers, agronomists, and agricultural cooperatives. It solves the critical challenge of crop disease detection, localized treatment planning, and pest outbreak prevention across Vietnam's key export and staple crops (Lúa gạo, Sầu riêng, Cà phê, Thanh long, and Rau củ).

### Competition & Scoring Objectives
1. **Google Tech Integration (+10 Bonus Points):**
   - **Google Gemini 2.0 / 1.5 Flash:** Multimodal visual diagnosis of plant pathology, structured diagnostic JSON schemas, and streaming Q&A.
   - **Google Search Grounding / Agricultural Advisory:** Live contextual agricultural best practices.
   - **Web Speech Engine (Vietnamese vi-VN):** Speech-to-Text and Text-to-Speech for hands-free field operation.
   - **Google Maps / Weather Radar:** Agricultural micro-climate risk assessment based on humidity, temperature, and precipitation.
2. **1-Click Publishing & Deployment (+10 Bonus Points):**
   - Zero-dependency Single Page Application (SPA) compatible with Google AI Studio Starter Tier hosting (`*.ai.studio`), Cloud Run, and GitHub Pages.
   - $0 Total API & Hosting cost.
3. **Instant Interactive Judge Demo:**
   - Preloaded high-resolution diagnostic samples (Rice Blast, Durian Phytophthora, Coffee Leaf Rust, Dragon Fruit Brown Spot) for 1-click evaluation without requiring camera permissions or image uploads.

---

## 2. Architecture & Tech Stack

### 2.1 Tech Stack
- **Frontend Architecture:** Clean Modular HTML5 + Modern ES6 Modules / Vanilla JavaScript.
- **Styling & UI:** Tailwind CSS (CDN) + Lucide Icons (CDN) + Google Inter/Be Vietnam Pro Fonts.
- **AI Core:** Google Gemini 2.0/1.5 Flash API (Multimodal Vision & Chat with JSON Schema mode).
- **Speech Engine:** Native Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis` with `vi-VN` localization).
- **Weather & Environmental Risk:** Open-Meteo Agricultural Weather API (free, no API key required) for temperature, relative humidity, and precipitation.
- **State & Offline Storage:** Browser `localStorage` with JSON export/import and optional Firebase synchronization.

### 2.2 System Diagram

```
+-------------------------------------------------------------------------------+
|                               Browser Client (SPA)                            |
|                                                                               |
|  +---------------------+   +---------------------+   +---------------------+  |
|  |   Camera / Upload   |   |  Voice Copilot      |   |  Weather Risk Radar |  |
|  |  (HTML5 Media API)  |   |  (Web Speech API)   |   |  (Geo & Open-Meteo) |  |
|  +----------+----------+   +----------+----------+   +----------+----------+  |
|             |                         |                         |             |
|             v                         v                         v             |
|  +-------------------------------------------------------------------------+  |
|  |                      Core Application State Manager                     |  |
|  |    - Image preprocessing (Canvas base64 compression & resizing)         |  |
|  |    - API Key & Session Settings management                              |  |
|  |    - Offline Fallback Diagnostic Knowledge Base                         |  |
|  |    - Farm Logbook (CRUD & LocalStorage Persistence)                     |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
+---------------------------------------+---------------------------------------+
                                        | HTTPS (REST / JSON)
                                        v
+-------------------------------------------------------------------------------+
|                       Google Gemini 2.0 / 1.5 Flash API                       |
|   - Multimodal Vision Pathology Diagnosis (Structured JSON Schema)            |
|   - Conversational Vietnamese Field Advisory                                 |
|   - VietGAP / Organic / Chemical Treatment Generator                         |
+-------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Specifications

### 3.1 Multimodal Crop Doctor (Chẩn Đoán Bệnh Cây Trồng)
- **Input Channels:**
  1. Live Camera Stream (rear/front camera toggle on mobile).
  2. Image File Upload (drag & drop / file selector with automatic resizing to < 1024px for fast transmission).
  3. Preset Sample Selector (4 pre-configured pathological cases with instant 1-click loading).
- **Processing:**
  - Converts image to clean JPEG base64.
  - Submits to Gemini API with dedicated agricultural pathologist prompt and strict JSON schema.
- **Output Display:**
  - Disease Name (Vietnamese & Latin Scientific name).
  - Confidence Score (%) and Severity Badge (Nhẹ / Trung bình / Nguy cấp).
  - Identified Crop Category.
  - Visual Symptom Summary & Cause analysis.
  - Dual Treatment Tabs:
    * **Hữu cơ / Sinh học (Organic/Bio):** Biological agents (Trichoderma, Bacillus subtilis, neem oil, bio-fungicides), herbal sprays, VietGAP compliant.
    * **Hóa học an toàn (Chemical):** Active ingredients (Azoxystrobin, Mancozeb, Metalaxyl, etc.), dosage per 16L/25L sprayer, spraying interval, and Pre-Harvest Interval (Thời gian cách ly - PHI in days).
  - Prevention & Crop Care Roadmap for subsequent seasons.
  - "Save to Farm Journal" action button.

### 3.2 Voice-First Field Assistant (Bác Sĩ Cây Trồng Bằng Giọng Nói)
- Hands-free field interaction for farmers while working in fields with gloves or wet hands.
- One-click microphone button with visual voice waveform animation.
- Real-time speech transcription in Vietnamese (`vi-VN`).
- Audio response playback using natural speech synthesis.
- Quick topic chips: "Cách ủ phân hữu cơ", "Phòng trừ sâu đục thân", "Lịch bón phân lúa hè thu", "Trị rệp sáp sầu riêng".

### 3.3 Agricultural Weather & Pest Risk Radar (Dự Báo & Cảnh Báo Dịch Hại)
- Automatic or manual location detection across Vietnamese agricultural regions (ĐBSCL, Tây Nguyên, Miền Đông, Bắc Bộ).
- Real-time display of:
  * Temperature & Humidity (Độ ẩm không khí).
  * 3-Day Rainfall Forecast.
  * Computed Pest & Fungus Infection Risk Index (Chỉ số nguy cơ nấm & dịch hại).
- Actionable weather advice (e.g., "Độ ẩm > 85% liên tục trong 48h - Khuyến cáo không phun thuốc vào sáng sớm để tránh rửa trôi").

### 3.4 Farm Logbook & History (Nhật Ký Đồng Ruộng)
- Automatic storage of all scans and diagnoses with timestamp, crop name, disease, photo thumbnail, and treatment status.
- Filter by crop type and severity.
- Status toggle: "Đang theo dõi" (Monitoring) $\rightarrow$ "Đã xử lý" (Treated) $\rightarrow$ "Đã khỏi bệnh" (Recovered).
- One-click export to CSV / JSON for cooperative reporting.

---

## 4. Structured Output Schemas & Prompt Engineering

### 4.1 Gemini Multimodal Diagnosis Prompt
```text
System Role: Bạn là một Chuyên Gia Nông Nghiệp & Bác Sĩ Cây Trồng cao cấp tại Việt Nam với hơn 20 năm kinh nghiệm về bệnh lý thực vật nhiệt đới (Lúa nước, Sầu riêng, Cà phê, Thanh long, Cây ăn trái, Rau màu).

Nhiệm vụ: Phân tích hình ảnh lá/thân/trái của cây trồng được cung cấp, xác định chính xác bệnh hại, mức độ nghiêm trọng và cung cấp phác đồ điều trị chi tiết, thực tế, an toàn theo tiêu chuẩn nông nghiệp Việt Nam (VietGAP).

Định dạng trả về: Bắt buộc trả về duy nhất một chuỗi JSON hợp lệ theo schema sau:
{
  "cropName": "Tên cây trồng (vd: Lúa nước, Sầu riêng Ri6, Cà phê Robusta...)",
  "diseaseNameVi": "Tên tiếng Việt chuẩn của bệnh (vd: Bệnh đạo ôn lá, Bệnh nứt thân xì mủ...)",
  "diseaseNameScientific": "Tên khoa học của tác nhân gây bệnh (vd: Pyricularia oryzae, Phytophthora palmivora...)",
  "confidenceScore": 95,
  "severityLevel": "Nhẹ" | "Trung bình" | "Nghiêm trọng",
  "symptomsSummary": "Mô tả ngắn gọn các triệu chứng nhận diện được trên ảnh",
  "primaryCauses": "Nguyên nhân chính (nấm, vi khuẩn, virus, thiếu vi lượng, bọ trĩ...)",
  "organicTreatment": {
    "title": "Phác đồ Sinh học / Hữu cơ (Khuyên dùng)",
    "steps": ["Bước 1...", "Bước 2..."],
    "bioProducts": "Chế phẩm sinh học đề xuất (vd: Nấm đối kháng Trichoderma, dịch tỏi ớt...)"
  },
  "chemicalTreatment": {
    "title": "Phác đồ Hóa học (Trường hợp khẩn cấp)",
    "activeIngredients": "Hoạt chất khuyên dùng (vd: Isoprothiolane, Mancozeb, Hexaconazole...)",
    "dosageInstructions": "Liều lượng pha bình 16L hoặc 25L nước",
    "quarantineDays": 14,
    "safetyNotes": "Khuyến cáo bảo hộ lao động và bảo vệ nguồn nước"
  },
  "seasonalPrevention": [
    "Biện pháp phòng ngừa 1...",
    "Biện pháp phòng ngừa 2..."
  ]
}
```

---

## 5. Offline Fallback & Built-in Sample Database

To ensure the demo works seamlessly even without an active internet connection or in case of API rate limits, the app embeds a comprehensive offline diagnostic dataset for:
1. **Lúa Nước (Rice):** Bệnh Đạo ôn (Rice Blast - *Pyricularia oryzae*), Bệnh Cháy bìa lá (Bacterial Blight - *Xanthomonas oryzae*).
2. **Sầu Riêng (Durian):** Bệnh Xì mủ nứt thân (*Phytophthora palmivora*), Bệnh Thán thư lá (*Colletotrichum gloeosporioides*).
3. **Cà Phê (Coffee):** Bệnh Rỉ sắt (*Hemileia vastatrix*), Bệnh Khô cành khô quả (*Colletotrichum coffeanum*).
4. **Thanh Long (Dragon Fruit):** Bệnh Đốm nâu mắt cua (*Neoscytalidium dimidiatum*).

---

## 6. Testing & Quality Assurance Plan

1. **Unit & Logic Testing:**
   - Image base64 encoding and canvas resizing logic.
   - Gemini API request formatting and JSON payload parser.
   - Structured JSON validation and error boundary recovery.
   - LocalStorage CRUD operations for Farm Journal.
2. **End-to-End Browser Automation Testing:**
   - Complete scan journey with preset samples and custom uploads.
   - Mode switching (Camera, Voice, History, Weather Radar).
   - Theme toggle, mobile responsiveness, and modal dialogs.
3. **AI Studio Refined Prompt Packaging:**
   - Exact prompt file ready for copying into Google AI Studio (`ai.dev`) with complete technical instructions.

---

## 7. Deployment & Submission Artifacts

- **Primary Web App Bundle:** Single, standalone, production-ready `index.html` file embedding modular CSS & JS, ready for 1-click publishing on Google AI Studio.
- **AI Studio Refined Master Prompt:** `docs/ai-studio-prompt.md` containing the exact refined prompt to reproduce or modify the app inside AI Studio.
- **Complete Test Suite & Documentation:** `README.md` and automated test scripts.
