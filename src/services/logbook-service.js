/**
 * AgriViet Lens - Farm Logbook & History Service
 * Manages local storage records of crop scans, treatment actions, and CSV export.
 */

const STORAGE_KEY = 'agriviet_farm_logbook_v2';

export class LogbookService {
  /**
   * Retrieves all saved logs from LocalStorage
   */
  static getLogs() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[LogbookService] Error reading from localStorage:', e);
      return [];
    }
  }

  /**
   * Adds a new scan diagnosis entry to the logbook
   */
  static addLog(diagnosisData) {
    const logs = this.getLogs();
    const newEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      cropName: diagnosisData.cropName || 'Cây Trồng',
      diseaseNameVi: diagnosisData.diseaseNameVi || 'Bệnh chưa xác định',
      severityLevel: diagnosisData.severityLevel || 'Trung bình',
      confidenceScore: diagnosisData.confidenceScore ?? 90,
      location: diagnosisData.location || 'Vườn nhà',
      notes: diagnosisData.notes || 'Chẩn đoán tự động từ AgriViet Lens',
      status: 'Đang theo dõi', // 'Đang theo dõi' | 'Đã xử lý' | 'Đã khỏi bệnh'
      thumbnail: diagnosisData.thumbnail || null,
      quarantineDays: diagnosisData.quarantineDays ?? diagnosisData?.chemicalTreatment?.quarantineDays ?? 0
    };

    logs.unshift(newEntry);
    this.saveLogs(logs);
    return newEntry;
  }

  /**
   * Updates treatment status of an entry
   */
  static updateStatus(id, newStatus) {
    const logs = this.getLogs();
    const target = logs.find(l => l.id === id);
    if (target) {
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      this.saveLogs(logs);
      return target;
    }
    return null;
  }

  /**
   * Deletes a log entry
   */
  static deleteLog(id) {
    const logs = this.getLogs();
    const filtered = logs.filter(l => l.id !== id);
    this.saveLogs(filtered);
    return true;
  }

  /**
   * Saves logs array to LocalStorage
   */
  static saveLogs(logs) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      }
    } catch (e) {
      console.error('[LogbookService] Error saving to localStorage:', e);
    }
  }

  /**
   * Exports logs to CSV format for download
   */
  static exportToCSV() {
    const logs = this.getLogs();
    const headers = ['Mã ghi chép', 'Thời gian', 'Cây trồng', 'Tên bệnh', 'Mức độ', 'Độ tin cậy (%)', 'Trạng thái', 'Cách ly (ngày)', 'Ghi chú'];

    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.createdAt).toLocaleDateString('vi-VN')}"`,
      `"${l.cropName}"`,
      `"${l.diseaseNameVi}"`,
      `"${l.severityLevel}"`,
      `"${l.confidenceScore}%"`,
      `"${l.status}"`,
      `"${l.quarantineDays || 0}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
