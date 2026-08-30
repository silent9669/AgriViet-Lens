import assert from 'node:assert/strict';

// Setup Mock LocalStorage for Node test runtime
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

// Import after localStorage mock is installed
const { GardenService, PLANT_TEMPLATES } = await import('../src/services/garden-service.js');

console.log('🌱 Running Virtual Garden Simulation Engine Test Suite...\n');

// 1. Verify PLANT_TEMPLATES Catalog
console.log('1. Verifying PLANT_TEMPLATES catalog...');
assert.ok(Array.isArray(PLANT_TEMPLATES), 'PLANT_TEMPLATES must be an array');
assert.strictEqual(PLANT_TEMPLATES.length, 5, 'PLANT_TEMPLATES must contain 5 primary crop templates');

const expectedKeys = ['rice', 'durian', 'coffee', 'dragonfruit', 'vegetable'];
const actualKeys = PLANT_TEMPLATES.map(p => p.key);
assert.deepStrictEqual(actualKeys, expectedKeys, 'Templates must include rice, durian, coffee, dragonfruit, vegetable');

PLANT_TEMPLATES.forEach(template => {
  assert.ok(template.key, 'Template missing key');
  assert.ok(template.name, `Template ${template.key} missing name`);
  assert.ok(template.category, `Template ${template.key} missing category`);
  assert.ok(typeof template.growthCycleDays === 'number' && template.growthCycleDays > 0, `Template ${template.key} invalid growthCycleDays`);
  assert.ok(template.waterNeed, `Template ${template.key} missing waterNeed`);
  assert.ok(template.idealTemp, `Template ${template.key} missing idealTemp`);
  assert.ok(template.idealHumidity, `Template ${template.key} missing idealHumidity`);
});
console.log('   ✅ All 5 crop templates validated successfully.');

// 2. Test GardenService.getPlots() & Pre-seeded Starter Plots
console.log('2. Testing getPlots() auto-initialization with starter plots...');
localStorage.clear();
const initialPlots = GardenService.getPlots();
assert.strictEqual(initialPlots.length, 2, 'Should initialize with 2 starter plots on empty storage');
assert.strictEqual(initialPlots[0].plantKey, 'rice');
assert.strictEqual(initialPlots[0].growthStage, 'vegetative');
assert.strictEqual(initialPlots[1].plantKey, 'durian');
assert.strictEqual(initialPlots[1].growthStage, 'flowering');
console.log('   ✅ Starter plots initialized (Lúa ST25 & Sầu Riêng Ri6).');

// 3. Test GardenService.addPlot()
console.log('3. Testing addPlot(templateKey, customName, notes)...');
const newCoffeePlot = GardenService.addPlot('coffee', 'Vườn Cà Phê Gia Lai Lô 3', 'Khu vực đất đỏ bazan');
assert.ok(newCoffeePlot.id.startsWith('plot_'), 'Plot ID should start with plot_');
assert.strictEqual(newCoffeePlot.plantKey, 'coffee');
assert.strictEqual(newCoffeePlot.name, 'Vườn Cà Phê Gia Lai Lô 3');
assert.strictEqual(newCoffeePlot.notes, 'Khu vực đất đỏ bazan');
assert.strictEqual(newCoffeePlot.growthStage, 'seedling');
assert.strictEqual(newCoffeePlot.growthProgress, 0);
assert.strictEqual(newCoffeePlot.healthScore, 100);
assert.strictEqual(newCoffeePlot.moisture, 70);
assert.deepStrictEqual(newCoffeePlot.activeDiseases, []);
assert.deepStrictEqual(newCoffeePlot.careHistory, []);

const currentPlots = GardenService.getPlots();
assert.strictEqual(currentPlots.length, 3, 'Total plots should now be 3');
console.log('   ✅ New plot created with seedling stage and zero progress.');

// 4. Test GardenService.getPlotById()
console.log('4. Testing getPlotById()...');
const fetchedPlot = GardenService.getPlotById(newCoffeePlot.id);
assert.ok(fetchedPlot, 'Should find existing plot by ID');
assert.strictEqual(fetchedPlot.name, 'Vườn Cà Phê Gia Lai Lô 3');
assert.strictEqual(GardenService.getPlotById('non_existent_id'), null, 'Should return null for missing plot');
console.log('   ✅ getPlotById() returns correct plot or null.');

// 5. Test Care Action: 'water'
console.log('5. Testing performCare(plotId, "water")...');
const plotToWater = GardenService.getPlotById(newCoffeePlot.id);
plotToWater.moisture = 40;
plotToWater.healthScore = 80;
GardenService.savePlots(GardenService.getPlots().map(p => p.id === plotToWater.id ? plotToWater : p));

