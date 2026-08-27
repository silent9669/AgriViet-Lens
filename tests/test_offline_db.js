import assert from 'node:assert/strict';
import { OFFLINE_DISEASES, getOfflineDiagnosis, SAMPLE_PRESETS } from '../src/data/offline-diseases.js';

console.log('Testing Offline Disease Knowledge Base...');

// 1. Verify all 4 primary crops exist in dictionary
const requiredCrops = ['rice', 'durian', 'coffee', 'dragonfruit'];
for (const crop of requiredCrops) {
  assert.ok(OFFLINE_DISEASES[crop], `Missing offline profile for crop: ${crop}`);
  const profile = OFFLINE_DISEASES[crop];

  // Verify required schema fields
  assert.ok(profile.cropName, `cropName missing for ${crop}`);
  assert.ok(profile.diseaseNameVi, `diseaseNameVi missing for ${crop}`);
  assert.ok(profile.diseaseNameScientific, `diseaseNameScientific missing for ${crop}`);
  assert.ok(typeof profile.confidenceScore === 'number' && profile.confidenceScore > 0, `confidenceScore invalid for ${crop}`);
  assert.ok(['Nhẹ', 'Trung bình', 'Nghiêm trọng'].includes(profile.severityLevel), `severityLevel invalid for ${crop}`);
  assert.ok(profile.symptomsSummary, `symptomsSummary missing for ${crop}`);
  assert.ok(profile.primaryCauses, `primaryCauses missing for ${crop}`);

  // Verify organic & chemical treatment schema
  assert.ok(profile.organicTreatment?.steps?.length > 0, `organicTreatment.steps empty for ${crop}`);
  assert.ok(profile.organicTreatment?.bioProducts, `organicTreatment.bioProducts missing for ${crop}`);

  assert.ok(profile.chemicalTreatment?.activeIngredients, `chemicalTreatment.activeIngredients missing for ${crop}`);
  assert.ok(profile.chemicalTreatment?.dosageInstructions, `chemicalTreatment.dosageInstructions missing for ${crop}`);
  assert.ok(typeof profile.chemicalTreatment?.quarantineDays === 'number', `chemicalTreatment.quarantineDays invalid for ${crop}`);

  // Verify seasonal prevention
  assert.ok(profile.seasonalPrevention?.length > 0, `seasonalPrevention empty for ${crop}`);
}

// 2. Test getOfflineDiagnosis helper
const riceDiag = getOfflineDiagnosis('rice');
assert.strictEqual(riceDiag.cropName, 'Lúa Nước');
assert.ok(riceDiag.diseaseNameVi.toLowerCase().includes('đạo ôn'));

const fallbackDiag = getOfflineDiagnosis('unknown_crop', 'lá bị rỉ sắt');
assert.strictEqual(fallbackDiag.cropName, 'Cà Phê Robusta');

// 3. Test sample presets
assert.ok(SAMPLE_PRESETS.length === 4, 'SAMPLE_PRESETS should have 4 pre-configured cases');
for (const preset of SAMPLE_PRESETS) {
  assert.ok(preset.id && preset.name && preset.cropKey && preset.sampleImageBase64, 'Invalid preset definition');
}

console.log('✅ All Offline Disease Knowledge Base tests passed successfully!');
