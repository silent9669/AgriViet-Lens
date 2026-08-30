import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS, GeminiService } from './src/services/gemini-service.js';

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

function normalizeModel(model) {
  return model === GEMINI_MODELS.PRO ? GEMINI_MODELS.PRO : GEMINI_MODELS.FLASH;
}

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

// API: Crop Pathology Diagnosis via Gemini multimodal vision.
app.post('/api/diagnose', async (req, res) => {
  try {
    const { imageBase64, model = GEMINI_MODELS.FLASH, clientApiKey } = req.body ?? {};
    const selectedModel = normalizeModel(model);

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

    let mimeType = 'image/jpeg';
    let rawBase64 = imageBase64;
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1].toLowerCase();
        rawBase64 = match[2];
      }
    }

    const systemPrompt = `Bạn là Chuyên Gia Nông Nghiệp và Bác Sĩ Cây Trồng cao cấp tại Việt Nam, am hiểu bệnh lý thực vật nhiệt đới và quy trình VietGAP.

Trước tiên, hãy tự nhận diện loài cây hoặc cây trồng trong ảnh từ đặc điểm hình thái; không yêu cầu người dùng chọn cây trước và không suy đoán loài cây từ nhãn giao diện. Sau đó phân tích kỹ hình ảnh lá, thân hoặc trái; phân biệt bệnh với sâu hại, thiếu dinh dưỡng và tổn thương cơ giới. Chỉ đưa ra chẩn đoán khi có dấu hiệu phù hợp, nêu rõ mức độ tin cậy và ưu tiên biện pháp an toàn, khả thi tại ruộng Việt Nam.

BẮT BUỘC trả về duy nhất một đối tượng JSON hợp lệ, không markdown, không lời dẫn. JSON phải có đủ các trường cropName, diseaseNameVi, diseaseNameScientific, confidenceScore, severityLevel, symptomsSummary, primaryCauses, organicTreatment (title, steps, bioProducts), chemicalTreatment (title, activeIngredients, dosageInstructions, quarantineDays, safetyNotes), seasonalPrevention. confidenceScore là số từ 0 đến 100; quarantineDays là số hoặc null. Luôn nêu cảnh báo bảo hộ cá nhân và bảo vệ nguồn nước trong safetyNotes.`;

    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Hãy tự nhận diện loài cây trong hình ảnh này rồi chẩn đoán theo schema JSON bắt buộc.' },
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
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: DIAGNOSIS_RESPONSE_SCHEMA,
        temperature: 0.15,
        topP: 0.95
      }
    });

    const responseText = response?.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini model');
    }

    const diagnosis = {
      ...GeminiService.parseDiagnosisResponse(responseText),
      isOfflineFallback: false
    };
    return res.json({ success: true, diagnosis });
  } catch (err) {
    console.error('[Server /api/diagnose] Error:', err);
    return res.status(200).json({
      fallback: true,
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

// API: Conversational Field Copilot
app.post('/api/chat', async (req, res) => {
  try {
    const { question, context = {}, model = GEMINI_MODELS.FLASH, clientApiKey } = req.body ?? {};
    const selectedModel = normalizeModel(model);
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
      model: selectedModel,
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
