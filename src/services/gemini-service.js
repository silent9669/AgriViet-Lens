import { getPresetDiagnosis } from '../data/sample-presets.js';

export const GEMINI_MODELS = Object.freeze({
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-1.5-pro'
});

export const GEMINI_CONFIG = {
  MODEL: GEMINI_MODELS.FLASH,
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
};

function normalizeModel(model) {
  return model === GEMINI_MODELS.PRO ? GEMINI_MODELS.PRO : GEMINI_MODELS.FLASH;
}

export const CROP_LABELS = {
  rice: 'Lúa Nước (Rice)',
  durian: 'Sầu Riêng (Durian)',
  coffee: 'Cà Phê (Coffee)',
  dragonfruit: 'Thanh Long (Dragon Fruit)',
  general: 'Cây Trồng Chung (General Crop)'
};

const DEFAULT_ORGANIC_TREATMENT = {
  title: 'Phác đồ Sinh học VietGAP',
  steps: ['Cắt tỉa và tiêu hủy phần bệnh', 'Ưu tiên chế phẩm sinh học theo hướng dẫn nhãn.'],
  bioProducts: 'Trichoderma spp. và Bacillus spp.'
};

const LEGACY_QUARANTINE_DAYS = 14;

const DEFAULT_CHEMICAL_TREATMENT = {
  title: 'Phác đồ Hóa học',
  activeIngredients: 'Hoạt chất được đăng ký cho cây trồng và bệnh tương ứng',
  dosageInstructions: 'Pha theo hướng dẫn trên nhãn sản phẩm',
  quarantineDays: null,
  safetyNotes: 'Mang găng, khẩu trang, kính và quần áo bảo hộ; không đổ thuốc thừa hoặc nước rửa bình xuống ao hồ, kênh mương và tuân thủ nhãn sản phẩm.'
};

const DIAGNOSIS_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cropName: { type: 'STRING' },
    diseaseNameVi: { type: 'STRING' },
    diseaseNameScientific: { type: 'STRING' },
    confidenceScore: { type: 'NUMBER' },
    severityLevel: { type: 'STRING' },
    symptomsSummary: { type: 'STRING' },
    primaryCauses: { type: 'STRING' },
    organicTreatment: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        steps: { type: 'ARRAY', items: { type: 'STRING' } },
        bioProducts: { type: 'STRING' }
      },
      required: ['title', 'steps', 'bioProducts']
    },
    chemicalTreatment: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        activeIngredients: { type: 'STRING' },
        dosageInstructions: { type: 'STRING' },
        quarantineDays: { type: 'NUMBER', nullable: true },
        safetyNotes: { type: 'STRING' }
      },
      required: ['title', 'activeIngredients', 'dosageInstructions', 'quarantineDays', 'safetyNotes']
    },
    seasonalPrevention: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: [
    'cropName',
    'diseaseNameVi',
    'diseaseNameScientific',
    'confidenceScore',
    'severityLevel',
    'symptomsSummary',
    'primaryCauses',
    'organicTreatment',
    'chemicalTreatment',
    'seasonalPrevention'
  ]
};

const DEFAULT_DIAGNOSIS = {
  cropName: 'Cây Trồng',
  diseaseNameVi: 'Bệnh Cây Trồng Chưa Xác Định',
  diseaseNameScientific: 'Đang cập nhật',
  confidenceScore: 90,
  severityLevel: 'Trung bình',
  symptomsSummary: 'Quan sát thấy dấu hiệu bất thường trên mô thực vật.',
  primaryCauses: 'Cần kiểm tra thêm điều kiện thời tiết, dinh dưỡng và tác nhân gây bệnh.',
  organicTreatment: DEFAULT_ORGANIC_TREATMENT,
  chemicalTreatment: DEFAULT_CHEMICAL_TREATMENT,
  seasonalPrevention: ['Vệ sinh đồng ruộng sau thu hoạch.', 'Bón phân cân đối và giữ tán cây thông thoáng.']
};

