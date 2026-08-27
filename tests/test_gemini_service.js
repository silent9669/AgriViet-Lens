import assert from 'node:assert/strict';
import { GeminiService } from '../src/services/gemini-service.js';

console.log('Testing Gemini Multimodal Service Layer...');

// 1. Test formatVisionPayload
const sampleBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const payload = GeminiService.formatVisionPayload(sampleBase64, 'rice');

assert.ok(payload.contents && payload.contents.length > 0, 'Payload missing contents array');
assert.ok(payload.generationConfig && payload.generationConfig.response_mime_type === 'application/json', 'Payload missing JSON response config');

const parts = payload.contents[0].parts;
const imagePart = parts.find(p => p.inline_data);
const textPart = parts.find(p => p.text);

assert.ok(imagePart, 'Missing image inline_data in payload parts');
assert.strictEqual(imagePart.inline_data.mime_type, 'image/jpeg');
assert.ok(imagePart.inline_data.data.length > 0, 'Image data is empty');
assert.ok(textPart.text.includes('Lúa'), 'Prompt text should include crop context');

// 2. Test parseDiagnosisResponse
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

const parsed = GeminiService.parseDiagnosisResponse(mockGeminiJson);
assert.strictEqual(parsed.cropName, 'Lúa Nước');
assert.strictEqual(parsed.confidenceScore, 98);
assert.strictEqual(parsed.chemicalTreatment.quarantineDays, 14);

// 3. Test diagnoseCropImage with offline fallback (no API key provided)
async function testOfflineFallback() {
  const result = await GeminiService.diagnoseCropImage(sampleBase64, 'durian', null);
  assert.ok(result, 'Result should not be null');
  assert.strictEqual(result.cropKey, 'durian');
  assert.ok(result.isOfflineFallback, 'Should be flagged as offline fallback');
  assert.ok(result.diseaseNameVi.includes('Xì Mủ'), 'Should match durian disease');
}

// 4. Test askFarmingAssistant offline fallback
async function testAssistantOffline() {
  const answer = await GeminiService.askFarmingAssistant('Lúa bị đạo ôn thì làm sao?', {}, null);
  assert.ok(answer, 'Answer should not be null');
  assert.ok(typeof answer === 'string' && answer.length > 20, 'Answer should be meaningful text');
}

await testOfflineFallback();
await testAssistantOffline();

console.log('✅ All Gemini Multimodal Service tests passed successfully!');
