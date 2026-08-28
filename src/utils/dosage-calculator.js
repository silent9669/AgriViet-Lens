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
    const multiplier = targetLiters / 16;

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
        calculatedDosageText: `${scaledAmount} ${unit} / bình ${targetLiters}L nước (Tỷ lệ gốc: ${originalAmount} ${unit} / 16L)`
      };
    }

    return {
      capacityLiters: targetLiters,
      multiplier,
      calculatedDosageText: `${baseInstruction} (Dung tích áp dụng: ${targetLiters}L, hệ số x${multiplier})`
    };
  }
}
