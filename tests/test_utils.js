import assert from 'node:assert/strict';
import { DosageCalculator } from '../src/utils/dosage-calculator.js';
import { ImageProcessor } from '../src/utils/image-processor.js';

console.log('Testing DosageCalculator and ImageProcessor utilities...');

const base20ml = '20ml / bình 16L';
const calc16 = DosageCalculator.calculateTankDosage(base20ml, 16);
assert.strictEqual(calc16.capacityLiters, 16);
assert.strictEqual(calc16.multiplier, 1);
assert.ok(calc16.calculatedDosageText.includes('20 ml'));
assert.ok(calc16.calculatedDosageText.includes('bình 16L nước'));

const calc25 = DosageCalculator.calculateTankDosage(base20ml, 25);
assert.strictEqual(calc25.capacityLiters, 25);
assert.strictEqual(calc25.multiplier, 25 / 16);
assert.ok(calc25.calculatedDosageText.includes('31.3'));

const calc200 = DosageCalculator.calculateTankDosage(base20ml, 200);
assert.strictEqual(calc200.capacityLiters, 200);
assert.strictEqual(calc200.multiplier, 12.5);
assert.ok(calc200.calculatedDosageText.includes('250 ml'));

const base25g = '25g pha cho bình 16L nước';
const calc25g16 = DosageCalculator.calculateTankDosage(base25g, 16);
assert.ok(calc25g16.calculatedDosageText.includes('25 g'));

const calc25g25 = DosageCalculator.calculateTankDosage(base25g, 25);
assert.ok(calc25g25.calculatedDosageText.includes('39.1'));

const calc25g200 = DosageCalculator.calculateTankDosage(base25g, 200);
assert.ok(calc25g200.calculatedDosageText.includes('312.5 g'));

const nodeImage = await ImageProcessor.optimizeImage('data:image/png;base64,abc');
assert.deepStrictEqual(nodeImage, {
  base64: 'data:image/png;base64,abc',
  mimeType: 'image/jpeg',
  width: 800,
  height: 600
});

console.log('All utility tests passed.');