const wateredPlot = GardenService.performCare(newCoffeePlot.id, 'water', 'Tưới đẫm rãnh');
assert.strictEqual(wateredPlot.moisture, 75, 'Moisture should increase by 35 (40 + 35 = 75)');
assert.strictEqual(wateredPlot.healthScore, 85, 'Health score should increase by 5 (80 + 5 = 85)');
assert.ok(wateredPlot.careHistory.length > 0, 'Care history should record watering');
assert.strictEqual(wateredPlot.careHistory[0].action, 'water');
assert.strictEqual(wateredPlot.careHistory[0].notes, 'Tưới đẫm rãnh');
console.log('   ✅ Water care action correctly updates moisture, health and logs history.');

// 6. Test Care Action: 'fertilize' & Growth Stage Transitions
console.log('6. Testing performCare(plotId, "fertilize") & Growth Stage Progression...');
// Cycle from 0% -> 20% (seedling) -> 40% (vegetative) -> 60% (flowering) -> 80% (flowering) -> 100% (harvest)
const dragonPlot = GardenService.addPlot('dragonfruit', 'Thanh Long Hàm Thuận');
assert.strictEqual(dragonPlot.growthProgress, 0);
assert.strictEqual(dragonPlot.growthStage, 'seedling');

// Fertilize 1: 0 + 20 = 20% -> seedling
GardenService.performCare(dragonPlot.id, 'fertilize');
let checkPlot = GardenService.getPlotById(dragonPlot.id);
assert.strictEqual(checkPlot.growthProgress, 20);
assert.strictEqual(checkPlot.growthStage, 'seedling');

// Fertilize 2: 20 + 20 = 40% -> vegetative
GardenService.performCare(dragonPlot.id, 'fertilize');
checkPlot = GardenService.getPlotById(dragonPlot.id);
assert.strictEqual(checkPlot.growthProgress, 40);
assert.strictEqual(checkPlot.growthStage, 'vegetative');

// Fertilize 3: 40 + 20 = 60% -> flowering
GardenService.performCare(dragonPlot.id, 'fertilize');
checkPlot = GardenService.getPlotById(dragonPlot.id);
assert.strictEqual(checkPlot.growthProgress, 60);
assert.strictEqual(checkPlot.growthStage, 'flowering');

// Fertilize 4: 60 + 20 = 80% -> flowering (51-80%)
GardenService.performCare(dragonPlot.id, 'fertilize');
checkPlot = GardenService.getPlotById(dragonPlot.id);
assert.strictEqual(checkPlot.growthProgress, 80);
assert.strictEqual(checkPlot.growthStage, 'flowering');

// Fertilize 5: 80 + 20 = 100% -> harvest ready
GardenService.performCare(dragonPlot.id, 'fertilize');
checkPlot = GardenService.getPlotById(dragonPlot.id);
assert.strictEqual(checkPlot.growthProgress, 100);
assert.strictEqual(checkPlot.growthStage, 'harvest');
assert.strictEqual(checkPlot.careHistory.length, 5);
console.log('   ✅ Growth stages transition accurately across seedling -> vegetative -> flowering -> harvest.');

// 7. Test Disease Logging & Treatment
console.log('7. Testing logDisease() & performCare(plotId, "treat")...');
const vegPlot = GardenService.addPlot('vegetable', 'Luống Cải Xanh VietGAP');
assert.strictEqual(vegPlot.healthScore, 100);

// Log medium severity disease (-20 health)
GardenService.logDisease(vegPlot.id, {
  diseaseName: 'Bệnh bọ nhảy hại cải',
  severity: 'medium',
  treatment: 'Phun dịch chiết tỏi ớt bio'
});

let diseasedPlot = GardenService.getPlotById(vegPlot.id);
assert.strictEqual(diseasedPlot.healthScore, 80, 'Health should decrease by 20 for medium disease');
assert.strictEqual(diseasedPlot.activeDiseases.length, 1);
assert.strictEqual(diseasedPlot.activeDiseases[0].diseaseName, 'Bệnh bọ nhảy hại cải');

// Log high severity disease (-40 health)
GardenService.logDisease(vegPlot.id, {
  diseaseName: 'Bệnh thối nhũn vi khuẩn',
  severity: 'high',
  treatment: 'Cách ly và xử lý vôi bột'
});

diseasedPlot = GardenService.getPlotById(vegPlot.id);
assert.strictEqual(diseasedPlot.healthScore, 40, 'Health should decrease by 40 for high severity disease');
assert.strictEqual(diseasedPlot.activeDiseases.length, 2);

// Treat diseases: clears activeDiseases, restores +25 health
GardenService.performCare(vegPlot.id, 'treat', 'Phun chế phẩm sinh học trị thối nhũn');
const curedPlot = GardenService.getPlotById(vegPlot.id);
assert.strictEqual(curedPlot.activeDiseases.length, 0, 'Active diseases should be empty after treatment');
assert.strictEqual(curedPlot.healthScore, 65, 'Health restored by +25 (40 + 25 = 65)');
assert.strictEqual(curedPlot.careHistory[0].action, 'treat');
console.log('   ✅ Disease diagnosis and organic treatment cycle verified.');

