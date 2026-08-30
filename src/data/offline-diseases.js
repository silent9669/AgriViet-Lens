/**
 * AgriViet Lens - Comprehensive Plant Pathology Knowledge Base
 * Aligned with VietGAP and Plant Protection Department (Cục Bảo vệ Thực vật Việt Nam) standards.
 */

function encodeSvgToBase64(svg) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(svg).toString('base64');
  }
  if (typeof btoa !== 'undefined') {
    return btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  }
  return '';
}

// Generate realistic SVG leaf pathology illustrations for preset testing
function createRiceBlastSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#061a12"/>
        <stop offset="100%" stop-color="#0f2e21"/>
      </linearGradient>
      <linearGradient id="riceLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <radialGradient id="blastSpot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="40%" stop-color="#cbd5e1"/>
        <stop offset="70%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#451a03"/>
      </radialGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg)"/>
    <!-- Rice blade -->
    <path d="M 60,340 C 140,240 220,120 420,40 C 340,140 240,260 120,340 Z" fill="url(#riceLeaf)" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.5))"/>
    <!-- Leaf midrib vein -->
    <path d="M 90,340 C 180,200 280,100 420,40" stroke="#166534" stroke-width="3" fill="none" opacity="0.6"/>
    <!-- Spindle shaped blast lesions -->
    <path d="M 230,150 C 250,135 270,145 285,160 C 270,175 250,170 230,150 Z" fill="url(#blastSpot)" stroke="#7f1d1d" stroke-width="1.5"/>
    <path d="M 170,210 C 185,195 205,200 220,218 C 205,230 185,225 170,210 Z" fill="url(#blastSpot)" stroke="#7f1d1d" stroke-width="1.5"/>
    <path d="M 310,95 C 322,85 338,90 348,102 C 338,112 322,108 310,95 Z" fill="url(#blastSpot)" stroke="#7f1d1d" stroke-width="1.5"/>
    <!-- Diagnostic HUD Grid Overlay -->
    <circle cx="258" cy="155" r="28" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="258" y="120" font-family="'JetBrains Mono', monospace" font-size="11" fill="#f87171" text-anchor="middle" font-weight="bold">[VẾT ĐẠO ÔN: 96%]</text>
    <!-- Label -->
    <rect x="20" y="310" width="220" height="32" rx="8" fill="#000000" fill-opacity="0.6"/>
    <text x="32" y="331" font-family="system-ui, sans-serif" font-size="13" fill="#86efac" font-weight="bold">🌾 Lúa Nước • Bệnh Đạo Ôn</text>
  </svg>`;
  return `data:image/svg+xml;base64,${encodeSvgToBase64(svg)}`;
}

function createDurianPhytophthoraSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="bgD" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#17120a"/>
        <stop offset="100%" stop-color="#2a1f11"/>
      </linearGradient>
      <linearGradient id="bark" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#78350f"/>
        <stop offset="30%" stop-color="#92400e"/>
        <stop offset="70%" stop-color="#78350f"/>
        <stop offset="100%" stop-color="#451a03"/>
      </linearGradient>
      <linearGradient id="resin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#7f1d1d"/>
        <stop offset="60%" stop-color="#450a0a"/>
        <stop offset="100%" stop-color="#180404"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bgD)"/>
    <!-- Tree Trunk -->
    <path d="M 120,0 L 100,360 L 380,360 L 360,0 Z" fill="url(#bark)"/>
    <!-- Bark Texture Ridges -->
    <path d="M 160,0 C 170,120 150,240 160,360" stroke="#451a03" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M 320,0 C 310,120 330,240 320,360" stroke="#451a03" stroke-width="4" fill="none" opacity="0.7"/>
    <path d="M 240,0 C 235,100 245,260 240,360" stroke="#451a03" stroke-width="3" fill="none" opacity="0.5"/>
    <!-- Phytophthora Canker Lesion & Weeping Gum -->
    <path d="M 210,100 C 260,95 280,140 265,190 C 255,230 245,290 235,310 C 230,290 215,220 205,170 C 195,125 200,100 210,100 Z" fill="url(#resin)"/>
    <!-- Resin Droplet highlights -->
    <ellipse cx="236" cy="180" rx="14" ry="24" fill="#991b1b" opacity="0.8"/>
    <ellipse cx="235" cy="270" rx="8" ry="18" fill="#b91c1c" opacity="0.9"/>
    <!-- Target Crosshair HUD -->
    <circle cx="238" cy="175" r="38" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,5"/>
    <text x="238" y="125" font-family="'JetBrains Mono', monospace" font-size="11" fill="#fbbf24" text-anchor="middle" font-weight="bold">[XÌ MỦ THÂN: 94%]</text>
    <!-- Label -->
    <rect x="20" y="310" width="240" height="32" rx="8" fill="#000000" fill-opacity="0.6"/>
    <text x="32" y="331" font-family="system-ui, sans-serif" font-size="13" fill="#fde047" font-weight="bold">🌳 Sầu Riêng • Nứt Thân Xì Mủ</text>
  </svg>`;
  return `data:image/svg+xml;base64,${encodeSvgToBase64(svg)}`;
}

function createCoffeeRustSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="bgC" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a141a"/>
        <stop offset="100%" stop-color="#13271f"/>
      </linearGradient>
      <linearGradient id="coffeeLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d6a4f"/>
        <stop offset="60%" stop-color="#1b4332"/>
        <stop offset="100%" stop-color="#081c15"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bgC)"/>
    <!-- Oval wavy coffee leaf -->
    <path d="M 60,180 C 100,60 380,50 430,180 C 380,310 100,300 60,180 Z" fill="url(#coffeeLeaf)" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.6))"/>
    <!-- Veins -->
    <path d="M 60,180 L 430,180" stroke="#40916c" stroke-width="4" fill="none"/>
    <path d="M 150,180 C 180,140 210,110 240,90" stroke="#40916c" stroke-width="2" fill="none"/>
    <path d="M 230,180 C 260,140 290,110 320,95" stroke="#40916c" stroke-width="2" fill="none"/>
    <path d="M 150,180 C 180,220 210,250 240,270" stroke="#40916c" stroke-width="2" fill="none"/>
    <path d="M 230,180 C 260,220 290,250 320,265" stroke="#40916c" stroke-width="2" fill="none"/>
    <!-- Orange Powdery Rust Pustules -->
    <circle cx="210" cy="140" r="16" fill="#ea580c" opacity="0.9"/>
    <circle cx="210" cy="140" r="9" fill="#fbbf24"/>
    <circle cx="290" cy="135" r="14" fill="#ea580c" opacity="0.9"/>
    <circle cx="290" cy="135" r="7" fill="#fbbf24"/>
    <circle cx="180" cy="225" r="15" fill="#ea580c" opacity="0.9"/>
    <circle cx="180" cy="225" r="8" fill="#fbbf24"/>
    <circle cx="275" cy="220" r="18" fill="#ea580c" opacity="0.9"/>
    <circle cx="275" cy="220" r="10" fill="#fbbf24"/>
    <!-- Target HUD -->
    <circle cx="275" cy="220" r="26" fill="none" stroke="#f97316" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="275" y="185" font-family="'JetBrains Mono', monospace" font-size="11" fill="#fb923c" text-anchor="middle" font-weight="bold">[RỈ SẮT LÁ: 92%]</text>
    <!-- Label -->
    <rect x="20" y="310" width="220" height="32" rx="8" fill="#000000" fill-opacity="0.6"/>
    <text x="32" y="331" font-family="system-ui, sans-serif" font-size="13" fill="#fdba74" font-weight="bold">☕ Cà Phê • Bệnh Rỉ Sắt Lá</text>
  </svg>`;
  return `data:image/svg+xml;base64,${encodeSvgToBase64(svg)}`;
}

function createDragonfruitSvg() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="bgDf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#140f1a"/>
        <stop offset="100%" stop-color="#21182c"/>
      </linearGradient>
      <linearGradient id="dfStem" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="50%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#047857"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bgDf)"/>
    <!-- Triangular stem branch -->
    <path d="M 160,0 C 180,120 150,240 180,360 L 300,360 C 330,240 300,120 320,0 Z" fill="url(#dfStem)" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.5))"/>
    <!-- Stem Spine Ridges & Thorns -->
    <circle cx="165" cy="90" r="4" fill="#f43f5e"/>
    <circle cx="160" cy="180" r="4" fill="#f43f5e"/>
    <circle cx="170" cy="270" r="4" fill="#f43f5e"/>
    <circle cx="315" cy="110" r="4" fill="#f43f5e"/>
    <circle cx="310" cy="200" r="4" fill="#f43f5e"/>
    <circle cx="305" cy="290" r="4" fill="#f43f5e"/>
    <!-- Cat's Eye Brown Spot Lesions -->
    <ellipse cx="230" cy="120" rx="20" ry="16" fill="#fef08a" stroke="#78350f" stroke-width="2"/>
    <circle cx="230" cy="120" r="7" fill="#451a03"/>
    <ellipse cx="250" cy="210" rx="24" ry="18" fill="#fef08a" stroke="#78350f" stroke-width="2"/>
    <circle cx="250" cy="210" r="9" fill="#451a03"/>
    <ellipse cx="215" cy="290" rx="16" ry="14" fill="#fef08a" stroke="#78350f" stroke-width="2"/>
    <circle cx="215" cy="290" r="5" fill="#451a03"/>
    <!-- Target Crosshair HUD -->
    <circle cx="250" cy="210" r="32" fill="none" stroke="#e11d48" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="250" y="165" font-family="'JetBrains Mono', monospace" font-size="11" fill="#fb7185" text-anchor="middle" font-weight="bold">[ĐỐM MẮT CUA: 95%]</text>
    <!-- Label -->
    <rect x="20" y="310" width="240" height="32" rx="8" fill="#000000" fill-opacity="0.6"/>
    <text x="32" y="331" font-family="system-ui, sans-serif" font-size="13" fill="#f472b6" font-weight="bold">🌵 Thanh Long • Đốm Nâu Mắt Cua</text>
  </svg>`;
  return `data:image/svg+xml;base64,${encodeSvgToBase64(svg)}`;
}

