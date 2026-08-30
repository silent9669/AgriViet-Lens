import assert from 'node:assert/strict';
import { MedicineService, MEDICINE_CATALOG } from '../src/services/medicine-service.js';

console.log('🧪 Running MedicineService & Shopee Generator Test Suite...\n');

// 1. Verify Catalog Integrity
console.log('1. Verifying MEDICINE_CATALOG structure and data integrity...');
assert.ok(Array.isArray(MEDICINE_CATALOG), 'MEDICINE_CATALOG should be an array');
assert.ok(MEDICINE_CATALOG.length >= 8 && MEDICINE_CATALOG.length <= 20, `Catalog has ${MEDICINE_CATALOG.length} items (expected 8-20)`);

const requiredFields = [
  'id', 'name', 'category', 'activeIngredient', 'targetDiseases',
  'priceMin', 'priceMax', 'unit', 'priceDisplay', 'dosageGuide',
  'quarantineDays', 'safetyNotes', 'shopeeKeyword'
];

const bioItems = MEDICINE_CATALOG.filter(m => m.category === 'bio');
const chemicalItems = MEDICINE_CATALOG.filter(m => m.category === 'chemical');

assert.ok(bioItems.length >= 3, `Expected at least 3 bio items, got ${bioItems.length}`);
assert.ok(chemicalItems.length >= 3, `Expected at least 3 chemical items, got ${chemicalItems.length}`);

MEDICINE_CATALOG.forEach(item => {
  requiredFields.forEach(field => {
    assert.ok(item[field] !== undefined && item[field] !== null, `Item ${item.id} missing field '${field}'`);
  });
  assert.ok(['bio', 'chemical'].includes(item.category), `Invalid category '${item.category}' in ${item.id}`);
  assert.ok(Array.isArray(item.targetDiseases) && item.targetDiseases.length > 0, `targetDiseases must be non-empty array in ${item.id}`);
  assert.strictEqual(typeof item.priceMin, 'number', `priceMin must be number in ${item.id}`);
  assert.strictEqual(typeof item.priceMax, 'number', `priceMax must be number in ${item.id}`);
  assert.ok(item.priceMin <= item.priceMax, `priceMin (${item.priceMin}) > priceMax (${item.priceMax}) in ${item.id}`);
  assert.strictEqual(typeof item.quarantineDays, 'number', `quarantineDays must be number in ${item.id}`);
  if (item.category === 'bio') {
    assert.strictEqual(item.quarantineDays, 0, `Bio medicine ${item.id} must have quarantineDays = 0`);
  } else {
    assert.ok(item.quarantineDays >= 7, `Chemical medicine ${item.id} must have quarantineDays >= 7`);
  }
  assert.ok(item.shopeeKeyword.length > 5, `shopeeKeyword too short in ${item.id}`);
});
console.log(`   ✅ Catalog contains ${MEDICINE_CATALOG.length} verified items (${bioItems.length} bio, ${chemicalItems.length} chemical).`);

// 2. Test MedicineService.getAllMedicines()
console.log('2. Testing MedicineService.getAllMedicines()...');
const allMeds = MedicineService.getAllMedicines();
assert.strictEqual(allMeds.length, MEDICINE_CATALOG.length);
assert.deepStrictEqual(allMeds, MEDICINE_CATALOG);
console.log('   ✅ getAllMedicines() returns entire catalog.');

// 3. Test MedicineService.searchMedicines()
console.log('3. Testing MedicineService.searchMedicines(query, category)...');
const searchAll = MedicineService.searchMedicines();
assert.strictEqual(searchAll.length, MEDICINE_CATALOG.length);

const onlyBio = MedicineService.searchMedicines('', 'bio');
assert.strictEqual(onlyBio.length, bioItems.length);
assert.ok(onlyBio.every(m => m.category === 'bio'));

const onlyChem = MedicineService.searchMedicines('', 'chemical');
assert.strictEqual(onlyChem.length, chemicalItems.length);
assert.ok(onlyChem.every(m => m.category === 'chemical'));

const searchTrichoderma = MedicineService.searchMedicines('Trichoderma');
assert.ok(searchTrichoderma.length >= 1);
assert.ok(searchTrichoderma.some(m => m.id === 'med_trichoderma'));

const searchActive = MedicineService.searchMedicines('Hexaconazole');
assert.ok(searchActive.length >= 1);
assert.ok(searchActive.some(m => m.id === 'med_hexaconazole'));

const searchDisease = MedicineService.searchMedicines('xì mủ');
assert.ok(searchDisease.length >= 2, 'Should match multiple medicines for xì mủ');

