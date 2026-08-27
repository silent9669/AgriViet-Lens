# Refined Master Prompt for Google AI Studio (ai.dev / ai.studio)

Use the prompt below directly in **Google AI Studio** (`https://ai.dev` or `https://ai.studio`) in the **Build > + New app** section to vibe-code or deploy **AgriViet Lens**:

```text
System Role:
You are an expert full-stack engineer, plant pathologist, and UI/UX designer specialized in tropical agriculture and modern web applications. You create responsive, beautiful, intuitive Single-Page Applications (SPA) with zero external build step requirements.

Task:
Build "AgriViet Lens" (Trợ Lý Nông Nghiệp & Chẩn Đoán Sâu Bệnh Đa Phương Thức) — an AI-powered agricultural diagnosis and field advisory web application built for Vietnamese farmers, agronomists, and cooperatives participating in Google AI Riser Vietnam 2026.

Tech Stack:
To make this easy to run and deploy instantly via Google AI Studio with $0 cost, please build this as a Single-Page Application (SPA) using:
* HTML5 (semantic layout, camera access via MediaDevices / input file)
* Vanilla JavaScript (ES6+ modular logic, async/await)
* Tailwind CSS (imported via CDN: https://cdn.tailwindcss.com)
* Google Fonts (Be Vietnam Pro & Inter for native Vietnamese typography)
* Google Gemini 2.0 / 1.5 Flash API for Multimodal Vision Pathology & Agricultural Q&A
* Web Speech API (SpeechRecognition & SpeechSynthesis in 'vi-VN') for hands-free voice field consultation
* Open-Meteo API for real-time agricultural weather and fungal risk scoring
* LocalStorage for farm journal persistence and CSV export

Core Features & Functionality:
1. Multimodal Crop Pathology Doctor (Chẩn Đoán Bệnh Cây Trồng):
   - Supports camera capture, file upload, and drag-and-drop.
   - Includes 4 Instant Preset Demo Samples for judges (🌾 Đạo Ôn Lá Lúa, 🌳 Xì Mủ Sầu Riêng, ☕ Rỉ Sắt Cà Phê, 🌵 Đốm Nâu Thanh Long) with 1-click evaluation.
   - Returns structured diagnosis: Crop Name, Disease Name (Vietnamese & Latin scientific name), Confidence Score (%), Severity Level (Nhẹ/Trung bình/Nghiêm trọng), and Visual Symptoms.
   - Dual-Tab Treatment Roadmap:
     * Tab 1: Sinh Học / VietGAP (Organic steps, biological agents like Trichoderma & Bacillus subtilis, herbal remedies).
     * Tab 2: Hóa Học Đặc Trị (Chemical active ingredients, precise dosage for 16L/25L spray tanks, and Pre-Harvest Interval / Thời gian cách ly PHI in days).
   - Seasonal prevention recommendations for subsequent crop cycles.

2. Vietnamese Voice Field Assistant (Bác Sĩ Cây Trồng Bằng Giọng Nói):
   - Real-time speech-to-text transcription in Vietnamese.
   - Context-aware agricultural Q&A powered by Gemini.
   - Automated text-to-speech voice playback in Vietnamese for hands-free operation in the field.
   - Quick suggested question chips for instant consultation.

3. Agricultural Weather & Outbreak Risk Radar (Dự Báo & Cảnh Báo Dịch Hại):
   - Multi-region weather monitoring (ĐBSCL, Tây Nguyên, Đông Nam Bộ, ĐBSH).
   - Real-time humidity, temperature, and precipitation tracking.
   - AI-computed Fungal Infection Risk Index (Chỉ số nguy cơ nấm & dịch hại).
   - 3-day microclimate forecast and actionable spraying tips.

4. Farm Logbook & History (Nhật Ký Đồng Ruộng):
   - Automatically records diagnoses with timestamps, crop, disease, severity, and status.
   - Treatment status tracking ('Đang theo dõi' / 'Đã xử lý' / 'Đã khỏi bệnh').
   - One-click export to CSV for VietGAP compliance and cooperative reporting.

5. High-Fidelity Offline Fallback Database:
   - Includes full offline diagnostic data for major Vietnamese export crops so the application runs seamlessly even without an API key or when offline.
   - API Key modal to enter a custom Gemini API key from ai.google.dev.

The "Vibe" (Design & UX):
* Aesthetic: Deep agricultural dark mode (slate-950 ground, emerald-500 accents, harvest gold highlights).
* Interactivity: Instant feedback toasts, animated voice waveforms, smooth tab transitions, and responsive mobile-first grid.
* Language: Authentic, localized Vietnamese agricultural terminology (bà con, VietGAP, thời gian cách ly PHI, hoạt chất, nấm đối kháng).

Output Constraints:
* Deliver complete, production-ready, clean, well-commented code without any placeholder comments like "// add logic here".
* Ensure the application runs standalone with zero build tools or configuration.
```