export const OFFLINE_DISEASES = {
  rice: {
    cropName: "Lúa Nước",
    cropKey: "rice",
    diseaseNameVi: "Bệnh Đạo Ôn Lá (Cháy lá lúa)",
    diseaseNameScientific: "Pyricularia oryzae (Magnaporthe oryzae)",
    confidenceScore: 96,
    severityLevel: "Nghiêm trọng",
    symptomsSummary: "Vết bệnh ban đầu là những chấm nhỏ màu xám xanh hoặc nâu nhạt, sau đó phát triển thành hình thoi đặc trưng với tâm màu xám trắng và viền nâu sẫm. Nhiều vết liên kết làm cháy khô cả phiến lá.",
    primaryCauses: "Do nấm Pyricularia oryzae phát triển bùng phát khi độ ẩm không khí >85%, sương mù ban mai kéo dài, nhiệt độ 20-28°C và ruộng bón dư thừa phân đạm đòng.",
    organicTreatment: {
      title: "Phác đồ Sinh học & Canh tác VietGAP (Khuyên Dùng)",
      steps: [
        "Lập tức cắt nước phân đạm, ngưng phun toàn bộ phân bón lá chứa N và chất kích thích sinh trưởng.",
        "Giữ mực nước nông 3-5 cm trong ruộng để chống khô hạn và giữ độ ẩm cân bằng.",
        "Phun chế phẩm sinh học vi khuẩn đối kháng Bacillus subtilis hoặc nấm Trichoderma harzianum liều 2-3g/lít nước.",
        "Bổ sung Kali Sunfat (K2SO4) và Silic hòa tan giúp vách tế bào biểu bì lá cứng chắc, chống nấm xuyên qua."
      ],
      bioProducts: "Nấm đối kháng Trichoderma spp., Chế phẩm Bacillus subtilis, Dịch chiết Chitosan nông nghiệp."
    },
    chemicalTreatment: {
      title: "Phác đồ Hóa học Đặc trị (Trường Hợp Cấp Bách)",
      activeIngredients: "Tricyclazole (75% WP), Isoprothiolane (40% EC), Fenoxanil (20% SC)",
      dosagePerLiter: "0.8 - 1.0 g/L",
      dosageInstructions: "Pha 20-25g thuốc bột cho bình 25L nước (hoặc 160-200g cho phuy 200L). Phun ướt đều 2 mặt lá lúc sáng sớm ráo sương.",
      quarantineDays: 14,
      safetyNotes: "Tuyệt đối cách ly 14 ngày trước thu hoạch. Mang đầy đủ khẩu trang, ủng, kính bảo hộ. Không súc rửa bình thuốc xuống nguồn nước sinh hoạt."
    },
    seasonalPrevention: [
      "Sử dụng giống lúa xác nhận kháng đạo ôn (Đài Thơm 8, OM5451, ST25, Lộc Trời...).",
      "Gieo sạ mật độ hợp lý (80-100 kg/ha), áp dụng kỹ thuật '1 phải 5 giảm' và '3 giảm 3 tăng'.",
      "Bón phân cân đối N-P-K theo bảng so màu lá lúa LCC, tăng cường bón lót lân và phân hữu cơ.",
      "Vệ sinh đồng ruộng, dọn sạch cỏ bờ và cày vùi rơm rạ với nấm vi sinh phân hủy Trichoderma."
    ]
  },

  durian: {
    cropName: "Sầu Riêng (Ri6 / Monthong)",
    cropKey: "durian",
    diseaseNameVi: "Bệnh Xì Mủ & Nứt Thân (Thối rễ)",
    diseaseNameScientific: "Phytophthora palmivora",
    confidenceScore: 94,
    severityLevel: "Nghiêm trọng",
    symptomsSummary: "Vỏ thân có vết ủng nước sẫm màu, nứt toác và rỉ nhựa màu nâu đỏ dính nhớt. Cạo nhẹ lớp vỏ thấy tầng sinh mô gỗ bị thối đen. Cây bị vàng lá một nhánh hoặc cả cây, rụng trái non hàng loạt.",
    primaryCauses: "Nấm thủy sinh Phytophthora palmivora lây lan qua đất ngập úng vào mùa mưa, pH đất chua (< 5.0), rễ tơ bị nghẹt rễ hoặc tuyến trùng chích hút tạo vết thương hở.",
    organicTreatment: {
      title: "Phác đồ Sinh học & Cải tạo Vi sinh Đất",
      steps: [
        "Dùng dao bén đã sát khuẩn bằng cồn 90° cạo sạch toàn bộ mô vỏ thối đến phần gỗ lành, thu gom đem đốt tiêu hủy.",
        "Quét dung dịch Nano Đồng - Bạc sinh học hoặc dịch trích tinh dầu quế nguyên chất phủ kín vết cạo.",
        "Tưới phục hồi vùng rễ bằng tổ hợp Trichoderma viride + Bacillus spp. định kỳ 15-20 ngày/lần.",
        "Rải vôi bột (CaCO3) hoặc tinh vôi Dolomite liều 2-3kg/gốc quanh tán để nâng pH đất lên 6.0 - 6.5."
      ],
      bioProducts: "Nano Bạc Đồng sinh học, Men vi sinh Trichoderma viride, Phân hữu cơ hoai mục ủ nấm."
    },
    chemicalTreatment: {
      title: "Phác đồ Hóa học Cấp bách (Quét Thân & Tưới Gốc)",
      activeIngredients: "Metalaxyl-M (4% WP), Fosetyl-aluminium (80% WP), Dimethomorph (50% WDG)",
      dosagePerLiter: "2.5 g/L (Quét đặc: 50g/L)",
      dosageInstructions: "Quét thân: Pha đặc 50g thuốc trong 1 lít nước, quét đều lên vết thương 2 lần cách nhau 5 ngày. Tưới gốc: Pha 500g trong 200L nước, tưới 15-20L/gốc.",
      quarantineDays: 21,
      safetyNotes: "Không pha chung Fosetyl-Al với phân bón lá có đạm hoặc thuốc gốc đồng. Tuân thủ nghiêm ngặt thời gian cách ly 21 ngày trước thu hoạch."
    },
    seasonalPrevention: [
      "Xẻ mương sâu thoát nước trong vườn, tuyệt đối không để đọng vũng quanh gốc trong mùa mưa.",
      "Tỉa thông thoáng cành la, cành sát mặt đất dưới 0.8m để giảm độ ẩm tiểu khí hậu.",
      "Quét vôi tôi pha sunfat đồng (Booc-đô) quanh gốc cao 1m trước mùa mưa bão.",
      "Bón phân hữu cơ sinh học định kỳ, duy trì thảm cỏ giữ ẩm có kiểm soát."
    ]
  },

  coffee: {
    cropName: "Cà Phê Robusta",
    cropKey: "coffee",
    diseaseNameVi: "Bệnh Rỉ Sắt Cà Phê",
    diseaseNameScientific: "Hemileia vastatrix",
    confidenceScore: 92,
    severityLevel: "Trung bình",
    symptomsSummary: "Mặt dưới của phiến lá xuất hiện những đốm tròn màu vàng cam phủ đầy bụi phấn bào tử nấm. Mặt trên lá tương ứng có vệt ố vàng nhạt. Lá rụng sớm làm cành trơ trụi, quả non khô teo.",
    primaryCauses: "Bào tử nấm Hemileia vastatrix phát tán theo gió và giọt mưa, nảy mầm cực nhanh khi có màng nước đọng trên mặt lá > 4 giờ ở nhiệt độ 22-26°C.",
    organicTreatment: {
      title: "Phác đồ Quản lý Sinh học & Canh tác",
      steps: [
        "Cắt tỉa toàn bộ cành vô hiệu, cành tăm, cành sâu bệnh sau thu hoạch giúp cây thông thoáng ánh sáng.",
        "Phun dung dịch Booc-đô 1% (1kg CuSO4 + 1kg Vôi tôi + 100L nước) để bảo vệ màng tế bào lá.",
        "Bổ sung phân bón lá hữu cơ giàu Magie (Mg) và Kẽm (Zn) giúp tăng cường diệp lục và độ dày phiến lá."
      ],
      bioProducts: "Dung dịch Booc-đô 1% tự pha, Phân bón lá vi lượng Chelate, Chế phẩm thảo mộc kháng nấm."
    },
    chemicalTreatment: {
      title: "Phác đồ Hóa học Nội hấp Lưu dẫn",
      activeIngredients: "Hexaconazole (5% SC), Propiconazole (250% EC), Difenoconazole (250g/l)",
      dosagePerLiter: "1.0 - 1.25 ml/L",
      dosageInstructions: "Pha 25-30ml cho bình 25L (hoased 200-250ml cho phuy 200L). Phun ướt đều toàn bộ tán, đặc biệt là mặt dưới phiến lá.",
      quarantineDays: 14,
      safetyNotes: "Phun luân phiên các nhóm hoạt chất triazole và strobilurin để chống hiện tượng nấm kháng thuốc."
    },
    seasonalPrevention: [
      "Trồng cây che bóng tầng cao (muồng đen, keo dậu, bơ, sầu riêng) với tỷ lệ phù hợp để điều hòa vi khí hậu.",
      "Tái canh hoặc ghép cải tạo bằng các giống cà phê vô tính kháng rỉ sắt (TR4, TR9, TR11).",
      "Bón phân cân đối đa trung vi lượng, tăng cường Kali vào giai đoạn nuôi trái."
    ]
  },

  dragonfruit: {
    cropName: "Thanh Long",
    cropKey: "dragonfruit",
    diseaseNameVi: "Bệnh Đốm Nâu (Đốm mắt cua / Bệnh ma)",
    diseaseNameScientific: "Neoscytalidium dimidiatum",
    confidenceScore: 95,
    severityLevel: "Nghiêm trọng",
    symptomsSummary: "Trên cành non và vỏ quả xuất hiện các vết đốm tròn trũng màu trắng ngà. Sau đó vết bệnh chuyển sang màu vàng cam, nhô gồ lên như mắt cua rồi chuyển sang nâu đen, làm cành bị thối tóp và quả nám đen.",
    primaryCauses: "Nấm Neoscytalidium dimidiatum phát tán mạnh theo gió và mưa bão, bùng phát nghiêm trọng trên các vườn lạm dụng phân đạm và kích thích tố tăng trưởng.",
    organicTreatment: {
      title: "Phác đồ Vệ sinh Cắt Tỉa & Sinh học",
      steps: [
        "Dùng kéo bén cắt bỏ triệt để các cành bệnh, thu gom toàn bộ ra khỏi vườn chôn lấp với vôi bột hoặc đốt tiêu hủy.",
        "Hạ mực nước mương vườn, giữ rãnh thoát nước khô ráo sau mưa.",
        "Phun rửa vườn sau các đợt mưa bão bằng nước vôi trong 2% hoặc chế phẩm Nano Bạc - Đồng hữu cơ."
      ],
      bioProducts: "Nano Bạc Đồng sinh học, Men vi sinh EM ủ phân chuồng, Chế phẩm kháng nấm thảo mộc."
    },
    chemicalTreatment: {
      title: "Phác đồ Hóa học Đặc trị Đốm nâu",
      activeIngredients: "Azoxystrobin + Difenoconazole (325 SC), Mancozeb (80% WP), Chlorothalonil (75% WP)",
      dosagePerLiter: "1.2 - 1.5 ml/L",
      dosageInstructions: "Pha 30-35ml cho bình 25L nước. Phun kỹ ướt đẫm các cành bị bệnh và các cành non mới ra nụ hoa.",
      quarantineDays: 7,
      safetyNotes: "Tuân thủ nghiêm ngặt thời gian cách ly 7 ngày trước khi thu hoạch quả xuất khẩu để đảm bảo dư lượng an toàn."
    },
    seasonalPrevention: [
      "Tỉa cành tạo tán thông thoáng hình mâm xôi, không để cành chồng lấn quá dày đặc.",
      "Bón nhiều phân hữu cơ hoai mục, tăng cường vôi bột và phân bón trung vi lượng Canxi - Silic.",
      "Không tưới phun mưa từ đầu trụ xuống cành non vào buổi chiều tối trong mùa bệnh."
    ]
  }
};

