import assert from 'node:assert/strict';
import { WeatherRadarService, VIETNAM_REGIONS } from '../src/services/weather-radar.js';
import { LogbookService } from '../src/services/logbook-service.js';
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

console.log('✅ All Weather Radar, Logbook, SVG Icon, and Sample Preset tests passed successfully!');
