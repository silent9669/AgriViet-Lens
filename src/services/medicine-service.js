/**
 * AgriViet Lens - Agricultural Medicine & Bio-Product Finder Service
 * Maps active ingredients and biological products to verified market price estimates
 * and generates direct e-commerce links (Shopee Vietnam) for farmers.
 */

export const MEDICINE_CATALOG = [
  {
    id: 'med_trichoderma',
    name: 'Chế phẩm Nấm đối kháng Trichoderma Điền Trang / Viện BVTV',
    category: 'bio',
    activeIngredient: 'Trichoderma viride & Trichoderma harzianum 10^9 CFU/g',
    targetDiseases: ['Bệnh đạo ôn', 'Xì mủ', 'Thối rễ', 'Lở cổ rễ', 'Nấm đất'],
    priceMin: 45000,
    priceMax: 70000,
    unit: 'gói 500g',
    priceDisplay: '45.000₫ – 70.000₫ / gói 500g',
    dosageGuide: 'Pha 50g / bình 16L nước hoặc 500g / phuy 200L tưới gốc',
    quarantineDays: 0,
    safetyNotes: 'Chế phẩm vi sinh an toàn VietGAP, không độc hại cho người và vật nuôi.',
    shopeeKeyword: 'Trichoderma vi sinh đoi khang tri nam benh cay trong'
  },
  {
    id: 'med_bacillus',
    name: 'Vi sinh đối kháng Bacillus subtilis Bio-Shield',
    category: 'bio',
    activeIngredient: 'Bacillus subtilis & Bacillus thuringiensis 10^9 CFU/ml',
    targetDiseases: ['Đạo ôn lá', 'Cháy bìa lá', 'Thối nhũn vi khuẩn', 'Đốm nâu'],
    priceMin: 60000,
    priceMax: 95000,
    unit: 'chai 500ml',
    priceDisplay: '60.000₫ – 95.000₫ / chai 500ml',
    dosageGuide: 'Pha 30ml / bình 16L nước, phun ướt đều tán lá',
    quarantineDays: 0,
    safetyNotes: 'Chế phẩm sinh học thân thiện môi trường, ưu tiên dùng trong canh tác hữu cơ.',
    shopeeKeyword: 'Bacillus subtilis sinh hoc tru khuan nam cay trong'
  },
  {
    id: 'med_nano_silver',
    name: 'Nano Bạc Đồng Sinh Học Ag-Cu 1000ppm',
    category: 'bio',
    activeIngredient: 'Nano Bạc (Nano Silver) + Nano Đồng (Nano Copper)',
    targetDiseases: ['Đốm nâu mắt cua', 'Thán thư', 'Xì mủ', 'Bạc lá lúa'],
    priceMin: 85000,
    priceMax: 130000,
    unit: 'chai 500ml',
    priceDisplay: '85.000₫ – 130.000₫ / chai 500ml',
    dosageGuide: 'Pha 40ml / bình 16L nước, phun sáng sớm hoặc chiều mát',
    quarantineDays: 0,
    safetyNotes: 'Không gây cháy lá, không để lại tồn dư hóa chất độc hại.',
    shopeeKeyword: 'Nano bac dong sinh hoc phong tri nam khuan'
  },
  {
    id: 'med_chitosan',
    name: 'Chế phẩm Sinh học Chitosan Olicide 9DD (Chitosan)',
    category: 'bio',
    activeIngredient: 'Chitosan 9% w/v sinh học tự nhiên',
    targetDiseases: ['Khô vằn', 'Đốm lá', 'Tuyến trùng rễ', 'Thán thư', 'Phấn trắng'],
    priceMin: 65000,
    priceMax: 110000,
    unit: 'chai 480ml',
    priceDisplay: '65.000₫ – 110.000₫ / chai 480ml',
    dosageGuide: 'Pha 30ml / bình 16L nước hoặc 1 chai / phuy 200L phun phòng trị',
    quarantineDays: 0,
    safetyNotes: 'Chế phẩm chiết xuất từ vỏ giáp xác, kích thích cây tự đề kháng bệnh, an toàn 100%.',
    shopeeKeyword: 'Chitosan sinh hoc Olicide tri nam khuan cay trong'
  },
  {
    id: 'med_pseudomonas',
    name: 'Chế phẩm Vi sinh Pseudomonas fluorescens Đối Kháng',
    category: 'bio',
    activeIngredient: 'Pseudomonas fluorescens 10^9 CFU/ml',
    targetDiseases: ['Héo xanh vi khuẩn', 'Thối rễ', 'Lở cổ rễ', 'Cháy lá vi khuẩn'],
    priceMin: 55000,
    priceMax: 90000,
    unit: 'chai 500ml',
    priceDisplay: '55.000₫ – 90.000₫ / chai 500ml',
    dosageGuide: 'Pha 40ml / bình 16L tưới đẫm vùng gốc rễ hoặc phun tán lá',
    quarantineDays: 0,
    safetyNotes: 'Vi sinh cố định đạm và ức chế trực khuẩn nấm hại đất rễ.',
    shopeeKeyword: 'Pseudomonas fluorescens che pham vi sinh tri heoxanh'
  },
  {
    id: 'med_tricyclazole',
    name: 'Thuốc trừ đạo ôn Beam 75WP / Flash 75WP (Tricyclazole)',
    category: 'chemical',
    activeIngredient: 'Tricyclazole 75% w/w',
    targetDiseases: ['Bệnh đạo ôn lá lúa', 'Đạo ôn cổ bông', 'Đạo ôn nhánh', 'Đạo ôn lá'],
    priceMin: 55000,
    priceMax: 85000,
    unit: 'gói 100g',
    priceDisplay: '55.000₫ – 85.000₫ / gói 100g',
    dosageGuide: 'Pha 15g – 20g / bình 16L hoặc 25g – 30g / bình 25L nước',
    quarantineDays: 14,
    safetyNotes: 'Thuốc đặc trị nấm đạo ôn, nội hấp mạnh. Thời gian cách ly PHI: 14 ngày trước thu hoạch.',
    shopeeKeyword: 'Thuoc tru dao on Beam 75WP Tricyclazole'
  },
  {
    id: 'med_fosetyl',
    name: 'Thuốc trừ nấm lưu dẫn Aliette 800WG (Fosetyl-Aluminium)',
    category: 'chemical',
    activeIngredient: 'Fosetyl-Aluminium 800 g/kg (80%)',
    targetDiseases: ['Xì mủ nứt thân sầu riêng', 'Thối rễ Phytophthora', 'Chết nhanh hồ tiêu', 'Sương mai', 'Xì mủ'],
    priceMin: 75000,
    priceMax: 115000,
    unit: 'gói 100g',
    priceDisplay: '75.000₫ – 115.000₫ / gói 100g',
    dosageGuide: 'Pha 40g / bình 16L hoặc 250g / phuy 200L quét thân / tưới gốc',
    quarantineDays: 14,
    safetyNotes: 'Lưu dẫn 2 chiều (lên lá và xuống rễ). Đeo găng tay và mặt nạ khi quét thuốc lên vết xì mủ.',
    shopeeKeyword: 'Aliette 800WG Fosetyl Aluminium tru xi mu'
  },
  {
    id: 'med_hexaconazole',
    name: 'Thuốc trừ nấm Anvil 5SC (Hexaconazole)',
    category: 'chemical',
    activeIngredient: 'Hexaconazole 50 g/L',
    targetDiseases: ['Rỉ sắt cà phê', 'Khô vằn lúa', 'Nấm hồng cao su', 'Phấn trắng', 'Rỉ sắt', 'Gỉ sắt'],
    priceMin: 95000,
    priceMax: 145000,
    unit: 'chai 1 Lít',
    priceDisplay: '95.000₫ – 145.000₫ / chai 1 Lít',
    dosageGuide: 'Pha 30ml – 40ml / bình 16L hoặc 50ml / bình 25L nước',
    quarantineDays: 14,
    safetyNotes: 'Phun tập trung vào mặt dưới của lá nơi ổ nấm phát tán. Cách ly 14 ngày.',
    shopeeKeyword: 'Anvil 5SC Hexaconazole tri ri sat kho van'
  },
  {
    id: 'med_amistar',
    name: 'Thuốc trừ bệnh Amistar Top 325SC (Azoxystrobin + Difenoconazole)',
    category: 'chemical',
    activeIngredient: 'Azoxystrobin 200 g/L + Difenoconazole 125 g/L',
    targetDiseases: ['Đốm nâu thanh long', 'Thán thư xoài', 'Lem lép hạt lúa', 'Đốm lá', 'Thán thư'],
    priceMin: 185000,
    priceMax: 260000,
    unit: 'chai 250ml',
    priceDisplay: '185.000₫ – 260.000₫ / chai 250ml',
    dosageGuide: 'Pha 15ml – 20ml / bình 16L hoặc 30ml / bình 25L nước',
    quarantineDays: 10,
    safetyNotes: 'Phổ tác dụng rộng, làm xanh lá và sáng quả. Cách ly 10 ngày trước thu hoạch.',
    shopeeKeyword: 'Amistar Top 325SC Azoxystrobin Difenoconazole'
  },
  {
    id: 'med_metalaxyl',
    name: 'Thuốc trừ nấm Ridomil Gold 68WG (Metalaxyl-M + Mancozeb)',
    category: 'chemical',
    activeIngredient: 'Mancozeb 640 g/kg + Metalaxyl-M 40 g/kg',
    targetDiseases: ['Xì mủ sầu riêng', 'Mốc sương cà chua', 'Thán thư ớt', 'Thối ngọn', 'Thối rễ', 'Xì mủ'],
    priceMin: 80000,
    priceMax: 125000,
    unit: 'gói 100g',
    priceDisplay: '80.000₫ – 125.000₫ / gói 100g',
    dosageGuide: 'Pha 40g – 50g / bình 16L hoặc 500g / phuy 200L nước',
    quarantineDays: 14,
    safetyNotes: 'Tác động tiếp xúc và nội hấp mạnh. Tuyệt đối không xả nước rửa bình xuống ao hồ.',
    shopeeKeyword: 'Ridomil Gold 68WG Metalaxyl Mancozeb'
  }
];