/**
 * Returns structured diagnosis from offline database
 */
export function getOfflineDiagnosis(cropKey, fallbackQuery = '') {
  if (cropKey && OFFLINE_DISEASES[cropKey]) {
    return { ...OFFLINE_DISEASES[cropKey], isOfflineFallback: true };
  }

  const queryLower = (fallbackQuery || '').toLowerCase();
  if (queryLower.includes('lúa') || queryLower.includes('đạo ôn') || queryLower.includes('gạo')) {
    return { ...OFFLINE_DISEASES.rice, isOfflineFallback: true };
  }
  if (queryLower.includes('sầu') || queryLower.includes('xì mủ') || queryLower.includes('ri6') || queryLower.includes('thối')) {
    return { ...OFFLINE_DISEASES.durian, isOfflineFallback: true };
  }
  if (queryLower.includes('cà phê') || queryLower.includes('rỉ sắt') || queryLower.includes('coffee')) {
    return { ...OFFLINE_DISEASES.coffee, isOfflineFallback: true };
  }
  if (queryLower.includes('thanh long') || queryLower.includes('đốm nâu') || queryLower.includes('mắt cua')) {
    return { ...OFFLINE_DISEASES.dragonfruit, isOfflineFallback: true };
  }

  return { ...OFFLINE_DISEASES.rice, isOfflineFallback: true };
}

