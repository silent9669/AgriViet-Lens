import assert from 'node:assert/strict';
import { GeminiService, GEMINI_CONFIG, GEMINI_MODELS } from '../src/services/gemini-service.js';

console.log('Testing Gemini Multimodal Service Layer...');

const sampleBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
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

// 1. Test supported models and autonomous multimodal payload formatting.
assert.deepStrictEqual(GEMINI_MODELS, {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-1.5-pro'
});
assert.strictEqual(GEMINI_CONFIG.MODEL, GEMINI_MODELS.FLASH);

const payload = GeminiService.formatVisionPayload(sampleBase64, GEMINI_MODELS.PRO);
assert.ok(payload.contents && payload.contents.length > 0, 'Payload missing contents array');
assert.strictEqual(payload.generationConfig.responseMimeType, 'application/json');
assert.strictEqual(payload.generationConfig.response_mime_type, 'application/json');
assert.strictEqual(payload.generationConfig.responseSchema.type, 'OBJECT');
assert.strictEqual(payload.generationConfig.response_schema, payload.generationConfig.responseSchema);
assert.match(
  payload.systemInstruction?.parts?.[0]?.text,
  /tự nhận diện.*loài cây/i,
  'Payload must instruct Gemini to detect the crop species autonomously'
);
assert.doesNotMatch(
  payload.contents[0].parts.find(p => p.text)?.text || '',
  /Cây trồng mục tiêu: Lúa/i,
  'Payload must not require a manually selected crop'
);

const serializedConfig = JSON.parse(JSON.stringify(payload)).generationConfig;
assert.strictEqual(serializedConfig.responseSchema.type, 'OBJECT');
assert.strictEqual(serializedConfig.responseMimeType, 'application/json');

const parts = payload.contents[0].parts;
const imagePart = parts.find(p => p.inline_data);
const textPart = parts.find(p => p.text);
assert.ok(imagePart, 'Missing image inline_data in payload parts');
assert.strictEqual(imagePart.inline_data.mime_type, 'image/jpeg');
assert.ok(imagePart.inline_data.data.length > 0, 'Image data is empty');
assert.match(textPart.text, /tự nhận diện/i);

// 2. Test diagnosis parsing, including fenced JSON and quarantineDays.
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

// 3. Test direct Gemini diagnosis request and model selection.
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
try {
  let capturedUrl;
  let capturedOptions;
  delete globalThis.window;
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

  const liveResult = await GeminiService.diagnoseCropImage(sampleBase64, {
    model: GEMINI_MODELS.PRO,
    apiKey: 'test-api-key'
  });
  assert.strictEqual(capturedUrl, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=test-api-key');
  assert.strictEqual(capturedOptions.method, 'POST');
  assert.strictEqual(capturedOptions.headers['Content-Type'], 'application/json');
  const directPayload = JSON.parse(capturedOptions.body);
  assert.strictEqual(directPayload.generationConfig.responseSchema.type, 'OBJECT');
  assert.strictEqual(liveResult.isOfflineFallback, false);
  assert.strictEqual(liveResult.chemicalTreatment.quarantineDays, 14);

  // 4. Test the local backend proxy path, including model and image payload.
  globalThis.window = {};
  globalThis.fetch = async (url, options) => {
    assert.strictEqual(url, '/api/diagnose');
    const requestBody = JSON.parse(options.body);
    assert.strictEqual(requestBody.model, GEMINI_MODELS.PRO);
    assert.strictEqual(requestBody.imageBase64, sampleBase64);
    assert.strictEqual(requestBody.clientApiKey, 'proxy-key');
    return {
      ok: true,
      async json() {
        return { success: true, diagnosis: JSON.parse(mockGeminiJson) };
      }
    };
  };

  const proxiedResult = await GeminiService.diagnoseCropImage(sampleBase64, {
    model: GEMINI_MODELS.PRO,
    apiKey: 'proxy-key'
  });
  assert.strictEqual(proxiedResult.isOfflineFallback, false);
  assert.strictEqual(proxiedResult.cropName, 'Lúa Nước');

  // 5. Test API/quota errors fall back to a high-fidelity preset with error information.
  delete globalThis.window;
  globalThis.fetch = async () => ({
    ok: false,
    status: 429,
    async text() {
      return '{"error":{"message":"quota exceeded"}}';
    }
  });

  const fallback = await GeminiService.diagnoseCropImage(sampleBase64, {
    model: GEMINI_MODELS.FLASH,
    apiKey: 'quota-key',
    cropHint: 'durian'
  });
  assert.strictEqual(fallback.cropKey, 'durian');
  assert.strictEqual(fallback.isOfflineFallback, true);
  assert.ok(fallback.diseaseNameVi.includes('Xì Mủ'));
  assert.match(fallback.fallbackReason, /429/);
} finally {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}

// 6. Test chat proxy/direct model and context handling.
try {
  globalThis.window = {};
  globalThis.fetch = async (url, options) => {
    assert.strictEqual(url, '/api/chat');
    const requestBody = JSON.parse(options.body);
    assert.strictEqual(requestBody.model, GEMINI_MODELS.PRO);
    assert.deepStrictEqual(requestBody.context, { crop: 'Lúa Nước' });
    return {
      ok: true,
      async json() {
        return { success: true, answer: 'Hãy kiểm tra ruộng vào sáng sớm.' };
      }
    };
  };

  const proxiedAnswer = await GeminiService.askFarmingAssistant(
    'Lúa cần kiểm tra lúc nào?',
    { crop: 'Lúa Nước' },
    { model: GEMINI_MODELS.PRO, apiKey: 'proxy-key' }
  );
  assert.match(proxiedAnswer, /sáng sớm/);

  delete globalThis.window;
  let chatUrl;
  let chatBody;
  globalThis.fetch = async (url, options) => {
    chatUrl = url;
    chatBody = JSON.parse(options.body);
    return {
      ok: true,
      async json() {
        return { candidates: [{ content: { parts: [{ text: 'Tư vấn từ Gemini Pro.' }] } }] };
      }
    };
  };
  const directAnswer = await GeminiService.askFarmingAssistant(
    'Lúa cần kiểm tra lúc nào?',
    { crop: 'Lúa Nước' },
    { model: GEMINI_MODELS.PRO, apiKey: 'direct-key' }
  );
  assert.strictEqual(directAnswer, 'Tư vấn từ Gemini Pro.');
  assert.match(chatUrl, /gemini-1\.5-pro:generateContent/);
  assert.match(chatBody.contents[0].parts[0].text, /Lúa Nước/);
} finally {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}

// 7. Test diagnosis and assistant offline fallbacks.
const offlineDiagnosis = await GeminiService.diagnoseCropImage(sampleBase64, { cropHint: 'durian' });
assert.strictEqual(offlineDiagnosis.cropKey, 'durian');
assert.strictEqual(offlineDiagnosis.isOfflineFallback, true);

const answer = await GeminiService.askFarmingAssistant('Lúa bị đạo ôn thì làm sao?', {}, {});
assert.ok(answer, 'Answer should not be null');
assert.ok(typeof answer === 'string' && answer.length > 20, 'Answer should be meaningful text');

console.log('All Gemini Multimodal Service tests passed successfully!');
