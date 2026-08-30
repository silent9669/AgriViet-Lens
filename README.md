# AgriViet Lens

## Bác sĩ cây trồng cho từng thửa ruộng Việt Nam

**AgriViet Lens** biến một bức ảnh trên đồng ruộng thành quyết định canh tác dễ hiểu: nhận diện dấu hiệu sâu bệnh, đối chiếu phác đồ VietGAP, tính đúng lượng thuốc theo dung tích bình, theo dõi vi khí hậu và lưu hồ sơ truy xuất. Một trải nghiệm field-first được thiết kế cho nông dân, kỹ sư nông nghiệp, hợp tác xã và ban giám khảo Google AI Riser Vietnam 2026.

[![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-ai.dev-4285F4?logo=google)](https://ai.dev)
[![Gemini 2.0 Flash](https://img.shields.io/badge/Gemini%202.0%20Flash-Multimodal%20Vision-34A853?logo=google-gemini)](https://ai.google.dev/gemini-api/docs)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech%20API-vi--VN-EA4335)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Hallmark Anti-AI-Slop](https://img.shields.io/badge/Hallmark-Anti--AI--Slop-24352B)](#hallmark-anti-ai-slop-design-system)
[![VietGAP Ready](https://img.shields.io/badge/Standard-VietGAP%20Ready-059669)](#an-toan-va-vietgap)
[![Operational Cost](https://img.shields.io/badge/Operational%20Cost-%240-10B981)](#chi%E1%BA%BFn-l%C6%B0%E1%BB%A3c-%C4%91i%E1%BB%83m-th%C6%B0%E1%BB%9Fng-google-ai-riser)

> **See the symptom. Decide with context. Spray the right dose. Keep the record.**

---

## Vì sao AgriViet Lens cần thiết

### Bài toán ngoài đồng

Sâu bệnh hại cây trồng tại Việt Nam — đặc biệt trên **lúa nước, sầu riêng, cà phê và thanh long** — gây thiệt hại **hàng nghìn tỷ đồng mỗi năm**. Hai sai lầm lặp đi lặp lại là:

- chẩn đoán sai giữa bệnh nấm, sâu hại, thiếu dinh dưỡng và tổn thương cơ giới;
- pha thuốc sai liều, sai dung tích bình hoặc bỏ qua thời gian cách ly PHI.

Hệ quả là chi phí tăng, năng suất giảm, tồn dư khó kiểm soát và quyết định xử lý đến quá muộn.

### Cách AgriViet Lens giải quyết

AgriViet Lens nối liền năm bước vốn thường bị tách rời:

1. **Nhìn đúng:** Gemini 2.0 Flash Multimodal Vision đọc ảnh lá, thân hoặc trái.
2. **Hiểu đúng:** kết quả có tên bệnh tiếng Việt, tên khoa học, độ tin cậy, mức độ và nguyên nhân.
3. **Làm đúng:** phác đồ Sinh học/VietGAP đi song song với lựa chọn Hóa học, liều pha và PHI.
4. **Đón trước:** radar Open-Meteo tính nguy cơ nấm theo nhiệt độ, ẩm độ và mưa.
5. **Ghi đủ:** nhật ký tại máy và CSV một chạm tạo nền tảng cho VietGAP, hợp tác xã và truy xuất.

---

## Năm năng lực tạo khác biệt

### 1. Bác sĩ Cây trồng Đa phương thức

**Gemini 2.0 Flash Multimodal Vision** phân tích ảnh chụp từ camera, tệp tải lên hoặc kéo-thả. Kết quả được chuẩn hóa để bà con có thể hành động ngay:

- cây trồng và bệnh bằng tiếng Việt;
- tên khoa học Latin;
- độ tin cậy theo phần trăm và mức độ: Nhẹ, Trung bình hoặc Nghiêm trọng;
- triệu chứng quan sát được và nguyên nhân có khả năng;
- phác đồ Sinh học/VietGAP và Hóa học Đặc trị;
- khuyến nghị phòng bệnh theo mùa.

#### Bốn mẫu thử nghiệm một chạm cho ban giám khảo

Không cần API key để bắt đầu demo. Chọn một mẫu, bấm phân tích và đi thẳng tới kết quả offline có cấu trúc.

| Cây trồng | Mẫu bệnh | Tên khoa học |
| --- | --- | --- |
| Lúa nước | Đạo ôn lá | *Pyricularia oryzae* |
| Sầu riêng | Xì mủ nứt thân | *Phytophthora palmivora* |
| Cà phê | Rỉ sắt lá | *Hemileia vastatrix* |
| Thanh long | Đốm nâu mắt cua | *Neoscytalidium dimidiatum* |

**Luồng demo đề xuất:** chọn mẫu → xem dấu hiệu → đối chiếu hai phác đồ → mở máy tính pha thuốc → lưu vào nhật ký.

### 2. Máy tính Pha thuốc Bình xịt Đa năng

Một hướng dẫn gốc cho bình 16L được scale theo hệ số đến đúng thiết bị đang có tại ruộng:

**16L · 20L · 25L · Phuy 200L · Drone 30L**

Máy tính hiển thị lượng thuốc sau quy đổi, dung tích mục tiêu và liều gốc để người dùng kiểm tra. Mọi con số hóa học vẫn phải đối chiếu với nhãn sản phẩm được đăng ký tại địa phương; ứng dụng không thay thế nhãn thuốc hay cán bộ kỹ thuật.

### 3. Trợ lý Ruộng đồng Đàm thoại Rảnh tay Tiếng Việt

Khi tay đang cầm kéo, bình xịt hoặc lá mẫu, người dùng vẫn có thể hỏi:

- **STT:** Web Speech API với `vi-VN` chuyển giọng nói thành câu hỏi;
- **tư vấn:** Gemini trả lời theo ngữ cảnh chẩn đoán gần nhất;
- **TTS:** SpeechSynthesis đọc lại bằng tiếng Việt;
- **offline fallback:** câu hỏi về bốn cây trồng mẫu vẫn có câu trả lời khi không có API key.

### 4. Radar Vi khí hậu và Cảnh báo Nấm bệnh

Dữ liệu **Open-Meteo** được dùng cho bốn vùng nông nghiệp trọng điểm: Đồng bằng sông Cửu Long, Tây Nguyên, Đông Nam Bộ và Đồng bằng sông Hồng. Radar theo dõi:

- nhiệt độ, ẩm độ, mưa và gió;
- dự báo ba ngày;
- **Fungal Risk Index** từ 0–100;
- cảnh báo Nguy cơ Thấp, Trung bình hoặc Cao;
- hành động thực tế như tỉa tán, thăm vườn, giảm đạm hoặc chủ động phòng sinh học.

### 5. Nhật ký Canh tác VietGAP và Xuất Báo cáo CSV một chạm

Mỗi lần chẩn đoán có thể trở thành một dòng dữ liệu canh tác:

- thời gian, cây trồng, bệnh, mức độ, độ tin cậy và vị trí;
- trạng thái `Đang theo dõi` → `Đã xử lý` → `Đã khỏi bệnh`;
- thời gian cách ly và ghi chú xử lý;
- lưu cục bộ bằng `localStorage`;
- xuất CSV để chia sẻ với hợp tác xã, kiểm tra nội bộ và chuẩn bị hồ sơ VietGAP.

---

## Hallmark Anti-AI-Slop Design System

AgriViet Lens không chọn giao diện dashboard mẫu. Nó dùng hệ thống **Field Almanac** trên cấu trúc **Workbench**: một bàn thao tác sáng, rõ và có thứ tự cho người đứng ngoài ruộng.

| Nguyên tắc | Triển khai trong sản phẩm |
| --- | --- |
| **Workbench layout** | Bố cục chia khu vực theo nhiệm vụ: chẩn đoán, phác đồ, radar, nhật ký; ưu tiên thông tin có thể hành động thay vì các thẻ trang trí. |
| **Field Almanac palette** | Nền giấy sáng, xanh rừng cho hành động chính, hổ phách cho cảnh báo, xanh lá cho trạng thái an toàn; có dark mode nhưng vẫn giữ tương phản. |
| **100% SVG line icons** | Icon nét mảnh nội tuyến, có `aria-hidden` khi mang tính trang trí, không phụ thuộc emoji hay icon font. |
| **Không emoji trong button/badge** | Nhãn điều khiển rõ nghĩa, ổn định trên Android, iOS và màn hình ngoài trời. |
| **Outdoor contrast** | Chữ và điều khiển cốt lõi được thiết kế với mục tiêu tương phản **≥ 7:1**, phù hợp ánh sáng mạnh. |
| **Tám trạng thái tactile** | Default, hover, focus-visible, active, disabled, loading, error và success đều có phản hồi nhìn thấy được. |

Các token giao diện nằm trong [`tokens.css`](tokens.css). Quy tắc thiết kế được kiểm tra cùng bộ test Hallmark tại [`tests/test_hallmark_tokens.js`](tests/test_hallmark_tokens.js).

---

## Chiến lược điểm thưởng Google AI Riser Vietnam 2026

AgriViet Lens map trực tiếp các yêu cầu bonus vào trải nghiệm có thể trình diễn:

| Hạng mục bonus | Bằng chứng trong sản phẩm | Điểm |
| --- | --- | :---: |
| **Google technology integration** | Gemini 2.0 Flash cho Vision và hỏi đáp; Google AI Studio/ai.dev cho luồng build; Web Speech API `vi-VN` cho STT/TTS; Open-Meteo cho dữ liệu vi khí hậu. | **+10** |
| **1-click publishing and deployment** | SPA tĩnh, không cần build step; prompt sẵn trong [`docs/ai-studio-prompt.md`](docs/ai-studio-prompt.md); có thể import vào AI Studio, Build và Publish từ một luồng ngắn. | **+10** |
| **Tổng bonus mục tiêu** | Tích hợp có thể kiểm chứng, chi phí vận hành demo bằng không. | **+20** |

---

## Quick Start

### Chạy cục bộ trong một lệnh

Yêu cầu: Node.js và một trình duyệt hiện đại.

```bash
npx serve -l 3000 .
```

Mở [http://localhost:3000](http://localhost:3000). Không cần `npm install`, bundler hoặc biến môi trường để xem ứng dụng và bốn mẫu offline.

Để phân tích ảnh thật bằng Gemini, mở hộp API key trong ứng dụng và nhập key được tạo từ [Google AI Studio](https://ai.google.dev/). Khi thiếu key hoặc mất mạng, ứng dụng dùng fallback offline có cấu trúc thay vì để màn hình trống.

### 1-click import trên ai.dev

1. Mở [ai.dev](https://ai.dev) và đăng nhập tài khoản Google.
2. Chọn **Build → New app**.
3. Sao chép toàn bộ prompt trong [`docs/ai-studio-prompt.md`](docs/ai-studio-prompt.md), bắt đầu từ khối **MASTER SYSTEM PROMPT**.
4. Dán vào AI Studio và chọn **Build**.
5. Kiểm tra bốn mẫu một chạm, máy tính bình xịt và trợ lý giọng nói.
6. Chọn **Publish** để tạo liên kết demo, sau đó dùng liên kết đó trong hồ sơ Google AI Riser.

### Lộ trình trình diễn cho giám khảo

| Thời điểm | Thao tác | Điều cần thấy |
| --- | --- | --- |
| 1 | Chọn mẫu Lúa nước hoặc Sầu riêng | Chẩn đoán đa phương thức có cấu trúc, không cần chờ nhập ảnh thật. |
| 2 | Chuyển qua Sinh học và Hóa học | Một quyết định có hai hướng xử lý, kèm PHI và lưu ý an toàn. |
| 3 | Chọn 20L, 25L, 200L hoặc Drone 30L | Liều lượng được scale từ hướng dẫn gốc theo dung tích. |
| 4 | Hỏi trợ lý bằng tiếng Việt | STT `vi-VN`, câu trả lời theo ngữ cảnh và TTS rảnh tay. |
| 5 | Mở radar và lưu nhật ký | Fungal Risk Index, dự báo ba ngày và CSV VietGAP. |

---

## Cấu trúc mã nguồn

```text
.
├── index.html
├── tokens.css
├── package.json
├── src/
│   ├── app.js
│   ├── data/
│   │   └── sample-presets.js       # 4 mẫu bệnh offline và minh họa SVG
│   ├── services/
│   │   ├── gemini-service.js       # Vision, Q&A, parse schema và fallback
│   │   ├── weather-radar.js        # Open-Meteo và Fungal Risk Index
│   │   └── logbook-service.js      # localStorage, trạng thái và CSV
│   └── utils/
│       ├── dosage-calculator.js    # Quy đổi 16L, 20L, 25L, 200L, Drone 30L
│       ├── icons.js                # SVG line icons
│       └── image-processor.js
├── tests/
│   ├── test_hallmark_tokens.js
│   ├── test_gemini_service.js
│   ├── test_services.js
│   ├── test_utils.js
│   └── e2e_test.js
└── docs/
    └── ai-studio-prompt.md         # Prompt import cho Google AI Studio
```

### Kiểm thử

```bash
npm test
npm run test:e2e
```

`npm test` chạy các kiểm thử schema Gemini, fallback offline, radar, nhật ký, máy tính liều và token giao diện. `npm run test:e2e` kiểm tra luồng tương tác chính trong trình duyệt.

---

## An toàn và VietGAP

AgriViet Lens là công cụ hỗ trợ quyết định, không phải giấy phép sử dụng thuốc. Người dùng cần:

- xác nhận chẩn đoán tại ruộng khi hình ảnh không đủ rõ;
- chỉ dùng sản phẩm và hoạt chất được đăng ký cho cây trồng, sinh vật gây hại tương ứng;
- đọc nhãn, dùng bảo hộ lao động và tuân thủ PHI tại địa phương;
- không pha chung thuốc tùy tiện, không xả dung dịch thừa xuống nguồn nước;
- lưu lại thao tác và thời gian cách ly trong nhật ký.

Phác đồ sinh học luôn được trình bày như lựa chọn ưu tiên an toàn; phác đồ hóa học chỉ là thông tin định hướng cần đối chiếu với nhãn chính thức và cán bộ kỹ thuật.

---

## Giấy phép

Được xây dựng cho **Google AI Riser Vietnam 2026** bởi **AI Riser Builder Team**.

Phát hành theo [MIT License](LICENSE) khi tệp giấy phép được cung cấp trong bản phân phối.
