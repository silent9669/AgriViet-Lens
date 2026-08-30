/**
 * High-fidelity, offline-safe diagnosis samples used by the scanner preview.
 *
 * The illustrations are intentionally inline SVGs encoded as data URIs. They
 * stay crisp at any size, work without a network request, and can be sent to
 * Gemini as ordinary image data when a user chooses to analyze a preset.
 */

function svgToDataUri(svg) {
  const source = svg.trim();
  let encoded;

  if (typeof btoa === 'function') {
    encoded = btoa(source);
  } else if (typeof Buffer !== 'undefined') {
    encoded = Buffer.from(source, 'utf8').toString('base64');
  } else {
    throw new Error('This runtime cannot encode SVG sample illustrations.');
  }

  return `data:image/svg+xml;base64,${encoded}`;
}

const riceIllustration = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
  <defs>
    <linearGradient id="rice-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eff8e8"/>
      <stop offset="1" stop-color="#cde7c1"/>
    </linearGradient>
    <linearGradient id="rice-leaf" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#237449"/>
      <stop offset="1" stop-color="#8dbb62"/>
    </linearGradient>
  </defs>
  <rect width="320" height="220" rx="16" fill="url(#rice-bg)"/>
  <path d="M0 178c48-22 91-23 139-4 51 20 106 17 181-13v59H0Z" fill="#9bc47c"/>
  <path d="M0 196c61-18 113-14 166 4 49 17 93 10 154-13v33H0Z" fill="#5f9b62" opacity=".8"/>
  <g fill="none" stroke="#438358" stroke-linecap="round" stroke-width="3">
    <path d="M34 200c8-34 15-63 12-97"/><path d="M53 204c2-37 9-77 29-108"/>
    <path d="M272 196c-6-35-13-65-8-99"/><path d="M291 201c-3-33-7-61-22-91"/>
  </g>
  <path d="M37 120c36-24 99-44 170-51 31-3 60-2 81 2-22 14-47 28-76 40-62 26-126 34-175 9Z" fill="url(#rice-leaf)" stroke="#1b5b3a" stroke-width="3"/>
  <path d="M48 116c61-14 134-28 231-42" fill="none" stroke="#d8efbd" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>
  <g fill="#7d3d3b" stroke="#542f31" stroke-width="1.5">
    <path d="M99 98c5-8 12-8 18-1-2 9-7 14-15 14-5-3-6-8-3-13Z"/>
    <path d="M137 88c5-7 12-7 17-1-1 8-6 12-13 13-5-2-6-6-4-12Z"/>
    <path d="M184 75c5-7 12-6 16 0-1 8-6 12-13 12-4-2-5-7-3-12Z"/>
    <path d="M219 76c4-6 10-6 14-1-1 7-5 10-11 10-4-2-5-5-3-9Z"/>
  </g>
  <g fill="#fff" opacity=".9">
    <circle cx="26" cy="32" r="3"/><circle cx="48" cy="24" r="2"/><circle cx="284" cy="34" r="3"/>
  </g>
  <rect x="205" y="18" width="91" height="29" rx="9" fill="#ffffff" opacity=".82"/>
  <path d="M218 33h10m7 0h10m7 0h10m7 0h10" stroke="#46784a" stroke-width="3" stroke-linecap="round"/>
