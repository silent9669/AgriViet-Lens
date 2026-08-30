import assert from 'node:assert/strict';
import { WeatherRadarService, VIETNAM_REGIONS } from '../src/services/weather-radar.js';
import { LogbookService } from '../src/services/logbook-service.js';
import { GardenService, PLANT_TEMPLATES } from '../src/services/garden-service.js';
import { MedicineService, MEDICINE_CATALOG } from '../src/services/medicine-service.js';
import { OFFLINE_DISEASES, getOfflineDiagnosis } from '../src/data/offline-diseases.js';
import { ICONS, renderIcon } from '../src/utils/icons.js';
import { SAMPLE_PRESETS, getPresetDiagnosis } from '../src/data/sample-presets.js';

console.log('Testing Weather Radar & Farm Logbook Service Layers...');

// 1. Test regional configuration and fungal risk computation
assert.strictEqual(VIETNAM_REGIONS.length, 4);
assert.deepStrictEqual(VIETNAM_REGIONS.map(region => region.name), [
  'Đồng Bằng Sông Cửu Long (Cần Thơ)',
  'Tây Nguyên (Đắk Lắk - Buôn Ma Thuột)',
  'Đông Nam Bộ (Đồng Nai / Tiền Giang)',
  'Đồng Bằng Sông Hồng (Hà Nội / Nam Định)'
]);

// 2. Test regional weather fetch and offline fallback
assert.strictEqual(typeof WeatherRadarService.fetchRegionalWeather, 'function');
const originalFetch = globalThis.fetch;
try {
  let requestedUrl = '';
  globalThis.fetch = async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      async json() {
        return {
          current: {
            temperature_2m: 26.4,
            relative_humidity_2m: 88,
            precipitation: 4
          },
          hourly: {
            temperature_2m: [26.4],
            relative_humidity_2m: [88],
            precipitation_probability: [70]
          },
          daily: {
            time: ['2026-08-30'],
            temperature_2m_max: [31.8],
            temperature_2m_min: [24.2],
            precipitation_probability_max: [70]
          }
        };
      }
    };
  };

  const regionalWeather = await WeatherRadarService.fetchRegionalWeather(1);
  assert.ok(requestedUrl.includes('api.open-meteo.com/v1/forecast'));
  assert.ok(requestedUrl.includes('latitude=12.6667'));
  assert.strictEqual(regionalWeather.regionName, VIETNAM_REGIONS[1].name);
  assert.strictEqual(regionalWeather.temp, 26.4);
  assert.strictEqual(regionalWeather.humidity, 88);
  assert.strictEqual(regionalWeather.rain, 4);
  assert.strictEqual(regionalWeather.risk.level, 'Nguy cơ Cao');
  assert.ok(regionalWeather.hourly);

  globalThis.fetch = async () => {
    throw new Error('offline');
  };
  const fallbackWeather = await WeatherRadarService.fetchRegionalWeather(3);
  assert.strictEqual(fallbackWeather.regionName, VIETNAM_REGIONS[3].name);
  assert.ok(fallbackWeather.risk);
  assert.strictEqual(fallbackWeather.hourly, null);
} finally {
  globalThis.fetch = originalFetch;
}

// 3. Test WeatherRadarService risk computation
const highRisk = WeatherRadarService.calculateFungalRisk(26, 88, 12);
assert.strictEqual(highRisk.level, 'Nguy cơ Cao');
assert.ok(highRisk.score >= 75);
assert.ok(highRisk.warningText.includes('nấm'));

const lowRisk = WeatherRadarService.calculateFungalRisk(36, 45, 0);
assert.strictEqual(lowRisk.level, 'Nguy cơ Thấp');
assert.ok(lowRisk.score < 40);

const mediumRisk = WeatherRadarService.calculateFungalRisk(22, 65, 0);
assert.strictEqual(mediumRisk.level, 'Nguy cơ Trung bình');
assert.strictEqual(mediumRisk.score, 60);
assert.ok(mediumRisk.badgeClass.includes('amber'));

