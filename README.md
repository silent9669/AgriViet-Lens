# 🌾 AgriViet Lens — Trợ Lý Nông Nghiệp & Chẩn Đoán Sâu Bệnh Đa Phương Thức
### *Dự Án Tham Dự Cuộc Thi Google AI Riser Vietnam 2026*

[![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-ai.dev-4285F4?logo=google)](https://ai.dev)
[![Gemini 2.0 Flash](https://img.shields.io/badge/Gemini%202.0%20Flash-Multimodal%20Vision-34A853?logo=google-gemini)](https://ai.google.dev)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech-Vietnamese%20vi--VN-EA4335)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![VietGAP Ready](https://img.shields.io/badge/Standard-VietGAP%20Agricultural-059669)](#)
[![Cost](https://img.shields.io/badge/Cost-$0%20Operational%20Cost-10B981)](#)

---

## 🌟 Giới Thiệu Dự Án (Project Overview)

**AgriViet Lens** là ứng dụng trợ lý nông nghiệp thông minh đa phương thức (Multimodal AI) được phát triển dành riêng cho nông dân, hợp tác xã và kỹ sư nông nghiệp tại Việt Nam.

Ứng dụng giải quyết triệt để bài toán nhận diện bệnh hại trên các nông sản xuất khẩu chủ lực (**Lúa gạo, Sầu riêng, Cà phê, Thanh long, Rau màu**), cung cấp phác đồ điều trị kép (**Sinh học / VietGAP** song hành cùng **Hóa học đặc trị** có thời gian cách ly an toàn PHI), tích hợp **Trợ lý đàm thoại tiếng Việt rảnh tay** và **Radar cảnh báo bùng phát nấm bệnh dựa trên vi khí hậu thời gian thực**.

---

## 🏆 Chiến Lược Điểm Thưởng Google AI Riser (+20 Điểm Bonus)

| Tiêu Chí Đánh Giá | Triển Khai Thực Tế Trong AgriViet Lens | Điểm Thưởng |
| :--- | :--- | :---: |
| **Google Tech Integration** | Tích hợp **Google Gemini 2.0/1.5 Flash** (Vision chẩn đoán bệnh + Chatbot nông nghiệp) + **Web Speech API tiếng Việt** (STT & TTS đàm thoại rảnh tay) + **Open-Meteo Weather API** + **Google AI Studio SDK/REST**. | **+10 Điểm** |
| **1-Click Publishing & Deployment** | Ứng dụng Single Page Application (SPA) triển khai miễn phí 1-chạm lên `*.ai.studio` hoặc Cloud Run mà không cần thẻ tín dụng qua Starter Tier. | **+10 Điểm** |
| **Chi Phí Vận Hành** | **$0 USD**: Tận dụng Free Tier của Google AI Studio (giới hạn RPM/TPM thoải mái cho demo & sử dụng thực tế) và bộ cơ sở dữ liệu chuyên gia tích hợp sẵn. | **Tối Ưu** |

---

## 🚀 Các Tính Năng Đột Phá (Core Features)

### 1. 🔬 Bác Sĩ Cây Trồng Đa Phương Thức (Multimodal Crop Pathology Scanner)
- Chụp ảnh trực tiếp từ camera hoặc tải ảnh lá/thân/trái bị bệnh.
- **⚡ Mẫu Thử Nghiệm Nhanh Cho Ban Giám Khảo (1-Click Presets):** Tích hợp sẵn 4 bộ mẫu bệnh thực tế (*Đạo ôn lá lúa, Xì mủ nứt thân sầu riêng, Rỉ sắt cà phê, Đốm nâu mắt cua thanh long*) để ban giám khảo trải nghiệm chẩn đoán ngay lập tức.
- Phân tích chính xác tên bệnh (Tiếng Việt & Tên khoa học Latin), tỷ lệ tin cậy AI (%), mức độ nghiêm trọng và nguyên nhân.
- **Phác đồ điều trị kép:**
  - *Nhánh Sinh học / VietGAP:* Phun chế phẩm vi sinh đối kháng (*Trichoderma, Bacillus subtilis*), cải tạo đất hữu cơ.
  - *Nhánh Hóa học:* Hoạt chất đặc trị, liều lượng pha bình 16L/25L, hướng dẫn an toàn và **Thời Gian Cách Ly (PHI)** rõ ràng.

### 2. 🎙️ Trợ Lý Đàm Thoại Rảnh Tay Tiếng Việt (Voice Field Assistant)
- Hỗ trợ nông dân hỏi đáp khi đang lao động trực tiếp trên đồng ruộng.
- Nhận diện giọng nói tiếng Việt (`vi-VN`) và tự động đọc câu trả lời bằng giọng nói chuẩn bản xứ.

### 3. ⛅ Radar Dự Báo & Cảnh Báo Nguy Cơ Dịch Hại (Weather & Pest Outbreak Radar)
- Theo dõi nhiệt độ, độ ẩm không khí và lượng mưa theo 4 vùng nông nghiệp trọng điểm (ĐBSCL, Tây Nguyên, Đông Nam Bộ, ĐBSH).
- Tự động tính toán **Chỉ Số Nguy Cơ Bùng Phát Nấm Bệnh (Fungal Risk Index)** và đưa ra khuyến cáo phòng ngừa kịp thời trước mưa bão.

### 4. 📜 Nhật Ký Đồng Ruộng & Báo Cáo (Farm Logbook & CSV Export)
- Tự động lưu trữ lịch sử chẩn đoán vào `localStorage`.
- Quản lý trạng thái điều trị (*Đang theo dõi $\rightarrow$ Đã xử lý $\rightarrow$ Đã khỏi bệnh*).
- 1-chạm xuất file báo cáo **CSV** phục vụ giám sát nội bộ hợp tác xã và truy xuất nguồn gốc VietGAP.

---

## 📁 Cấu Trúc Mã Nguồn (Project Structure)

```
.
├── index.html                      # Giao diện chính Single Page Application (Tailwind CSS + UI)
├── package.json                    # Cấu hình dự án & scripts kiểm thử
├── src/
│   ├── app.js                      # Controller điều phối giao diện, sự kiện và tương tác giọng nói
│   ├── data/
│   │   └── offline-diseases.js     # Bộ dữ liệu bệnh lý thực vật chuyên gia & 4 mẫu preset thử nghiệm
│   └── services/
│       ├── gemini-service.js       # Kết nối Google Gemini 2.0 Flash API (Vision & Chat)
│       ├── weather-radar.js        # Dịch vụ vi khí hậu & tính toán nguy cơ nấm bệnh
│       └── logbook-service.js      # Dịch vụ quản lý nhật ký đồng ruộng & xuất CSV
├── tests/
│   ├── test_offline_db.js          # Kiểm thử bộ dữ liệu bệnh lý học
│   ├── test_gemini_service.js      # Kiểm thử schema & payload Gemini API
│   ├── test_services.js            # Kiểm thử dịch vụ thời tiết & nhật ký
│   └── e2e_test.js                 # Kiểm thử tích hợp toàn diện (E2E)
└── docs/
    ├── ai-studio-prompt.md         # Master Prompt hoàn chỉnh để dán vào Google AI Studio (ai.dev)
    └── superpowers/
        ├── specs/                  # Tài liệu đặc tả kỹ thuật (Design Spec)
        └── plans/                  # Kế hoạch thực thi chi tiết (Implementation Plan)
```

---

## 🛠️ Hướng Dẫn Chạy Cục Bộ & Kiểm Thử (Local Run & Testing)

### 1. Khởi chạy máy chủ cục bộ:
```bash
# Sử dụng bất kỳ static server nào (Node, Python, npx)
npx serve -l 3000 .
# Hoặc: python3 -m http.server 3000
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 2. Chạy toàn bộ bộ kiểm thử tự động (Unit & Integration Tests):
```bash
npm test
npm run test:e2e
```
*Tất cả 100% test case đã được tự động hóa và xác thực xanh.*

---

## 🚀 Hướng Dẫn Nộp Bài & Triển Khai Lên Google AI Studio (Submission Guide)

Theo đúng hướng dẫn từ **AI Riser Participant Handbook**:

1. **Bước 1:** Truy cập [Google AI Studio](https://ai.dev/) và đăng nhập tài khoản Google.
2. **Bước 2:** Vào mục **Build > + New app**.
3. **Bước 3:** Sao chép nội dung từ file [`docs/ai-studio-prompt.md`](docs/ai-studio-prompt.md) và dán vào ô nhập prompt.
4. **Bước 4:** Bấm **Build** để AI Studio dựng và kết nối.
5. **Bước 5 (Nhận +10 điểm Bonus):** Bấm **Publish** ở góc phải trên cùng $\rightarrow$ Chọn tên miền (vd: `agriviet-lens.ai.studio`) $\rightarrow$ Bấm **Publish**.
6. **Bước 6:** Lấy liên kết dự án công khai (Share > Public Link) và liên kết ứng dụng đã triển khai (`*.ai.studio`) để điền vào biểu mẫu hoàn thành cuộc thi tại `goo.gle/airiservietnam-completion`.

---

## 🌿 Bản Quyền & Tác Giả
Dự án được xây dựng và tối ưu bởi **AI Riser Builder Team** cho cuộc thi **AI Riser Vietnam 2026**.
Giấy phép: **MIT License**.