const GENERIC_OFFLINE_DIAGNOSIS = {
  ...DEFAULT_DIAGNOSIS,
  cropName: CROP_LABELS.general,
  diseaseNameVi: 'Chưa xác định bệnh trên cây trồng',
  diseaseNameScientific: 'Chưa xác định',
  confidenceScore: 0,
  severityLevel: 'Chưa xác định',
  symptomsSummary: 'Chưa đủ dữ liệu để xác định bệnh. Hãy chụp rõ cả mặt trên và mặt dưới lá, thân hoặc trái.',
  primaryCauses: 'Có thể liên quan đến bệnh, sâu hại, thiếu dinh dưỡng hoặc tổn thương cơ giới; cần kiểm tra thêm tại ruộng.',
  organicTreatment: {
    title: DEFAULT_ORGANIC_TREATMENT.title,
    steps: ['Cô lập mẫu nghi bệnh, vệ sinh dụng cụ và theo dõi diễn biến mới trên cây.', 'Ưu tiên vệ sinh vườn, thoát nước và chăm sóc cân đối trước khi dùng thuốc.'],
    bioProducts: DEFAULT_ORGANIC_TREATMENT.bioProducts
  },
  chemicalTreatment: {
    ...DEFAULT_CHEMICAL_TREATMENT,
    dosageInstructions: 'Chỉ sử dụng sản phẩm được đăng ký cho đúng cây trồng và đối tượng gây hại theo nhãn.',
    quarantineDaysSpecified: false,
    quarantineDaysLabel: 'Theo nhãn bao bì BVTV'
  },
  seasonalPrevention: ['Theo dõi cây định kỳ và ghi nhận triệu chứng kèm thời tiết.', 'Tham khảo cán bộ kỹ thuật địa phương trước khi quyết định phun thuốc.']
};

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function textOrFallback(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberOrFallback(value, fallback, { min = -Infinity, max = Infinity } = {}) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

function stringListOrFallback(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  const values = value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim());
  return values.length ? values : [...fallback];
}

function cloneDiagnosis(preset, extra = {}) {
  return {
    ...preset,
    organicTreatment: {
      ...(preset.organicTreatment || {}),
      steps: [...(preset.organicTreatment?.steps || [])]
    },
    chemicalTreatment: { ...(preset.chemicalTreatment || {}) },
    seasonalPrevention: [...(preset.seasonalPrevention || [])],
    ...extra
  };
}

function getPresetFallback(cropHint, fallbackReason) {
  const preset = getPresetDiagnosis(cropHint);
  const fallback = preset || GENERIC_OFFLINE_DIAGNOSIS;
  const extra = {
    cropKey: preset ? preset.cropKey : 'general',
    isOfflineFallback: true,
    fallbackLabel: 'Mẫu thử nghiệm / Dữ liệu tham khảo',
    ...(fallbackReason ? { fallbackReason, apiError: fallbackReason } : {})
  };

  return cloneDiagnosis(fallback, extra);
}