// 4. Test mock WeatherRadarService.getAgriculturalRisk
const riskReport = await WeatherRadarService.getAgriculturalRisk(10.0452, 105.7469); // Can Tho coords
assert.ok(riskReport.locationName, 'Location name missing');
assert.ok(riskReport.temperature !== undefined, 'Temperature missing');
assert.ok(riskReport.humidity !== undefined, 'Humidity missing');
assert.ok(riskReport.riskEvaluation, 'Risk evaluation missing');
assert.ok(Array.isArray(riskReport.forecast3Days), '3-day forecast should be an array');

// 5. Test LogbookService with mock in-memory storage
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockStorage();

const initialLogs = LogbookService.getLogs();
assert.strictEqual(initialLogs.length, 0);

const sampleEntry = {
  cropName: 'Lúa Nước',
  diseaseNameVi: 'Bệnh Đạo Ôn Lá',
  severityLevel: 'Nghiêm trọng',
  confidenceScore: 87,
  chemicalTreatment: { quarantineDays: 14 },
  location: 'Ruộng Lô 3 - Cần Thơ',
  notes: 'Đã phun Trichoderma đợt 1'
};

const saved = LogbookService.addLog(sampleEntry);
assert.ok(saved.id, 'Log ID should be generated');
assert.strictEqual(saved.status, 'Đang theo dõi');
assert.ok(saved.createdAt, 'Timestamp should be attached');
assert.strictEqual(saved.cropName, 'Lúa Nước');
assert.strictEqual(saved.diseaseNameVi, 'Bệnh Đạo Ôn Lá');
assert.strictEqual(saved.severityLevel, 'Nghiêm trọng');
assert.strictEqual(saved.confidenceScore, 87);
assert.strictEqual(saved.quarantineDays, 14);
assert.ok(globalThis.localStorage.getItem('agriviet_farm_logbook_v2'), 'Logs should use v2 storage key');

const allLogs = LogbookService.getLogs();
assert.strictEqual(allLogs.length, 1);
assert.strictEqual(allLogs[0].diseaseNameVi, 'Bệnh Đạo Ôn Lá');

// Test status update
const updated = LogbookService.updateStatus(saved.id, 'Đã xử lý');
assert.strictEqual(updated.status, 'Đã xử lý');
assert.strictEqual(LogbookService.getLogs()[0].status, 'Đã xử lý');

// Test CSV Export
const csv = LogbookService.exportToCSV();
assert.ok(csv.includes('Mã'), 'CSV header missing');
assert.ok(csv.includes('Bệnh Đạo Ôn Lá'), 'CSV body missing diagnosis');

// Test delete
const deleted = LogbookService.deleteLog(saved.id);
assert.strictEqual(deleted, true);
assert.strictEqual(LogbookService.getLogs().length, 0);

// 6. Test SVG icon and high-fidelity sample preset contracts
const iconNames = ['leaf', 'lens', 'camera', 'upload', 'beaker', 'mic', 'volume', 'cloudRain', 'book', 'download', 'key', 'sun', 'moon', 'check', 'alert', 'refresh', 'shield'];
assert.strictEqual(Object.keys(ICONS).length, iconNames.length);
iconNames.forEach(name => assert.ok(ICONS[name], `Missing icon: ${name}`));

const iconMarkup = renderIcon('leaf', { className: 'h-6 w-6 text-emerald-600', strokeWidth: 1.75 });
assert.ok(iconMarkup.startsWith('<svg'));
assert.ok(iconMarkup.includes('h-6 w-6 text-emerald-600'));
assert.ok(iconMarkup.includes('stroke-width="1.75"'));
assert.ok(iconMarkup.includes(ICONS.leaf));

assert.strictEqual(SAMPLE_PRESETS.length, 4);
assert.deepStrictEqual(SAMPLE_PRESETS.map(preset => preset.cropKey), ['rice', 'durian', 'coffee', 'dragonfruit']);
const riceDiagnosis = getPresetDiagnosis('rice');
assert.strictEqual(riceDiagnosis.cropName, 'Lúa Nước');
assert.strictEqual(riceDiagnosis.diseaseNameScientific, 'Pyricularia oryzae');
assert.ok(riceDiagnosis.sampleImageBase64.startsWith('data:image/svg+xml;base64,'));
assert.ok(riceDiagnosis.organicTreatment.steps.length > 0);
assert.ok(riceDiagnosis.chemicalTreatment.activeIngredients);
assert.ok(riceDiagnosis.seasonalPrevention.length > 0);
assert.strictEqual(getPresetDiagnosis('missing-crop'), undefined);

