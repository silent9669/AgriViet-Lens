import assert from 'node:assert/strict';
import { GeminiService, GEMINI_CONFIG } from '../src/services/gemini-service.js';

console.log('Testing Gemini Multimodal Service Layer...');

const sampleBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 1. Test model configuration and multimodal payload formatting
assert.strictEqual(GEMINI_CONFIG.MODEL, 'gemini-2.0-flash');
const payload = GeminiService.formatVisionPayload(sampleBase64, 'rice');

assert.ok(payload.contents && payload.contents.length > 0, 'Payload missing contents array');
assert.deepStrictEqual(payload.generationConfig, {
  response_mime_type: 'application/json',
  temperature: 0.15,
  topP: 0.95
});
assert.ok(payload.systemInstruction?.parts?.[0]?.text.includes('Chuyên Gia Nông Nghiệp'), 'Payload missing agronomist system instruction');

const parts = payload.contents[0].parts;
const imagePart = parts.find(p => p.inline_data);
const textPart = parts.find(p => p.text);

assert.ok(imagePart, 'Missing image inline_data in payload parts');
assert.strictEqual(imagePart.inline_data.mime_type, 'image/jpeg');
assert.ok(imagePart.inline_data.data.length > 0, 'Image data is empty');
assert.ok(textPart.text.includes('Lúa'), 'Prompt text should include crop context');

// 2. Test diagnosis parsing, including fenced JSON and quarantineDays
const mockGeminiJson = JSON.stringify({
  cropName: 'Lúa Nước',
  diseaseNameVi: 'Bệnh Đạo Ôn Lá',
  diseaseNameScientific: 'Pyricularia oryzae',
  confidenceScore: 98,
  severityLevel: 'Nghiêm trọng',
  symptomsSummary: 'Cháy lá hình thoi',
  primaryCauses: 'Nấm đạo ôn',
  organicTreatment: {
    title: 'Phác đồ Hữu cơ',
    steps: ['Tưới Trichoderma', 'Ngưng bón đạm'],
    bioProducts: 'Trichoderma'
  },
  chemicalTreatment: {
    title: 'Phác đồ Hóa học',
    activeIngredients: 'Tricyclazole',
    dosageInstructions: 'Pha 25g/25L',
    quarantineDays: 14,
    safetyNotes: 'Bảo hộ lao động'
  },
  seasonalPrevention: ['Sạ thưa', 'Bón phân cân đối']
});

const parsed = GeminiService.parseDiagnosisResponse(`Kết quả phân tích:\n\`\`\`json\n${mockGeminiJson}\n\`\`\``);
assert.strictEqual(parsed.cropName, 'Lúa Nước');
assert.strictEqual(parsed.confidenceScore, 98);
assert.strictEqual(parsed.chemicalTreatment.quarantineDays, 14);

const partial = GeminiService.parseDiagnosisResponse('{"cropName":"Sầu Riêng","chemicalTreatment":{}}');
for (const field of [
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
]) {
  assert.ok(Object.hasOwn(partial, field), `Missing normalized field: ${field}`);
}
assert.strictEqual(partial.chemicalTreatment.quarantineDays, 14, 'Missing quarantineDays fallback');

// 3. Test direct Gemini diagnosis request and response parsing
const originalFetch = globalThis.fetch;
try {
  let capturedUrl;
  let capturedOptions;
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return {
      ok: true,
      async json() {
        return { candidates: [{ content: { parts: [{ text: mockGeminiJson }] } }] };
      }
    };
  };

  const liveResult = await GeminiService.diagnoseCropImage(sampleBase64, 'rice', 'test-api-key');
  assert.strictEqual(capturedUrl, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-api-key');
  assert.strictEqual(capturedOptions.method, 'POST');
  assert.strictEqual(capturedOptions.headers['Content-Type'], 'application/json');
  assert.strictEqual(JSON.parse(capturedOptions.body).generationConfig.temperature, 0.15);
  assert.strictEqual(liveResult.isOfflineFallback, false);
  assert.strictEqual(liveResult.chemicalTreatment.quarantineDays, 14);

  // 4. Test API/quota errors fall back to a high-fidelity preset with error information
  globalThis.fetch = async () => ({
    ok: false,
    status: 429,
    async text() {
      return '{"error":{"message":"quota exceeded"}}';
    }
  });

  const fallback = await GeminiService.diagnoseCropImage(sampleBase64, 'durian', 'quota-key');
  assert.strictEqual(fallback.cropKey, 'durian');
  assert.strictEqual(fallback.isOfflineFallback, true);
  assert.ok(fallback.diseaseNameVi.includes('Xì Mủ'));
  assert.match(fallback.fallbackReason, /429/);
} finally {
  globalThis.fetch = originalFetch;
}

// 5. Test diagnosis with no API key and assistant offline fallback
const offlineDiagnosis = await GeminiService.diagnoseCropImage(sampleBase64, 'durian', null);
assert.strictEqual(offlineDiagnosis.cropKey, 'durian');
assert.strictEqual(offlineDiagnosis.isOfflineFallback, true);

const answer = await GeminiService.askFarmingAssistant('Lúa bị đạo ôn thì làm sao?', {}, null);
assert.ok(answer, 'Answer should not be null');
assert.ok(typeof answer === 'string' && answer.length > 20, 'Answer should be meaningful text');

console.log('All Gemini Multimodal Service tests passed successfully!');
