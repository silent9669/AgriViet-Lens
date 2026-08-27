import { getOfflineDiagnosis } from '../data/offline-diseases.js';

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

export class GeminiService {
  /**
   * Formats the multimodal vision payload for Gemini 2.0/1.5 Flash
   */
  static formatVisionPayload(base64ImageUri, cropHint = 'general') {
    const cropText = CROP_LABELS[cropHint] || 'Cây trồng nhiệt đới Việt Nam';

    // Parse mime type and raw base64 data
    let mimeType = 'image/jpeg';
    let rawBase64 = base64ImageUri;

    if (base64ImageUri.startsWith('data:')) {
      const match = base64ImageUri.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        rawBase64 = match[2];
      }
    }

    const systemPrompt = `Bạn là Chuyên Gia Nông Nghiệp & Bác Sĩ Cây Trồng cao cấp tại Việt Nam với hơn 20 năm kinh nghiệm bệnh lý thực vật nhiệt đới.
Cây trồng mục tiêu: ${cropText}.

Nhiệm vụ:
Phân tích kỹ lưỡng hình ảnh lá/thân/trái của cây trồng, chẩn đoán chính xác tên bệnh, tác nhân gây bệnh, mức độ và cung cấp phác đồ điều trị chi tiết theo chuẩn VietGAP.

BẮT BUỘC trả về duy nhất chuỗi JSON thuần túy (không thêm lời dẫn) theo schema sau:
{
  "cropName": "Tên cây trồng tại Việt Nam",
  "diseaseNameVi": "Tên tiếng Việt chính xác của bệnh",
  "diseaseNameScientific": "Tên khoa học của mầm bệnh (Latin)",
  "confidenceScore": 95,
  "severityLevel": "Nhẹ" | "Trung bình" | "Nghiêm trọng",
  "symptomsSummary": "Mô tả triệu chứng phát hiện trên ảnh",
  "primaryCauses": "Nguyên nhân (nấm, vi khuẩn, virus, thiếu dinh dưỡng...)",
  "organicTreatment": {
    "title": "Phác đồ Sinh học / Hữu cơ VietGAP",
    "steps": ["Bước 1...", "Bước 2..."],
    "bioProducts": "Chế phẩm sinh học đề xuất"
  },
  "chemicalTreatment": {
    "title": "Phác đồ Hóa học Đặc trị",
    "activeIngredients": "Hoạt chất đặc trị khuyên dùng",
    "dosageInstructions": "Liều lượng pha bình 16L hoặc 25L nước",
    "quarantineDays": 14,
    "safetyNotes": "Khuyến cáo an toàn lao động và bảo vệ nguồn nước"
  },
  "seasonalPrevention": [
    "Biện pháp phòng ngừa 1...",
    "Biện pháp phòng ngừa 2..."
  ]
}`;