</svg>`);

const durianIllustration = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
  <defs>
    <linearGradient id="durian-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5f1df"/>
      <stop offset="1" stop-color="#d8e4c1"/>
    </linearGradient>
    <linearGradient id="durian-bark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#684b32"/>
      <stop offset=".5" stop-color="#96714a"/>
      <stop offset="1" stop-color="#4e392d"/>
    </linearGradient>
  </defs>
  <rect width="320" height="220" rx="16" fill="url(#durian-bg)"/>
  <path d="M0 187c67-18 125-15 181 0 51 14 94 13 139-2v35H0Z" fill="#7ca36e"/>
  <path d="M111 220c11-42 19-81 18-118-1-23 10-38 29-43 16 8 22 21 19 44-5 37 2 74 16 117Z" fill="url(#durian-bark)" stroke="#4f392b" stroke-width="3"/>
  <path d="M151 68c-13 20 8 29-5 47-14 19 12 26-1 49-9 15 11 28 2 50" fill="none" stroke="#f0b35e" stroke-width="5" stroke-linecap="round"/>
  <path d="M148 76c7 9 2 18 8 25 6 7-2 18 5 25 7 9-3 20 2 31" fill="none" stroke="#3d2c27" stroke-width="2" opacity=".8"/>
  <path d="M167 111c12 9 14 18 11 27-2 8 8 15 6 26" fill="none" stroke="#f5d28a" stroke-width="4" stroke-linecap="round"/>
  <g fill="#f8d79a" stroke="#b57a37" stroke-width="2">
    <path d="M157 104c-7 1-9 8-4 13 4 4 10 2 11-4 1-5-2-9-7-9Z"/>
    <path d="M146 145c-7 1-9 8-4 13 4 4 10 2 11-4 1-5-2-9-7-9Z"/>
    <path d="M175 159c-7 1-9 8-4 13 4 4 10 2 11-4 1-5-2-9-7-9Z"/>
  </g>
  <path d="M137 76c-29-24-62-25-87-4 22 3 39 13 51 29 14-10 25-18 36-25Z" fill="#356c47" stroke="#1f5238" stroke-width="3"/>
  <path d="M183 69c30-24 62-18 84 6-22-1-40 7-54 21-11-10-21-19-30-27Z" fill="#4d8750" stroke="#275d3b" stroke-width="3"/>
  <path d="M228 163c-8-18-4-36 10-51" fill="none" stroke="#d3e6ae" stroke-width="4" stroke-linecap="round"/>
  <path d="M237 109c8 3 15 8 22 16-11 4-20 3-27-1 1-6 2-11 5-15Z" fill="#7cae60"/>
  <circle cx="41" cy="41" r="17" fill="#fff" opacity=".72"/>
  <path d="M34 41h14M41 34v14" stroke="#b57a37" stroke-width="3" stroke-linecap="round"/>
</svg>`);

const coffeeIllustration = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
  <defs>
    <linearGradient id="coffee-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9f1e4"/>
      <stop offset="1" stop-color="#c1d9bd"/>
    </linearGradient>
    <linearGradient id="coffee-leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e6846"/>
      <stop offset="1" stop-color="#438d55"/>
    </linearGradient>
  </defs>
  <rect width="320" height="220" rx="16" fill="url(#coffee-bg)"/>
  <circle cx="44" cy="38" r="24" fill="#ffffff" opacity=".6"/>
  <path d="M18 174c60-31 122-39 185-22 41 11 79 10 117-4v72H0v-27c6-6 12-12 18-19Z" fill="#7ba76a"/>
  <path d="M39 193c48-61 105-112 173-141" fill="none" stroke="#6b5438" stroke-width="7" stroke-linecap="round"/>
  <path d="M191 46c43-11 77 6 90 44-34 16-71 13-105-7-5-13 1-26 15-37Z" fill="url(#coffee-leaf)" stroke="#164e38" stroke-width="3"/>
  <path d="M183 80c40 0 70 2 98 8" fill="none" stroke="#bdd899" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M231 57c-9 7-15 15-19 25M252 59c-10 9-17 19-19 29M274 68c-7 7-12 15-14 23" fill="none" stroke="#1f633f" stroke-width="2" opacity=".7"/>
  <g fill="#d79035" stroke="#a85a2d" stroke-width="2">
    <circle cx="207" cy="75" r="7"/><circle cx="223" cy="91" r="5"/><circle cx="241" cy="78" r="6"/>
    <circle cx="257" cy="95" r="7"/><circle cx="276" cy="82" r="5"/><circle cx="292" cy="101" r="6"/>
  </g>
  <g fill="#f2bd50" opacity=".9">
    <circle cx="205" cy="73" r="2"/><circle cx="239" cy="76" r="2"/><circle cx="255" cy="93" r="2"/><circle cx="290" cy="99" r="2"/>
  </g>
  <path d="M215 185c-5-17-1-32 12-44" fill="none" stroke="#bdd899" stroke-width="4" stroke-linecap="round"/>
  <path d="M57 92c23 2 40 14 48 35-19 7-40 1-52-15-3-8-2-14 4-20Z" fill="#4c995d" stroke="#275e3e" stroke-width="2.5"/>
  <circle cx="49" cy="37" r="11" fill="none" stroke="#a85a2d" stroke-width="3"/>
  <path d="M43 37h12M49 31v12" stroke="#a85a2d" stroke-width="2" stroke-linecap="round"/>