// 7. Cross-service integration: MedicineService matching against OFFLINE_DISEASES catalog
console.log('Testing MedicineService & OFFLINE_DISEASES cross-service matching...');
assert.ok(MEDICINE_CATALOG.length >= 8, 'Medicine catalog should contain registered treatments');
assert.ok(PLANT_TEMPLATES.length >= 4, 'Plant templates should cover core Vietnamese crops');
const requiredCrops = ['rice', 'durian', 'coffee', 'dragonfruit'];

for (const cropKey of requiredCrops) {
  const profile = OFFLINE_DISEASES[cropKey];
  assert.ok(profile, `Missing offline disease profile for ${cropKey}`);

  // Test disease name matching
  const matchingByDisease = MedicineService.findMedicinesForDisease(profile.diseaseNameVi);
  assert.ok(matchingByDisease.length >= 1, `MedicineService should find products for ${profile.diseaseNameVi}`);

  // Test full diagnosis payload matching
  const matchingByDiagnosis = MedicineService.findMedicinesForDiagnosis(profile);
  assert.ok(matchingByDiagnosis.length >= 1, `MedicineService should find recommendations for ${cropKey} diagnosis`);

  matchingByDiagnosis.forEach(med => {
    assert.ok(med.id, 'Matching medicine missing id');
    assert.ok(med.name, 'Matching medicine missing name');
    assert.ok(['bio', 'chemical'].includes(med.category), `Invalid category: ${med.category}`);
    assert.ok(med.shopeeUrl.startsWith('https://shopee.vn/search?keyword='), `Invalid Shopee URL: ${med.shopeeUrl}`);
    assert.ok(med.shopeeUrl.includes(encodeURIComponent(med.shopeeKeyword)), 'Shopee URL should contain encoded keyword');
  });
}

// 8. Cross-service integration: GardenService reacting to WeatherRadarService & Disease Linking
console.log('Testing GardenService responding to WeatherRadarService and pathology linking...');

// Reset garden to clean state
GardenService.resetGarden();
const initialGardenPlots = GardenService.getPlots();
assert.strictEqual(initialGardenPlots.length, 2);

// Apply wet weather from regional radar
const wetWeather = {
  temp: 26.5,
  humidity: 89,
  rainProb: 75,
  condition: 'Mưa rào rải rác'
};
GardenService.applyWeatherEffect(wetWeather);
let plotsAfterWet = GardenService.getPlots();
assert.ok(plotsAfterWet.every(p => p.moisture >= 70), 'Plot moisture should be elevated during wet weather');
assert.ok(plotsAfterWet.some(p => p.weatherWarnings.some(w => w.type === 'high_humidity_fungus_risk')), 'Fungal risk warning should be triggered');

// Link offline pathology to a garden plot
const durianDisease = getOfflineDiagnosis('durian');
const durianPlot = GardenService.getPlots().find(p => p.plantKey === 'durian');
assert.ok(durianPlot, 'Durian plot should exist in starter garden');

const healthBeforeDisease = durianPlot.healthScore;
GardenService.logDisease(durianPlot.id, {
  diseaseName: durianDisease.diseaseNameVi,
  severity: durianDisease.severityLevel,
  treatment: durianDisease.organicTreatment.bioProducts,
  notes: durianDisease.symptomsSummary
});

const infectedPlot = GardenService.getPlotById(durianPlot.id);
assert.ok(infectedPlot.healthScore < healthBeforeDisease, 'Health score should decrease after disease infection');
assert.strictEqual(infectedPlot.activeDiseases.length, 1);
assert.strictEqual(infectedPlot.activeDiseases[0].diseaseName, durianDisease.diseaseNameVi);

// Perform treatment care action
const treatedPlot = GardenService.performCare(durianPlot.id, 'treat', 'Phun chế phẩm sinh học trị xì mủ');
assert.strictEqual(treatedPlot.activeDiseases.length, 0, 'Active diseases should be cleared after treatment');
assert.ok(treatedPlot.healthScore > infectedPlot.healthScore, 'Health score should recover after treatment');
assert.strictEqual(treatedPlot.careHistory[0].action, 'treat');

console.log('✅ All Weather Radar, Logbook, SVG Icon, Sample Preset, and Cross-Service tests passed successfully!');
