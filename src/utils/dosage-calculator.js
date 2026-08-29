/**
 * Utility for parsing and scaling agricultural chemical and biological dosage
 * for spray tanks.
 */
export class DosageCalculator {
  /**
   * Calculates scaled dosage from a 16L base instruction.
   *
   * @param {string} baseInstruction e.g. "20ml / bình 16L"
   * @param {number} targetCapacityLiters Target tank capacity in liters
   * @returns {{capacityLiters: number, multiplier: number, calculatedDosageText: string}}
   */
  static calculateTankDosage(baseInstruction, targetCapacityLiters = 16) {
    const targetLiters = Number(targetCapacityLiters) || 16;
    // Extract base liters from instruction (e.g. "bình 25L", "1 lít", "16L")
    const baseMatch = typeof baseInstruction === 'string'
      ? baseInstruction.match(/b[iì]nh\s+(\d+)\s*[Ll]|(\d+)\s*lít|(\d+)\s*L\b/)
      : null;
    const baseLiters = baseMatch ? Number(baseMatch[1] || baseMatch[2] || baseMatch[3]) : 16;
    const multiplier = targetLiters / baseLiters;

    if (!baseInstruction) {
      return {
        capacityLiters: targetLiters,
        multiplier,
        calculatedDosageText: `Pha đúng tỷ lệ khuyến cáo cho bình ${targetLiters}L.`
      };
    }

    const match = baseInstruction.match(/(\d+(?:[.,]\d+)?)\s*(gam|gói|viên|cc|ml|g)/i);
    if (match) {
      const originalAmount = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toLowerCase();
      const scaledAmount = (originalAmount * multiplier).toFixed(1).replace(/\.0$/, '');

      return {
        capacityLiters: targetLiters,
        multiplier,
        calculatedDosageText: `${scaledAmount} ${unit} / bình ${targetLiters}L nước (Tỷ lệ gốc: ${originalAmount} ${unit} / ${baseLiters}L)`
      };
    }

    return {
      capacityLiters: targetLiters,
      multiplier,
      calculatedDosageText: `${baseInstruction} (Dung tích áp dụng: ${targetLiters}L, hệ số x${multiplier})`
    };
  }
}