</svg>`);

const dragonfruitIllustration = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
  <defs>
    <linearGradient id="dragon-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7efe8"/>
      <stop offset="1" stop-color="#f2d4c0"/>
    </linearGradient>
    <linearGradient id="dragon-stem" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4d8a5c"/>
      <stop offset="1" stop-color="#8db866"/>
    </linearGradient>
  </defs>
  <rect width="320" height="220" rx="16" fill="url(#dragon-bg)"/>
  <path d="M0 189c59-12 115-8 168 8 51 15 101 11 152-10v33H0Z" fill="#9cb77b"/>
  <path d="M40 195c42-17 81-42 116-77 28-28 61-47 101-51 14 10 19 24 12 42-22 5-43 17-61 35-39 39-91 68-153 74Z" fill="url(#dragon-stem)" stroke="#356c4a" stroke-width="4"/>
  <path d="M83 180c39-29 69-57 95-89 20-25 42-39 68-45" fill="none" stroke="#d4e3a1" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  <g fill="#855044" stroke="#633d39" stroke-width="2">
    <path d="M83 151c6-9 16-11 23-4 4 9-1 17-10 19-9 0-15-5-13-15Z"/>
    <path d="M109 128c5-8 14-9 20-2 3 8-1 15-9 17-8 0-13-5-11-15Z"/>
    <path d="M142 105c5-8 14-9 20-2 3 8-1 15-9 17-8 0-13-5-11-15Z"/>
    <path d="M174 80c5-8 14-9 20-2 3 8-1 15-9 17-8 0-13-5-11-15Z"/>
    <path d="M214 60c5-8 14-9 20-2 3 8-1 15-9 17-8 0-13-5-11-15Z"/>
  </g>
  <g fill="#e9ad73" opacity=".9">
    <circle cx="91" cy="148" r="3"/><circle cx="118" cy="125" r="3"/><circle cx="151" cy="102" r="3"/><circle cx="183" cy="77" r="3"/><circle cx="223" cy="57" r="3"/>
  </g>
  <path d="M60 100c9-16 22-24 39-23-4 15-12 26-26 33-6-2-10-5-13-10Z" fill="#57935b" stroke="#356c4a" stroke-width="3"/>
  <path d="M255 138c12-11 25-13 39-7-9 12-20 18-35 17-3-3-4-6-4-10Z" fill="#6fa662" stroke="#356c4a" stroke-width="3"/>
  <circle cx="48" cy="40" r="19" fill="#fff" opacity=".7"/>
  <path d="M39 39c6-10 16-10 20 0-4 12-14 12-20 0Z" fill="#d76750"/>
  <path d="M44 34c3-4 8-4 11 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
</svg>`);