    return {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
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
        temperature: 0.2,
        topP: 0.95
      }
    };
  }

  /**
   * Safely parses JSON response from Gemini, extracting from Markdown if needed
   */
  static parseDiagnosisResponse(rawText) {
    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    let cleaned = rawText.trim();
    // Remove markdown code fence if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    const data = JSON.parse(cleaned);

    // Ensure default fallbacks for nested structures
    return {
      cropName: data.cropName || 'Cây Trồng',
      diseaseNameVi: data.diseaseNameVi || 'Bệnh Cây Trồng Chưa Xác Định',
      diseaseNameScientific: data.diseaseNameScientific || 'Đang cập nhật',
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 90,
      severityLevel: data.severityLevel || 'Trung bình',
      symptomsSummary: data.symptomsSummary || 'Quan sát thấy vết đổi màu và đốm bệnh trên mô thực vật.',
      primaryCauses: data.primaryCauses || 'Điều kiện thời tiết ẩm ướt và mầm bệnh trong môi trường canh tác.',
      organicTreatment: data.organicTreatment || {
        title: 'Phác đồ Sinh học VietGAP',
        steps: ['Cắt tỉa lá bệnh tiêu hủy', 'Phun chế phẩm sinh học đối kháng Trichoderma / Bacillus.'],
        bioProducts: 'Trichoderma spp., Nano Bạc Bạc sinh học'
      },
      chemicalTreatment: data.chemicalTreatment || {
        title: 'Phác đồ Hóa học',
        activeIngredients: 'Hoạt chất trừ nấm/khuẩn phổ rộng',
        dosageInstructions: 'Pha theo hướng dẫn bao bì nhà sản xuất',
        quarantineDays: 14,
        safetyNotes: 'Bảo hộ lao động đầy đủ khi phun xịt.'
      },
      seasonalPrevention: Array.isArray(data.seasonalPrevention) ? data.seasonalPrevention : [
        'Vệ sinh đồng ruộng sau thu hoạch.',
        'Bón phân cân đối, tránh thừa đạm.'
      ]
    };
  }

  /**
   * Performs crop image diagnosis via Gemini API with offline fallback
   */
  static async diagnoseCropImage(base64ImageUri, cropHint = 'general', apiKey = null) {
    if (!apiKey) {
      console.warn('[GeminiService] No API key provided, utilizing High-Fidelity Offline Knowledge Base.');
      return getOfflineDiagnosis(cropHint, cropHint);
    }

    try {
      const payload = this.formatVisionPayload(base64ImageUri, cropHint);
      const url = `${GEMINI_CONFIG.API_BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[GeminiService] API Error:', response.status, errorBody);
        throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      const textContent = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error('No candidate text received from Gemini');
      }

      const parsed = this.parseDiagnosisResponse(textContent);
      parsed.isOfflineFallback = false;
      return parsed;
    } catch (err) {
      console.warn('[GeminiService] Falling back to offline database due to:', err.message);
      const fallback = getOfflineDiagnosis(cropHint, cropHint);
      fallback.fallbackReason = err.message;
      return fallback;
    }
  }

  /**
   * Conversational Agricultural Field Copilot (Voice/Text Q&A)
   */
  static async askFarmingAssistant(userQuestion, context = {}, apiKey = null) {
    if (!apiKey) {
      // High quality offline conversational knowledge responses
      const q = userQuestion.toLowerCase();
      if (q.includes('đạo ôn') || q.includes('lúa')) {
        return 'Đối với bệnh đạo ôn trên lúa, bà con cần ngưng ngay việc bón thừa đạm (ure), giữ mực nước ruộng từ 3-5cm. Phun trừ bằng các hoạt chất đặc trị như Tricyclazole (Beam, Flash) hoặc Isoprothiolane vào lúc sáng sớm khi ráo sương.';
      }
      if (q.includes('sầu riêng') || q.includes('xì mủ') || q.includes('thối rễ')) {
        return 'Bệnh xì mủ nứt thân sầu riêng do nấm Phytophthora gây ra. Bà con cạo sạch vết bệnh đến phần vỏ gỗ tươi, quét thuốc Metalaxyl hoặc Fosetyl-Aluminium đặc. Đồng thời tạo rãnh thoát nước vườn thật tốt trong mùa mưa.';
      }
      if (q.includes('cà phê') || q.includes('rỉ sắt')) {
        return 'Bệnh rỉ sắt cà phê xuất hiện nhiều vào mùa mưa ẩm. Bà con nên tỉa cành thông thoáng, phun luân phiên hoạt chất Hexaconazole (Anvil) hoặc Difenoconazole, tập trung vào mặt dưới của lá.';
      }
      return `Chào bà con! Trợ lý AgriViet Lens luôn sẵn sàng tư vấn kỹ thuật phòng trừ sâu bệnh, canh tác VietGAP và dinh dưỡng cây trồng. Với câu hỏi "${userQuestion}", bà con nên chú ý quản lý nguồn nước, cắt tỉa thông thoáng và bón phân cân đối Đạm - Lân - Kali.`;
    }

    try {
      const systemInstruction = `Bạn là Bác Sĩ Cây Trồng và Kỹ Sư Nông Nghiệp Việt Nam thân thiện, am hiểu sâu sắc thực tế ruộng đồng Việt Nam. Hãy trả lời ngắn gọn, súc tích (3-4 câu), dễ hiểu, thực tế, ưu tiên giải pháp sinh học VietGAP an toàn và hiệu quả cao.`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstruction}\n\nNgữ cảnh chẩn đoán gần nhất: ${JSON.stringify(context)}\n\nCâu hỏi của nông dân: ${userQuestion}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350
        }
      };

      const url = `${GEMINI_CONFIG.API_BASE_URL}/${GEMINI_CONFIG.MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini Chat API Error ${response.status}`);
      }

      const result = await response.json();
      return result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được câu trả lời từ máy chủ.';
    } catch (err) {
      console.warn('[GeminiService] Chat fallback:', err.message);
      return `[Chế độ Ngoại tuyến] Chào bà con! Với câu hỏi "${userQuestion}", khuyến cáo bà con kiểm tra độ ẩm vườn, dọn dẹp tàn dư nấm bệnh và sử dụng thuốc bảo vệ thực vật sinh học theo danh mục được phép lưu hành tại Việt Nam.`;
    }
  }

  /**
   * Resizes an image file/canvas to maximum dimension to speed up transmission
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