export class MedicineService {
  /**
   * Returns all catalog items
   * @returns {Array} List of all medicine items
   */
  static getAllMedicines() {
    return MEDICINE_CATALOG;
  }

  /**
   * Search medicines by query string and optional category
   * @param {string} query Search text (name, ingredient, disease)
   * @param {string} category 'all' | 'bio' | 'chemical'
   * @returns {Array} Filtered medicines
   */
  static searchMedicines(query = '', category = 'all') {
    const q = String(query || '').trim().toLowerCase();
    const cat = String(category || 'all').toLowerCase();

    return MEDICINE_CATALOG.filter(med => {
      const matchCat = cat === 'all' || med.category === cat;
      if (!matchCat) return false;

      if (!q) return true;

      const matchName = med.name.toLowerCase().includes(q);
      const matchActive = med.activeIngredient.toLowerCase().includes(q);
      const matchDisease = med.targetDiseases.some(d => d.toLowerCase().includes(q));

      return matchName || matchActive || matchDisease;
    });
  }

  /**
   * Finds matching medicines for a given disease name with keyword-aware fallback
   * @param {string} diseaseName Disease pathology or symptom name
   * @returns {Array} Matching medicines
   */
  static findMedicinesForDisease(diseaseName) {
    const term = String(diseaseName || '').trim().toLowerCase();
    if (!term) return [];

    const keywords = [
      'đạo ôn', 'thán thư', 'xì mủ', 'rỉ sắt', 'gỉ sắt',
      'khô vằn', 'thối rễ', 'lở cổ rễ', 'phấn trắng', 'đốm nâu',
      'héo xanh', 'cháy lá', 'cháy bìa lá', 'bạc lá', 'sương mai',
      'nấm hồng', 'lem lép hạt', 'thối nhũn', 'tuyến trùng'
    ];

    const matchedKeywords = keywords.filter(kw => term.includes(kw));

    return MEDICINE_CATALOG.filter(med => {
      const matchDirect = med.targetDiseases.some(d => {
        const dLower = d.toLowerCase();
        return dLower.includes(term) || term.includes(dLower);
      });
      if (matchDirect) return true;

      if (matchedKeywords.length > 0) {
        return med.targetDiseases.some(d => {
          const dLower = d.toLowerCase();
          return matchedKeywords.some(kw => dLower.includes(kw));
        });
      }

      return false;
    });
  }

