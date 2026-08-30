import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Middleware for parsing JSON with ample capacity for base64 images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Google Gen AI helper
let aiClient = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const CROP_LABELS = {
  rice: 'Lúa Nước (Rice)',
  durian: 'Sầu Riêng (Durian)',
  coffee: 'Cà Phê (Coffee)',
  dragonfruit: 'Thanh Long (Dragon Fruit)',
  general: 'Cây Trồng Chung (General Crop)'
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API Config
app.get('/api/config', (req, res) => {
  res.json({
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// API: Crop Pathology Diagnosis via Gemini 2.0 Flash Multimodal
app.post('/api/diagnose', async (req, res) => {
  try {
    const { imageBase64, cropHint = 'general', clientApiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 payload' });
    }

    const effectiveApiKey = process.env.GEMINI_API_KEY || clientApiKey;
    if (!effectiveApiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server or client'
      });
    }

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    const cropText = CROP_LABELS[cropHint] || 'Cây trồng nhiệt đới Việt Nam';

    let mimeType = 'image/jpeg';
    let rawBase64 = imageBase64;

    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        rawBase64 = match[2];
      }
    }

    const systemPrompt = `Bạn là Chuyên Gia Nông Nghiệp & Bác Sĩ Cây Trồng cao cấp tại Việt Nam với hơn 20 năm kinh nghiệm bệnh lý thực vật nhiệt đới.
Cây trồng mục tiêu: ${cropText}.

Nhiệm vụ:
Phân tích kỹ lưỡng hình ảnh lá/thân/trái của cây trồng, chẩn đoán chính xác tên bệnh, tác nhân gây bệnh, mức độ và cung cấp phác đồ điều trị chi tiết theo chuẩn VietGAP.

BẮT BUỘC trả về duy nhất chuỗi JSON thuần túy (không thêm markdown hay lời dẫn) theo schema sau:
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType,
                data: rawBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
        topP: 0.95
      }
    });

    const responseText = response?.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini model');
    }

    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    const diagnosis = JSON.parse(cleaned);
    diagnosis.isOfflineFallback = false;
    res.json({ success: true, diagnosis });
  } catch (err) {
    console.error('[Server /api/diagnose] Error:', err);
    res.status(200).json({
      fallback: true,
      error: err.message
    });
  }
});

// API: Conversational Field Copilot
app.post('/api/chat', async (req, res) => {
  try {
    const { question, context = {}, clientApiKey } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Missing question parameter' });
    }

    const effectiveApiKey = process.env.GEMINI_API_KEY || clientApiKey;
    if (!effectiveApiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured'
      });
    }

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    const systemInstruction = `Bạn là Bác Sĩ Cây Trồng và Kỹ Sư Nông Nghiệp Việt Nam thân thiện, am hiểu sâu sắc thực tế ruộng đồng Việt Nam. Hãy trả lời ngắn gọn, súc tích (3-4 câu), dễ hiểu, thực tế, ưu tiên giải pháp sinh học VietGAP an toàn và hiệu quả cao.`;

    const promptText = `${systemInstruction}\n\nNgữ cảnh chẩn đoán gần nhất: ${JSON.stringify(context)}\n\nCâu hỏi của nông dân: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: {
        temperature: 0.7,
        maxOutputTokens: 400
      }
    });

    const answer = response?.text || 'Không nhận được phản hồi từ AI.';
    res.json({ success: true, answer });
  } catch (err) {
    console.error('[Server /api/chat] Error:', err);
    res.status(200).json({
      fallback: true,
      error: err.message
    });
  }
});

// Serve static frontend assets
app.use(express.static(__dirname));

// SPA fallback to index.html (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening on port 3000
app.listen(PORT, HOST, () => {
  console.log(`🌾 AgriViet Lens server running on http://${HOST}:${PORT}`);
  console.log(`[Gemini Server Key]: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Using Offline DB / Client Key'}`);
});