export const SAMPLE_PRESETS = Object.freeze([
  {
    id: 'rice-leaf-blast',
    crop: 'rice',
    cropKey: 'rice',
    cropName: 'Lúa Nước',
    diseaseNameVi: 'Bệnh Đạo Ôn Lá',
    diseaseNameScientific: 'Pyricularia oryzae',
    confidenceScore: 96,
    severityLevel: 'Trung bình',
    symptomsSummary: 'Vết bệnh hình thoi, tâm xám trắng và viền nâu đỏ xuất hiện dọc phiến lá; các vết liên kết có thể làm lá cháy từng mảng.',
    primaryCauses: 'Nấm Pyricularia oryzae phát triển mạnh khi ruộng ẩm kéo dài, đêm mát, sương nhiều và cây nhận thừa đạm nhưng thiếu kali.',
    organicTreatment: {
      title: 'Phác đồ Sinh học / Hữu cơ VietGAP',
      steps: [
        'Khoanh vùng ổ bệnh, thu gom lá cháy và tiêu hủy ngoài ruộng; khử dụng cụ sau khi cắt tỉa.',
        'Ngưng bón thêm đạm, giữ mực nước 3–5 cm và bổ sung kali để mô lá cứng khỏe hơn.',
        'Phun luân phiên chế phẩm Bacillus subtilis hoặc chitosan vào sáng sớm, lặp lại sau 5–7 ngày nếu còn vết mới.'
      ],
      bioProducts: 'Bacillus subtilis, chitosan và dịch chiết tỏi/Neem đạt chuẩn sử dụng trong canh tác VietGAP.'
    },
    chemicalTreatment: {
      title: 'Phác đồ Hóa học Đặc trị',
      activeIngredients: 'Tricyclazole 75% WP; Isoprothiolane 40% EC (luân phiên hoạt chất, không phun lặp một nhóm).',
      dosageInstructions: '8 g Tricyclazole 75WP / bình 16L nước; phun ướt đều hai mặt lá theo nhãn sản phẩm.',
      quarantineDays: 14,
      safetyNotes: 'Mang găng, khẩu trang, kính và quần áo bảo hộ; không phun khi gió mạnh, không đổ thuốc thừa xuống ao hồ và tuân thủ nhãn đăng ký tại địa phương.'
    },
    seasonalPrevention: [
      'Sạ thưa, dùng giống sạch bệnh và xử lý hạt trước gieo.',
      'Bón phân cân đối Đạm–Lân–Kali, chia nhỏ lần bón và tránh thúc đạm trước mưa.',
      'Thăm đồng mỗi 3–5 ngày trong giai đoạn đẻ nhánh và làm đòng.',
      'Giữ ruộng thông thoáng, tháo nước ngắn ngày khi ẩm độ cao kéo dài.'
    ],
    sampleImageBase64: riceIllustration
  },
  {
    id: 'durian-trunk-canker',
    crop: 'durian',
    cropKey: 'durian',
    cropName: 'Sầu Riêng',
    diseaseNameVi: 'Bệnh Xì Mủ Nứt Thân',
    diseaseNameScientific: 'Phytophthora palmivora',
    confidenceScore: 94,
    severityLevel: 'Nghiêm trọng',
    symptomsSummary: 'Vỏ thân nứt dọc, rỉ dịch màu nâu hổ phách và mô dưới vỏ thâm nâu; tán có thể vàng rũ khi bệnh lan xuống rễ.',
    primaryCauses: 'Nấm Phytophthora palmivora lây qua đất và nước mưa, bùng phát trong vườn thoát nước kém, cổ rễ bị lấp đất hoặc vết thương cơ giới.',
    organicTreatment: {
      title: 'Phác đồ Sinh học / Hữu cơ VietGAP',
      steps: [
        'Khơi rãnh thoát nước quanh tán, không tưới phun lên thân và giữ cổ rễ khô thoáng.',
        'Cạo sạch phần vỏ bệnh đến mô gỗ sáng màu, gom bỏ mùn bệnh và sát trùng dụng cụ sau mỗi cây.',
        'Quét hỗn hợp Trichoderma với phân hữu cơ hoai mục quanh vùng rễ khỏe; theo dõi vết xì mủ mỗi 5–7 ngày.'
      ],
      bioProducts: 'Trichoderma harzianum, Bacillus amyloliquefaciens và compost hoai mục có kiểm soát nguồn bệnh.'
    },
    chemicalTreatment: {
      title: 'Phác đồ Hóa học Đặc trị',
      activeIngredients: 'Fosetyl-Aluminium 80% WP; Metalaxyl-M phối hợp Mancozeb (dùng đúng cây trồng và nhãn đăng ký).',
      dosageInstructions: '25 g Fosetyl-Al 80WP / bình 16L nước; quét vết bệnh sau khi làm sạch và chỉ tưới gốc theo nhãn.',
      quarantineDays: 21,
      safetyNotes: 'Không pha chung tùy tiện với chế phẩm có tính kiềm; mang đầy đủ bảo hộ, cách ly trẻ em và vật nuôi, thu gom bùn/vỏ bệnh để tránh phát tán nguồn nấm.'
    },
    seasonalPrevention: [
      'Lên mô cao, duy trì mương thoát nước và không để nước đọng sau mưa lớn.',
      'Tỉa cành thấp chạm đất, khử trùng kéo cắt bằng dung dịch được phép.',
      'Phủ hữu cơ cách cổ rễ tối thiểu 20 cm, không vun đất sát thân.',
      'Khảo sát thân và rễ vào đầu mùa mưa để xử lý ổ bệnh từ sớm.'
    ],
    sampleImageBase64: durianIllustration
  },
  {
    id: 'coffee-leaf-rust',
    crop: 'coffee',
    cropKey: 'coffee',
    cropName: 'Cà Phê',
    diseaseNameVi: 'Bệnh Rỉ Sắt Lá',
    diseaseNameScientific: 'Hemileia vastatrix',
    confidenceScore: 95,
    severityLevel: 'Trung bình',
    symptomsSummary: 'Mặt dưới lá có ổ bào tử màu vàng cam như bụi phấn; mặt trên tương ứng là đốm vàng, lá già rụng sớm làm tán thưa.',
    primaryCauses: 'Nấm Hemileia vastatrix phát tán bằng gió và nước bắn, tăng nhanh trong tán rậm, ẩm độ cao, thiếu ánh sáng và dinh dưỡng mất cân đối.',
    organicTreatment: {
      title: 'Phác đồ Sinh học / Hữu cơ VietGAP',
      steps: [
        'Tỉa cành vô hiệu, lá rụng và chồi vượt để giảm ẩm trong tán; đưa tàn dư ra khỏi vườn.',
        'Bổ sung phân hữu cơ hoai, kali và trung vi lượng theo kết quả đất; tránh thúc đạm đơn.',
        'Phun Bacillus hoặc dịch chiết thực vật phủ đều mặt dưới lá, kiểm tra lại sau 7 ngày.'
      ],
      bioProducts: 'Bacillus subtilis, Bacillus amyloliquefaciens và dịch chiết rong biển hỗ trợ phục hồi lá.'
    },
    chemicalTreatment: {
      title: 'Phác đồ Hóa học Đặc trị',
      activeIngredients: 'Hexaconazole 5% SC; Difenoconazole 250 g/L EC (luân phiên nhóm FRAC).',
      dosageInstructions: '20 ml Hexaconazole 5SC / bình 16L nước; tập trung phun kỹ mặt dưới lá và không phun lúc lá đang ướt.',
      quarantineDays: 14,
      safetyNotes: 'Đeo kính, găng và khẩu trang lọc hơi; không thu hái trong thời gian cách ly trên nhãn, không xả dung dịch vào nguồn nước sinh hoạt.'
    },
    seasonalPrevention: [
      'Trồng cây chắn gió hợp lý và duy trì khoảng cách giúp tán nhận ánh sáng.',
      'Tỉa thông thoáng sau thu hoạch, vệ sinh lá bệnh trước các đợt mưa dài.',
      'Bón phân theo phân tích đất, tăng kali và canxi khi cây mang trái nặng.',
      'Theo dõi mặt dưới lá từ đầu mùa mưa, xử lý khi tỷ lệ lá bệnh còn thấp.'
    ],
    sampleImageBase64: coffeeIllustration
  },
  {
    id: 'dragonfruit-brown-spot',
    crop: 'dragonfruit',
    cropKey: 'dragonfruit',
    cropName: 'Thanh Long',
    diseaseNameVi: 'Bệnh Đốm Nâu Mắt Cua',
    diseaseNameScientific: 'Neoscytalidium dimidiatum',
    confidenceScore: 93,
    severityLevel: 'Trung bình',
    symptomsSummary: 'Đốm tròn nâu đỏ dạng mắt cua xuất hiện trên cành, tâm lõm và có quầng vàng; mô bệnh lan dọc cành trong thời tiết nóng ẩm.',
    primaryCauses: 'Nấm Neoscytalidium dimidiatum xâm nhập qua vết xước, côn trùng hoặc mưa tạt; vườn tán rậm và tưới lên cành làm bệnh lan nhanh.',
    organicTreatment: {
      title: 'Phác đồ Sinh học / Hữu cơ VietGAP',
      steps: [
        'Cắt dưới phần bệnh tối thiểu 10–15 cm, khử trùng kéo giữa các trụ và tiêu hủy cành nhiễm.',
        'Giảm tưới phun, làm sạch cỏ và giữ mặt luống khô thoáng sau mưa.',
        'Quét chế phẩm Trichoderma hoặc đồng sinh học ở vết cắt; kiểm tra cành mới sau 5–7 ngày.'
      ],
      bioProducts: 'Trichoderma viride, Bacillus subtilis và chế phẩm đồng sinh học được phép cho thanh long.'
    },
    chemicalTreatment: {
      title: 'Phác đồ Hóa học Đặc trị',
      activeIngredients: 'Difenoconazole 250 g/L EC; Azoxystrobin 200 g/L + Difenoconazole 125 g/L SC.',
      dosageInstructions: '12 ml Difenoconazole 250EC / bình 16L nước; phun phủ cành khỏe quanh ổ bệnh theo đúng nhãn.',
      quarantineDays: 14,
      safetyNotes: 'Không phun khi sắp thu hoạch, tuân thủ thời gian cách ly trên nhãn; mặc bảo hộ, che chắn nguồn nước và không dùng lại chai lọ thuốc.'
    },
    seasonalPrevention: [
      'Tạo tán thông thoáng, tháo bỏ cành già và buộc cành tránh cọ xát.',
      'Khử trùng dụng cụ cắt tỉa bằng cồn hoặc dung dịch được đăng ký.',
      'Không tưới phun lên cành, ưu tiên tưới gốc vào buổi sáng.',
      'Bổ sung kali, canxi và silic hợp lý để tăng độ cứng mô cành trước mùa mưa.'
    ],
    sampleImageBase64: dragonfruitIllustration
  }
]);

/**
 * Find the diagnosis preset associated with a crop key.
 *
 * @param {string} cropKey - rice, durian, coffee, or dragonfruit.
 * @returns {object|undefined} The matching preset, when available.
 */
export function getPresetDiagnosis(cropKey) {
  const normalizedKey = String(cropKey ?? '').trim().toLowerCase();
  return SAMPLE_PRESETS.find(preset => preset.cropKey === normalizedKey);
}
