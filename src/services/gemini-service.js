import { SAMPLE_PRESETS, getPresetDiagnosis } from '../data/sample-presets.js';

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.0-flash',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
};

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

const DEFAULT_CHEMICAL_TREATMENT = {
  title: 'Phác đồ Hóa học',
  activeIngredients: 'Hoạt chất được đăng ký cho cây trồng và bệnh tương ứng',
  dosageInstructions: 'Pha theo hướng dẫn trên nhãn sản phẩm',
  quarantineDays: 14,
  safetyNotes: 'Mang đầy đủ bảo hộ lao động và tuân thủ thời gian cách ly trên nhãn.'
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
  const preset = getPresetDiagnosis(cropHint) || SAMPLE_PRESETS[0];
  if (!preset) {
    return {
      ...DEFAULT_DIAGNOSIS,
      organicTreatment: { ...DEFAULT_ORGANIC_TREATMENT, steps: [...DEFAULT_ORGANIC_TREATMENT.steps] },
      chemicalTreatment: { ...DEFAULT_CHEMICAL_TREATMENT },
      seasonalPrevention: [...DEFAULT_DIAGNOSIS.seasonalPrevention],
      cropKey: cropHint || 'general',
      isOfflineFallback: true,
      ...(fallbackReason ? { fallbackReason, apiError: fallbackReason } : {})
    };
  }

  return cloneDiagnosis(preset, {
    isOfflineFallback: true,
    ...(fallbackReason ? { fallbackReason, apiError: fallbackReason } : {})
  });
}

function apiUrl(apiKey) {
  return `${GEMINI_CONFIG.API_BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
  static formatVisionPayload(base64ImageUri, cropHint = 'general') {
    const cropText = CROP_LABELS[cropHint] || 'Cây trồng nhiệt đới Việt Nam';
    const imageUri = String(base64ImageUri ?? '');
    let mimeType = 'image/jpeg';
    let rawBase64 = imageUri;
    const dataUriMatch = imageUri.match(/^data:([^;]+);base64,([\s\S]+)$/i);

    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      rawBase64 = dataUriMatch[2];
    }

    const systemPrompt = `Bạn là Chuyên Gia Nông Nghiệp và Bác Sĩ Cây Trồng cao cấp tại Việt Nam, am hiểu bệnh lý thực vật nhiệt đới và quy trình VietGAP.

Hãy phân tích kỹ hình ảnh lá, thân hoặc trái; phân biệt bệnh với sâu hại, thiếu dinh dưỡng và tổn thương cơ giới. Chỉ đưa ra chẩn đoán khi có dấu hiệu phù hợp, nêu rõ mức độ tin cậy và ưu tiên biện pháp an toàn, khả thi tại ruộng Việt Nam.

BẮT BUỘC trả về duy nhất một đối tượng JSON hợp lệ, không markdown, không lời dẫn. JSON phải có đủ các trường: cropName, diseaseNameVi, diseaseNameScientific, confidenceScore (number từ 0 đến 100), severityLevel, symptomsSummary, primaryCauses, organicTreatment (title, steps là mảng chuỗi, bioProducts), chemicalTreatment (title, activeIngredients, dosageInstructions, quarantineDays là number, safetyNotes), seasonalPrevention (mảng chuỗi). Thời gian cách ly phải tính theo ngày và không được bỏ trống.`;

    return {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Cây trồng mục tiêu: ${cropText}. Hãy chẩn đoán hình ảnh này theo schema JSON bắt buộc.` },
            {
              inline_data: {
                mime_type: mimeType,
                data: rawBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.15,
        topP: 0.95
      }
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
        quarantineDays: numberOrFallback(chemical.quarantineDays, DEFAULT_CHEMICAL_TREATMENT.quarantineDays, { min: 0 }),
        safetyNotes: textOrFallback(chemical.safetyNotes, DEFAULT_CHEMICAL_TREATMENT.safetyNotes)
      },
      seasonalPrevention: stringListOrFallback(data.seasonalPrevention, DEFAULT_DIAGNOSIS.seasonalPrevention)
    };
  }

  /**
   * Diagnose a crop image with Gemini, falling back to the matching sample preset.
   */
  static async diagnoseCropImage(base64ImageUri, cropHint = 'general', apiKey = null) {
    if (!apiKey || !String(apiKey).trim()) {
      console.warn('[GeminiService] No API key provided, using high-fidelity sample preset.');
      return getPresetFallback(cropHint);
    }

    try {
      const payload = this.formatVisionPayload(base64ImageUri, cropHint);
      const response = await fetch(apiUrl(String(apiKey).trim()), {
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
  static async askFarmingAssistant(userQuestion, context = {}, apiKey = null) {
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

      const response = await fetch(apiUrl(String(apiKey).trim()), {
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