const searchWithCategory = MedicineService.searchMedicines('xì mủ', 'bio');
assert.ok(searchWithCategory.length >= 1);
assert.ok(searchWithCategory.every(m => m.category === 'bio'));

const searchNotFound = MedicineService.searchMedicines('randomNonExistentDrug12345');
assert.strictEqual(searchNotFound.length, 0);
console.log('   ✅ searchMedicines filters accurately across query and category dimensions.');

// 4. Test MedicineService.findMedicinesForDisease()
console.log('4. Testing MedicineService.findMedicinesForDisease(diseaseName)...');
const daoOnMeds = MedicineService.findMedicinesForDisease('Bệnh đạo ôn lá lúa');
assert.ok(daoOnMeds.length >= 2, 'Expected matches for đạo ôn');
assert.ok(daoOnMeds.some(m => m.id === 'med_tricyclazole'), 'Should include Beam / Tricyclazole');
assert.ok(daoOnMeds.some(m => m.id === 'med_trichoderma'), 'Should include Trichoderma');

const xiMuMeds = MedicineService.findMedicinesForDisease('Xì mủ nứt thân sầu riêng');
assert.ok(xiMuMeds.length >= 2, 'Expected matches for xì mủ');
assert.ok(xiMuMeds.some(m => m.id === 'med_fosetyl'), 'Should include Aliette');

const riSatMeds = MedicineService.findMedicinesForDisease('Bệnh rỉ sắt cà phê');
assert.ok(riSatMeds.length >= 1, 'Expected matches for rỉ sắt');
assert.ok(riSatMeds.some(m => m.id === 'med_hexaconazole'), 'Should include Anvil');

const emptyDisease = MedicineService.findMedicinesForDisease('');
assert.strictEqual(emptyDisease.length, 0);

const nullDisease = MedicineService.findMedicinesForDisease(null);
assert.strictEqual(nullDisease.length, 0);
console.log('   ✅ findMedicinesForDisease correctly matches disease pathology names.');

// 5. Test MedicineService.getShopeeSearchUrl()
console.log('5. Testing MedicineService.getShopeeSearchUrl(medicine)...');
const item = MEDICINE_CATALOG[0];
const shopeeUrl = MedicineService.getShopeeSearchUrl(item);
assert.ok(shopeeUrl.startsWith('https://shopee.vn/search?keyword='));
assert.ok(shopeeUrl.includes(encodeURIComponent(item.shopeeKeyword)));

const fallbackItem = { name: 'Thuốc Trừ Bệnh Demo' };
const fallbackUrl = MedicineService.getShopeeSearchUrl(fallbackItem);
assert.strictEqual(fallbackUrl, `https://shopee.vn/search?keyword=${encodeURIComponent('Thuốc Trừ Bệnh Demo')}`);

const stringUrl = MedicineService.getShopeeSearchUrl('Nấm trichoderma');
assert.strictEqual(stringUrl, `https://shopee.vn/search?keyword=${encodeURIComponent('Nấm trichoderma')}`);

const defaultUrl = MedicineService.getShopeeSearchUrl(null);
assert.ok(defaultUrl.startsWith('https://shopee.vn/search?keyword='));
console.log('   ✅ getShopeeSearchUrl builds valid Shopee search URLs.');

// 6. Test MedicineService.findMedicinesForDiagnosis()
console.log('6. Testing MedicineService.findMedicinesForDiagnosis(diagnosis)...');
const mockDiagnosis = {
  cropName: 'Lúa Nước',
  diseaseNameVi: 'Bệnh đạo ôn lá',
  chemicalTreatment: { activeIngredients: 'Tricyclazole 75% WP', dosageInstructions: '20g/bình', quarantineDays: 14, safetyNotes: 'Cách ly 14 ngày' },
  organicTreatment: { bioProducts: 'Chế phẩm Trichoderma', steps: ['Phun đợt 1'] }
};

const diagnosisMatches = MedicineService.findMedicinesForDiagnosis(mockDiagnosis);
assert.ok(diagnosisMatches.length >= 1);
assert.ok(diagnosisMatches[0].shopeeUrl.startsWith('https://shopee.vn/search?keyword='));

const emptyDiagnosis = MedicineService.findMedicinesForDiagnosis(null);
assert.deepStrictEqual(emptyDiagnosis, []);
console.log('   ✅ findMedicinesForDiagnosis integrates with diagnosis workflows.');

console.log('\n🎉 ALL MEDICINE SERVICE TESTS PASSED SUCCESSFULLY! 🎉\n');
