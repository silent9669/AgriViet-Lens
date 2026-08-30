/**
 * Utility for parsing and scaling agricultural chemical and biological dosage
 * for spray tanks.
 */
export class DosageCalculator {
  /**
   * Calculates scaled dosage for standard agricultural tanks (16L, 20L, 25L,
   * 200L, and 30L drone tanks).
   *
   * @param {string} baseInstruction e.g. "Pha 20g / bình 16L nước"
   * @param {number} targetCapacityLiters Target tank capacity in liters
   * @returns {{capacityLiters: number, multiplier: number, calculatedDosageText: string}}
   */
  static calculateTankDosage(baseInstruction, targetCapacityLiters = 16) {
    const targetLiters = Number(targetCapacityLiters) || 16;

    if (!baseInstruction || typeof baseInstruction !== 'string') {
      return {
        capacityLiters: targetLiters,
        multiplier: 1,
        calculatedDosageText: `Pha đúng liều lượng khuyến cáo cho bình ${targetLiters}L.`
      };
    }

    const baseMatch = baseInstruction.match(/b[iì]nh\s+(\d+)\s*[Ll]|(\d+)\s*lít|(\d+)\s*L\b/i);
    const baseLiters = baseMatch ? Number(baseMatch[1] || baseMatch[2] || baseMatch[3]) : 16;
    const multiplier = targetLiters / baseLiters;

    const match = baseInstruction.match(/(\d+(?:[.,]\d+)?)\s*(gam|gói|viên|cc|ml|g)\b/i);
    if (match) {
      const originalAmount = parseFloat(match[1].replace(',', '.'));
      const unit = match[2].toLowerCase();
      const scaledAmount = (originalAmount * multiplier).toFixed(1).replace(/\.0$/, '');

      return {
        capacityLiters: targetLiters,
        multiplier,
        calculatedDosageText: `${scaledAmount} ${unit} thuốc cho bình ${targetLiters}L nước (Gốc: ${originalAmount} ${unit} / ${baseLiters}L)`
      };
    }

    return {
      capacityLiters: targetLiters,
      multiplier,
      calculatedDosageText: `${baseInstruction} (Dung tích bình: ${targetLiters}L, hệ số nhân x${multiplier.toFixed(2)})`
    };
  }
}