  /**
   * Generates a direct Shopee search URL for a medicine item or keyword
   * @param {Object|string} medicine Medicine item object or keyword string
   * @returns {string} Fully formatted Shopee search URL
   */
  static getShopeeSearchUrl(medicine) {
    if (!medicine) {
      return 'https://shopee.vn/search?keyword=thuoc%20bao%20ve%20thuc%20vat%20nong%20nghiep';
    }
    if (typeof medicine === 'string') {
      return `https://shopee.vn/search?keyword=${encodeURIComponent(medicine.trim())}`;
    }
    const keyword = medicine.shopeeKeyword || medicine.name || 'thuoc bao ve thuc vat nong nghiep';
    return `https://shopee.vn/search?keyword=${encodeURIComponent(keyword.trim())}`;
  }

  /**
   * Legacy alias for getShopeeSearchUrl
   */
  static generateShopeeUrl(keyword) {
    return this.getShopeeSearchUrl(keyword);
  }

  /**
   * Finds matching medicines and e-commerce recommendations based on diagnosis data
   * @param {Object} diagnosis Diagnosis object from Gemini / Presets
   * @returns {Array} List of medicines with shopeeUrl attached
   */
  static findMedicinesForDiagnosis(diagnosis) {
    if (!diagnosis) return [];

    const diseaseText = (diagnosis.diseaseNameVi || '').toLowerCase();
    const activeText = (diagnosis.chemicalTreatment?.activeIngredients || '').toLowerCase();
    const bioText = (diagnosis.organicTreatment?.bioProducts || '').toLowerCase();

    const matches = MEDICINE_CATALOG.filter(med => {
      const matchDisease = med.targetDiseases.some(d => diseaseText.includes(d.toLowerCase()) || d.toLowerCase().includes(diseaseText));
      const matchActive = activeText && (activeText.includes(med.activeIngredient.toLowerCase().split(' ')[0]) || med.activeIngredient.toLowerCase().includes(activeText.split(' ')[0]));
      const matchBio = bioText && bioText.includes(med.activeIngredient.toLowerCase().split(' ')[0]);

      return matchDisease || matchActive || matchBio;
    });

    if (matches.length > 0) {
      return matches.map(med => ({
        ...med,
        shopeeUrl: this.getShopeeSearchUrl(med)
      }));
    }

    // Keyword-based search fallback
    const keywordMatches = this.findMedicinesForDisease(diagnosis.diseaseNameVi);
    if (keywordMatches.length > 0) {
      return keywordMatches.map(med => ({
        ...med,
        shopeeUrl: this.getShopeeSearchUrl(med)
      }));
    }

    // Generic fallback: search by disease name directly on Shopee
    return [
      {
        id: 'med_generic_bio',
        name: diagnosis.organicTreatment?.bioProducts || 'Chế phẩm sinh học VietGAP',
        category: 'bio',
        activeIngredient: 'Chế phẩm vi sinh đối kháng sinh học',
        targetDiseases: [diagnosis.diseaseNameVi || 'Bệnh cây trồng'],
        priceMin: 45000,
        priceMax: 90000,
        unit: 'gói/chai',
        priceDisplay: '45.000₫ – 90.000₫ / đơn vị',
        dosageGuide: 'Pha theo hướng dẫn trên bao bì nhà sản xuất',
        quarantineDays: 0,
        safetyNotes: 'An toàn VietGAP, không độc hại cho người tiêu dùng.',
        shopeeKeyword: `che pham sinh hoc ${diagnosis.diseaseNameVi || 'cay trong'}`,
        shopeeUrl: this.getShopeeSearchUrl(`che pham sinh hoc ${diagnosis.diseaseNameVi || 'cay trong'}`)
      },
      {
        id: 'med_generic_chemical',
        name: diagnosis.chemicalTreatment?.activeIngredients || 'Thuốc đặc trị nấm/khuẩn',
        category: 'chemical',
        activeIngredient: diagnosis.chemicalTreatment?.activeIngredients || 'Hoạt chất đặc trị',
        targetDiseases: [diagnosis.diseaseNameVi || 'Bệnh cây trồng'],
        priceMin: 55000,
        priceMax: 150000,
        unit: 'gói/chai',
        priceDisplay: '55.000₫ – 150.000₫ / đơn vị',
        dosageGuide: diagnosis.chemicalTreatment?.dosageInstructions || 'Pha đúng liều khuyến cáo',
        quarantineDays: diagnosis.chemicalTreatment?.quarantineDays || 14,
        safetyNotes: diagnosis.chemicalTreatment?.safetyNotes || 'Tuân thủ bảo hộ lao động và thời gian cách ly PHI.',
        shopeeKeyword: `thuoc tri ${diagnosis.diseaseNameVi || 'benh cay trong'}`,
        shopeeUrl: this.getShopeeSearchUrl(`thuoc tri ${diagnosis.diseaseNameVi || 'benh cay trong'}`)
      }
    ];
  }

  /**
   * Search catalog with Shopee URLs pre-attached
   * @param {string} queryText
   * @returns {Array} List of medicines with shopeeUrl
   */
  static searchCatalog(queryText) {
    return this.searchMedicines(queryText, 'all').map(med => ({
      ...med,
      shopeeUrl: this.getShopeeSearchUrl(med)
    }));
  }
}