function apiUrl(apiKey, model = GEMINI_MODELS.FLASH) {
  return `${GEMINI_CONFIG.API_BASE_URL}/${normalizeModel(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function offlineAssistantAnswer(userQuestion) {
  const question = String(userQuestion ?? '');
  const q = question.toLowerCase();

  if (q.includes('đạo ôn') || q.includes('lúa')) {
    return 'Đối với bệnh đạo ôn trên lúa, bà con cần ngưng ngay việc bón thừa đạm (ure), giữ mực nước ruộng từ 3-5cm. Phun trừ bằng các hoạt chất đặc trị như Tricyclazole (Beam, Flash) hoặc Isoprothiolane vào lúc sáng sớm khi ráo sương.';
  }
  if (q.includes('sầu riêng') || q.includes('xì mủ') || q.includes('thối rễ')) {
    return 'Bệnh xì mủ nứt thân sầu riêng do nấm Phytophthora gây ra. Bà con cạo sạch vết bệnh đến phần vỏ gỗ tươi, quét thuốc Metalaxyl hoặc Fosetyl-Aluminium đặc. Đồng thời tạo rãnh thoát nước vườn thật tốt trong mùa mưa.';
  }
  if (q.includes('cà phê') || q.includes('rỉ sắt')) {
    return 'Bệnh rỉ sắt cà phê xuất hiện nhiều vào mùa mưa ẩm. Bà con nên tỉa cành thông thoáng, phun luân phiên hoạt chất Hexaconazole (Anvil) hoặc Difenoconazole, tập trung vào mặt dưới của lá.';
  }
  if (q.includes('thanh long') || q.includes('đốm nâu') || q.includes('mắt cua')) {
    return 'Bệnh đốm nâu mắt cua trên thanh long cần cắt tỉa cành bệnh tiêu hủy, giữ rãnh thoát nước thông thoáng và phun luân phiên hoạt chất Azoxystrobin hoặc Difenoconazole theo nhãn đăng ký.';
  }
  return `Chào bà con! Trợ lý AgriViet Lens luôn sẵn sàng tư vấn kỹ thuật phòng trừ sâu bệnh, canh tác VietGAP và dinh dưỡng cây trồng. Với câu hỏi "${question}", bà con nên chú ý quản lý nguồn nước, cắt tỉa thông thoáng và bón phân cân đối Đạm - Lân - Kali.`;
}

export class GeminiService {
  /**
   * Format an image and an agronomy instruction for Gemini's multimodal API.
   */
  static formatVisionPayload(base64ImageUri, model = GEMINI_MODELS.FLASH) {
    const selectedModel = normalizeModel(model);
    const imageUri = String(base64ImageUri ?? '');
    let mimeType = 'image/jpeg';
    let rawBase64 = imageUri;
    const dataUriMatch = imageUri.match(/^data:([^;]+);base64,([\s\S]+)$/i);

    if (dataUriMatch) {
      mimeType = dataUriMatch[1].toLowerCase();
      rawBase64 = dataUriMatch[2];
    }

    const systemPrompt = `Bạn là Chuyên Gia Nông Nghiệp và Bác Sĩ Cây Trồng cao cấp tại Việt Nam, am hiểu bệnh lý thực vật nhiệt đới và quy trình VietGAP.

Trước tiên, hãy tự nhận diện loài cây hoặc cây trồng trong ảnh từ đặc điểm hình thái; không yêu cầu người dùng chọn cây trước và không suy đoán loài cây từ nhãn giao diện. Sau đó phân tích kỹ hình ảnh lá, thân hoặc trái; phân biệt bệnh với sâu hại, thiếu dinh dưỡng và tổn thương cơ giới. Chỉ đưa ra chẩn đoán khi có dấu hiệu phù hợp, nêu rõ mức độ tin cậy và ưu tiên biện pháp an toàn, khả thi tại ruộng Việt Nam.

BẮT BUỘC trả về duy nhất một đối tượng JSON hợp lệ, không markdown, không lời dẫn. JSON phải có đủ các trường: cropName, diseaseNameVi, diseaseNameScientific, confidenceScore (number từ 0 đến 100), severityLevel, symptomsSummary, primaryCauses, organicTreatment (title, steps là mảng chuỗi, bioProducts), chemicalTreatment (title, activeIngredients, dosageInstructions, quarantineDays là number hoặc null, safetyNotes), seasonalPrevention (mảng chuỗi). Luôn nêu cảnh báo bảo hộ cá nhân và bảo vệ nguồn nước trong safetyNotes.`;

    const parts = [
      { text: `Hãy tự nhận diện loài cây trong hình ảnh này rồi chẩn đoán theo schema JSON bắt buộc. Mô hình đang sử dụng: ${selectedModel}.` }
    ];
    const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
    if (rawBase64 && supportedMimeTypes.has(mimeType)) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: rawBase64
        }
      });
    } else if (imageUri) {
      parts[0].text += ' Ảnh SVG hoặc định dạng chưa hỗ trợ chưa được gửi; chỉ đưa ra hướng dẫn thận trọng, không khẳng định bệnh nếu thiếu dấu hiệu.';
    }

    // Gemini REST uses camelCase. Keep snake_case aliases available to callers
    // that build legacy requests without serializing the aliases.
    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: DIAGNOSIS_RESPONSE_SCHEMA,
      temperature: 0.15,
      topP: 0.95
    };
    Object.defineProperty(generationConfig, 'response_mime_type', {
      value: generationConfig.responseMimeType,
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(generationConfig, 'response_schema', {
      value: generationConfig.responseSchema,
      enumerable: false,
      configurable: true
    });

    return {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts
        }
      ],
      generationConfig
    };
  }

  /**
   * Parse Gemini text, tolerating a markdown fence or a short prose prefix.
   */
  static parseDiagnosisResponse(rawText) {
    if (typeof rawText !== 'string' || !rawText.trim()) {
      throw new Error('Empty response from Gemini API');
    }

    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end < start) {
      throw new Error('Gemini response did not contain a JSON object');
    }

    let data;
    try {
      data = JSON.parse(cleaned.slice(start, end + 1));
    } catch (error) {
      throw new Error(`Invalid JSON from Gemini API: ${error.message}`);
    }

    if (!isRecord(data)) {
      throw new Error('Gemini response JSON must be an object');
    }

    const organic = isRecord(data.organicTreatment) ? data.organicTreatment : {};
    const chemical = isRecord(data.chemicalTreatment) ? data.chemicalTreatment : {};
    const rawQuarantineDays = chemical.quarantineDays;
    const hasQuarantineValue = (typeof rawQuarantineDays === 'number' && Number.isFinite(rawQuarantineDays))
      || (typeof rawQuarantineDays === 'string' && rawQuarantineDays.trim() !== '');
    const parsedQuarantineDays = Number(rawQuarantineDays);
    const hasValidQuarantineDays = hasQuarantineValue && Number.isFinite(parsedQuarantineDays) && parsedQuarantineDays >= 0;

    return {
      cropName: textOrFallback(data.cropName, DEFAULT_DIAGNOSIS.cropName),
      diseaseNameVi: textOrFallback(data.diseaseNameVi, DEFAULT_DIAGNOSIS.diseaseNameVi),
      diseaseNameScientific: textOrFallback(data.diseaseNameScientific, DEFAULT_DIAGNOSIS.diseaseNameScientific),
      confidenceScore: numberOrFallback(data.confidenceScore, DEFAULT_DIAGNOSIS.confidenceScore, { min: 0, max: 100 }),
      severityLevel: textOrFallback(data.severityLevel, DEFAULT_DIAGNOSIS.severityLevel),
      symptomsSummary: textOrFallback(data.symptomsSummary, DEFAULT_DIAGNOSIS.symptomsSummary),
      primaryCauses: textOrFallback(data.primaryCauses, DEFAULT_DIAGNOSIS.primaryCauses),
      organicTreatment: {
        title: textOrFallback(organic.title, DEFAULT_ORGANIC_TREATMENT.title),
        steps: stringListOrFallback(organic.steps, DEFAULT_ORGANIC_TREATMENT.steps),
        bioProducts: textOrFallback(organic.bioProducts, DEFAULT_ORGANIC_TREATMENT.bioProducts)
      },
      chemicalTreatment: {
        title: textOrFallback(chemical.title, DEFAULT_CHEMICAL_TREATMENT.title),
        activeIngredients: textOrFallback(chemical.activeIngredients, DEFAULT_CHEMICAL_TREATMENT.activeIngredients),
        dosageInstructions: textOrFallback(chemical.dosageInstructions, DEFAULT_CHEMICAL_TREATMENT.dosageInstructions),
        // Keep the legacy numeric fallback for consumers that expect a number,
        // but expose the explicit label so the UI never presents it as verified.
        quarantineDays: hasValidQuarantineDays ? parsedQuarantineDays : LEGACY_QUARANTINE_DAYS,
        quarantineDaysSpecified: hasValidQuarantineDays,
        quarantineDaysLabel: hasValidQuarantineDays ? `${parsedQuarantineDays} ngày` : 'Theo nhãn bao bì BVTV',
        safetyNotes: textOrFallback(chemical.safetyNotes, DEFAULT_CHEMICAL_TREATMENT.safetyNotes)
      },
      seasonalPrevention: stringListOrFallback(data.seasonalPrevention, DEFAULT_DIAGNOSIS.seasonalPrevention)
    };
  }

  /**
   * Rasterize an SVG data URI before sending it to Gemini, which accepts raster
   * image MIME types but does not accept image/svg+xml inline data.
   */
  static async rasterizeSvgDataUri(imageUri) {
    if (typeof document === 'undefined' || typeof Image === 'undefined') return null;

    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => {
        try {
          const width = image.naturalWidth || image.width || 320;
          const height = image.naturalHeight || image.height || 220;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          if (!context) {
            resolve(null);
            return;
          }
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch (error) {
          console.warn('[GeminiService] Unable to rasterize SVG image:', error);
          resolve(null);
        }
      };
      image.onerror = () => resolve(null);
      image.src = imageUri;
    });
  }

  static async prepareVisionImage(base64ImageUri) {
    const imageUri = String(base64ImageUri ?? '');
    const match = imageUri.match(/^data:([^;]+);base64,[\s\S]+$/i);
    if (!match || match[1].toLowerCase() !== 'image/svg+xml') return imageUri;

    const rasterized = await this.rasterizeSvgDataUri(imageUri);
    if (rasterized) return rasterized;

    console.warn('[GeminiService] SVG image could not be rasterized; omitting unsupported inline data.');
    return '';
  }

  /**
   * Diagnose a crop image with Gemini, falling back to a matching sample or a
   * clearly generic offline guideline when no crop preset is available.
   */
  static async diagnoseCropImage(
    base64ImageUri,
    { model = GEMINI_MODELS.FLASH, apiKey = null, cropHint = 'general' } = {}
  ) {
    const selectedModel = normalizeModel(model);

    // A browser has the local proxy available; direct callers use REST below.
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64ImageUri,
            model: selectedModel,
            clientApiKey: apiKey
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.diagnosis) {
            return {
              ...data.diagnosis,
              isOfflineFallback: false
            };
          }
        }
      } catch (e) {
        // Fall back to a direct request or offline reference.
      }
    }

    if (!apiKey || !String(apiKey).trim()) {
      const reason = 'Chưa cấu hình Gemini API; đang hiển thị dữ liệu tham khảo ngoại tuyến.';
      console.warn('[GeminiService] No API key provided, using offline reference data.');
      return getPresetFallback(cropHint, reason);
    }

    try {
      const preparedImage = await this.prepareVisionImage(base64ImageUri);
      const payload = this.formatVisionPayload(preparedImage, selectedModel);
      const response = await fetch(apiUrl(String(apiKey).trim(), selectedModel), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch {
          // Preserve the HTTP status when a platform response has no text body.
        }
        throw new Error(`Gemini API returned status ${response.status}${errorBody ? `: ${errorBody}` : ''}`);
      }

      const result = await response.json();
      const textContent = result?.candidates?.[0]?.content?.parts?.find(part => typeof part.text === 'string')?.text;
      if (!textContent) {
        throw new Error('No candidate text received from Gemini');
      }

      return {
        ...this.parseDiagnosisResponse(textContent),
        isOfflineFallback: false
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn('[GeminiService] Falling back to sample preset:', reason);
      return getPresetFallback(cropHint, reason);
    }
  }

  /**
   * Ask the farming assistant a text question with optional diagnosis context.
   */
  static async askFarmingAssistant(
    userQuestion,
    context = {},
    { model = GEMINI_MODELS.FLASH, apiKey = null } = {}
  ) {
    const selectedModel = normalizeModel(model);

    // A browser has the local proxy available; direct callers use REST below.
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userQuestion,
            context,
            model: selectedModel,
            clientApiKey: apiKey
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.answer) {
            return data.answer;
          }
        }
      } catch (e) {
        // Fall back to a direct request or offline reference.
      }
    }

    if (!apiKey || !String(apiKey).trim()) {
      return offlineAssistantAnswer(userQuestion);
    }

    try {
      const systemInstruction = 'Bạn là Bác Sĩ Cây Trồng và Kỹ Sư Nông Nghiệp Việt Nam thân thiện, am hiểu thực tế ruộng đồng. Trả lời bằng tiếng Việt, ngắn gọn 3-4 câu, dễ hiểu, thực tế, ưu tiên giải pháp sinh học VietGAP an toàn và nêu cảnh báo nhãn thuốc khi cần.';
      const payload = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Ngữ cảnh chẩn đoán gần nhất: ${JSON.stringify(context)}\n\nCâu hỏi của nông dân: ${String(userQuestion ?? '')}`
            }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350
        }
      };

      const response = await fetch(apiUrl(String(apiKey).trim(), selectedModel), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini Chat API Error ${response.status}`);
      }

      const result = await response.json();
      return result?.candidates?.[0]?.content?.parts?.find(part => typeof part.text === 'string')?.text
        || 'Không nhận được câu trả lời từ máy chủ.';
    } catch (error) {
      console.warn('[GeminiService] Chat fallback:', error instanceof Error ? error.message : String(error));
      return `[Chế độ Ngoại tuyến] ${offlineAssistantAnswer(userQuestion)}`;
    }
  }

  /**
   * Resizes an image file/canvas to maximum dimension to speed up transmission.
   */
  static resizeImageToMax(imageElement, maxDim = 800) {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    let width = imageElement.width || imageElement.naturalWidth || 800;
    let height = imageElement.height || imageElement.naturalHeight || 600;

    if (width > height) {
      if (width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      }
    } else {
      if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }
}