// 8. Test Harvest Mechanics
console.log('8. Testing performCare(plotId, "harvest")...');
// Plot with progress < 90 cannot be harvested
const unreadyPlot = GardenService.addPlot('rice', 'Ruộng chưa chín');
unreadyPlot.growthProgress = 60;
GardenService.savePlots(GardenService.getPlots().map(p => p.id === unreadyPlot.id ? unreadyPlot : p));

const failedHarvest = GardenService.performCare(unreadyPlot.id, 'harvest');
assert.strictEqual(failedHarvest.success, false, 'Harvest should fail when progress < 90%');

// Ready plot (checkPlot has progress = 100)
const readyPlotId = dragonPlot.id;
const harvestResult = GardenService.performCare(readyPlotId, 'harvest', 'Thu hoạch lứa đầu đạt 250kg');
assert.ok(harvestResult, 'Harvest should succeed');
assert.strictEqual(harvestResult.harvestCount, 1, 'Harvest count incremented');
assert.strictEqual(harvestResult.growthProgress, 0, 'Progress reset to 0 for next crop cycle');
assert.strictEqual(harvestResult.growthStage, 'seedling', 'Reset to seedling stage');
assert.strictEqual(harvestResult.careHistory[0].action, 'harvest');
console.log('   ✅ Harvest mechanism validates readiness threshold and resets crop cycle.');

// 9. Test Environmental Weather Effects
console.log('9. Testing applyWeatherEffect(weatherData)...');
const plotBeforeWeather = GardenService.getPlotById(newCoffeePlot.id);
plotBeforeWeather.moisture = 60;
GardenService.savePlots(GardenService.getPlots().map(p => p.id === plotBeforeWeather.id ? plotBeforeWeather : p));

// Apply extreme heat (temp = 37°C > 34°C)
GardenService.applyWeatherEffect({
  temp: 37,
  humidity: 50,
  rainProb: 0,
  condition: 'Nắng gắt gay gắt'
});

let plotAfterHeat = GardenService.getPlotById(newCoffeePlot.id);
assert.ok(plotAfterHeat.moisture <= 45, `Moisture should drop under extreme heat (was 60, now ${plotAfterHeat.moisture})`);
assert.ok(plotAfterHeat.weatherWarnings.some(w => w.type === 'heat_stress'), 'Should attach heat stress warning');

// Apply rain + high humidity (rainProb = 85%, humidity = 92%)
GardenService.applyWeatherEffect({
  temp: 26,
  humidity: 92,
  rainProb: 85,
  condition: 'Mưa dông lớn'
});

let plotAfterRain = GardenService.getPlotById(newCoffeePlot.id);
assert.ok(plotAfterRain.moisture >= 65, `Moisture should increase from rain (now ${plotAfterRain.moisture})`);
assert.ok(plotAfterRain.weatherWarnings.some(w => w.type === 'high_humidity_fungus_risk'), 'Should attach high humidity fungus risk warning');
console.log('   ✅ Weather linkages correctly alter soil moisture and issue real-time agricultural warnings.');

// 10. Test deletePlot() & resetGarden()
console.log('10. Testing deletePlot() & resetGarden()...');
const totalBeforeDelete = GardenService.getPlots().length;
const deleteSuccess = GardenService.deletePlot(newCoffeePlot.id);
assert.strictEqual(deleteSuccess, true);
assert.strictEqual(GardenService.getPlots().length, totalBeforeDelete - 1);
assert.strictEqual(GardenService.getPlotById(newCoffeePlot.id), null);

const resetPlots = GardenService.resetGarden();
assert.strictEqual(resetPlots.length, 2, 'resetGarden should restore exactly 2 starter plots');
console.log('   ✅ deletePlot and resetGarden operate cleanly.');

// 11. Test Backwards Compatibility Helpers
console.log('11. Testing backwards compatibility UI helper methods...');
const starterPlot = resetPlots[0];
const waterHelperRes = GardenService.waterPlot(starterPlot.id);
assert.ok(waterHelperRes.moisture > 75);

const fertilizeHelperRes = GardenService.fertilizePlot(starterPlot.id);
assert.ok(fertilizeHelperRes.growthProgress > 45);

const reminder = GardenService.addReminder(starterPlot.id, 'Tưới nước bổ sung Kali');
assert.ok(reminder && reminder.title === 'Tưới nước bổ sung Kali');
assert.strictEqual(reminder.isDone, false);

const toggleSuccess = GardenService.toggleReminder(starterPlot.id, reminder.id);
assert.strictEqual(toggleSuccess, true);
const updatedPlot = GardenService.getPlotById(starterPlot.id);
assert.strictEqual(updatedPlot.reminders.find(r => r.id === reminder.id).isDone, true);

console.log('   ✅ UI helper wrappers verified for full compatibility.');

console.log('\n🎉 ALL 11 TEST SUITES PASSED! Virtual Garden Engine is fully verified.\n');