/**
 * Pre-configured interactive sample presets for instant judge demo
 */
export const SAMPLE_PRESETS = [
  {
    id: 'sample_rice',
    name: '🌾 Đạo Ôn Lá Lúa (Rice Blast)',
    cropKey: 'rice',
    description: 'Vết bệnh hình thoi cháy lá trên lúa vụ Hè Thu tại ĐBSCL',
    sampleImageBase64: createRiceBlastSvg()
  },
  {
    id: 'sample_durian',
    name: '🌳 Xì Mủ Sầu Riêng (Phytophthora)',
    cropKey: 'durian',
    description: 'Nứt thân ứa mủ nâu đỏ trên gốc Sầu riêng Ri6 tại Tiền Giang',
    sampleImageBase64: createDurianPhytophthoraSvg()
  },
  {
    id: 'sample_coffee',
    name: '☕ Rỉ Sắt Cà Phê (Coffee Rust)',
    cropKey: 'coffee',
    description: 'Bột phấn vàng cam mặt dưới lá Cà phê tại Đắk Lắk',
    sampleImageBase64: createCoffeeRustSvg()
  },
  {
    id: 'sample_dragonfruit',
    name: '🌵 Đốm Nâu Thanh Long (Brown Spot)',
    cropKey: 'dragonfruit',
    description: 'Đốm mắt cua gồ ghề trên cành Thanh long tại Bình Thuận',
    sampleImageBase64: createDragonfruitSvg()
  }
];
