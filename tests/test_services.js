import assert from 'node:assert/strict';
import { WeatherRadarService } from '../src/services/weather-radar.js';
import { LogbookService } from '../src/services/logbook-service.js';
import { ICONS, renderIcon } from '../src/utils/icons.js';
import { SAMPLE_PRESETS, getPresetDiagnosis } from '../src/data/sample-presets.js';

console.log('Testing Weather Radar & Farm Logbook Service Layers...');

// 1. Test WeatherRadarService risk computation
const highRisk = WeatherRadarService.calculateFungalRisk(26, 88, 12);
assert.strictEqual(highRisk.level, 'Nguy cơ Cao');
assert.ok(highRisk.score >= 75);
assert.ok(highRisk.warningText.includes('nấm'));

const lowRisk = WeatherRadarService.calculateFungalRisk(36, 45, 0);
assert.strictEqual(lowRisk.level, 'Nguy cơ Thấp');
assert.ok(lowRisk.score < 40);

// 2. Test mock WeatherRadarService.getAgriculturalRisk
const riskReport = await WeatherRadarService.getAgriculturalRisk(10.0452, 105.7469); // Can Tho coords
assert.ok(riskReport.locationName, 'Location name missing');
assert.ok(riskReport.temperature !== undefined, 'Temperature missing');
assert.ok(riskReport.humidity !== undefined, 'Humidity missing');
assert.ok(riskReport.riskEvaluation, 'Risk evaluation missing');
assert.ok(Array.isArray(riskReport.forecast3Days), '3-day forecast should be an array');

// 3. Test LogbookService with mock in-memory storage
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
  location: 'Ruộng Lô 3 - Cần Thơ',
  notes: 'Đã phun Trichoderma đợt 1'
};

const saved = LogbookService.addLog(sampleEntry);
assert.ok(saved.id, 'Log ID should be generated');
assert.strictEqual(saved.status, 'Đang theo dõi');
assert.ok(saved.createdAt, 'Timestamp should be attached');

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

// 4. Test SVG icon and high-fidelity sample preset contracts
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
