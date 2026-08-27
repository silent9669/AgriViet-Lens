/**
 * AgriViet Lens - Main Application Controller
 * Orchestrates Vision Pathology, Tactile Dosage Calculator, Voice Assistant, Weather Radar, and Farm Logbook.
 */

import { SAMPLE_PRESETS } from './data/offline-diseases.js';
import { GeminiService } from './services/gemini-service.js';
import { WeatherRadarService, VIETNAM_REGIONS } from './services/weather-radar.js';
import { LogbookService } from './services/logbook-service.js';

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class AgriVietApp {
  constructor() {
    this.apiKey = localStorage.getItem('agriviet_gemini_api_key') || '';
    this.selectedCrop = 'rice';
    this.currentImageBase64 = null;
    this.currentDiagnosis = null;
    this.isRecording = false;
    this.recognition = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.activeTab = 'scanner'; // 'scanner' | 'voice' | 'weather' | 'logbook'
    this.treatmentTab = 'organic'; // 'organic' | 'chemical'
    this.tankCapacity = 25; // 16L | 25L | 200L
  }

  init() {
    console.log('[AgriVietApp] Initializing AgriViet Lens 2026...');
    this.setupSpeechRecognition();
    this.renderPresets();
    this.bindEvents();
    this.loadWeather();
    this.renderLogbook();
    this.updateApiKeyStatus();

    // Auto load first sample preset for immediate evaluation
    this.loadPreset(SAMPLE_PRESETS[0]);
  }

  updateApiKeyStatus() {
    const statusEl = document.getElementById('apiKeyStatus');
    const badgeEl = document.getElementById('apiKeyBadge');
    if (!statusEl || !badgeEl) return;

    if (this.apiKey) {
      statusEl.textContent = 'Gemini 2.0 API: Đã Kích Hoạt';
      badgeEl.className = 'px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm';
      badgeEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Gemini Cloud Live';
    } else {
      statusEl.textContent = 'AI Studio Starter / Cơ Sở Dữ Liệu Sẵn Sàng';
      badgeEl.className = 'px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5';
      badgeEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span> Dữ Liệu Chuyên Gia Sẵn Sàng';
    }
  }

  saveApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem('agriviet_gemini_api_key', this.apiKey);
      this.showToast('Đã kích hoạt Google Gemini API thành công!', 'success');
    } else {
      localStorage.removeItem('agriviet_gemini_api_key');
      this.showToast('Đã kích hoạt Bộ Cơ Sở Dữ Liệu Ngoại Tuyến!', 'info');
    }
    this.updateApiKeyStatus();
  }

  setupSpeechRecognition() {
    const SpeechRec = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.lang = 'vi-VN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateMicUI(true);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const voiceInput = document.getElementById('voiceInput');
        if (voiceInput) voiceInput.value = transcript;
        this.submitVoiceQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('[Speech] Recognition error:', event.error);
        this.isRecording = false;
        this.updateMicUI(false);
        this.showToast('Nhận diện giọng nói: ' + event.error, 'error');
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicUI(false);
      };
    }
  }

  toggleRecording() {
    if (!this.recognition) {
      this.showToast('Trình duyệt không hỗ trợ Web Speech trực tiếp. Vui lòng nhập câu hỏi bằng bàn phím.', 'warning');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('[Speech] Start failed:', e);
      }
    }
  }

  updateMicUI(recording) {
    const btn = document.getElementById('micButton');
    const wave = document.getElementById('voiceWaveform');
    if (!btn) return;

    if (recording) {
      btn.classList.add('bg-rose-600', 'animate-pulse', 'ring-4', 'ring-rose-400/40');
      btn.classList.remove('bg-emerald-600');
      if (wave) wave.classList.remove('hidden');
    } else {
      btn.classList.remove('bg-rose-600', 'animate-pulse', 'ring-4', 'ring-rose-400/40');
      btn.classList.add('bg-emerald-600');
      if (wave) wave.classList.add('hidden');
    }
  }

  speakText(text) {
    if (!this.synth) return;
    this.synth.cancel();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) utterance.voice = viVoice;

    this.synth.speak(utterance);
  }

  renderPresets() {
    const container = document.getElementById('presetContainer');
    if (!container) return;

    container.innerHTML = SAMPLE_PRESETS.map((preset) => `
      <button
        data-preset-id="${preset.id}"
        class="preset-card group p-3 rounded-xl border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-900/40 hover:border-emerald-500/80 transition-all text-left flex items-center gap-3.5 w-full"
      >
        <div class="relative w-14 h-12 rounded-lg overflow-hidden border border-emerald-800/60 shrink-0 shadow-inner">
          <img src="${preset.sampleImageBase64}" alt="${preset.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors truncate">${preset.name}</div>
          <div class="text-xs text-slate-400 truncate mt-0.5">${preset.description}</div>
        </div>
        <span class="text-emerald-400 text-xs font-bold px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30 group-hover:bg-emerald-500/25 group-hover:border-emerald-400 transition-all shrink-0">
          Khám Phá
        </span>
      </button>
    `).join('');

    container.querySelectorAll('.preset-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preset-id');
        const preset = SAMPLE_PRESETS.find(p => p.id === id);
        if (preset) this.loadPreset(preset);
      });
    });
  }

  loadPreset(preset) {
    this.selectedCrop = preset.cropKey;
    this.currentImageBase64 = preset.sampleImageBase64;

    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const scanHud = document.getElementById('scannerHudOverlay');

    if (preview && placeholder) {
      preview.src = preset.sampleImageBase64;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      if (scanHud) scanHud.classList.remove('hidden');
    }

    // Sync crop selector
    const cropSelect = document.getElementById('cropSelector');
    if (cropSelect) cropSelect.value = preset.cropKey;

    this.runDiagnosis();
  }

  async runDiagnosis() {
    if (!this.currentImageBase64) {
      this.showToast('Vui lòng chọn hoặc chụp ảnh lá cây cần chẩn đoán!', 'warning');
      return;
    }

    const scanBtn = document.getElementById('btnRunScan');
    const loadingState = document.getElementById('diagnosisLoading');
    const resultCard = document.getElementById('diagnosisResultCard');
    const scanBeam = document.getElementById('scanLaserBeam');

    if (scanBtn) scanBtn.disabled = true;
    if (loadingState) loadingState.classList.remove('hidden');
    if (scanBeam) scanBeam.classList.remove('hidden');
    if (resultCard) resultCard.classList.add('opacity-30', 'pointer-events-none');

    try {
      const diagnosis = await GeminiService.diagnoseCropImage(
        this.currentImageBase64,
        this.selectedCrop,
        this.apiKey
      );

      this.currentDiagnosis = diagnosis;
      this.renderDiagnosis(diagnosis);
      this.calculateDosage();
      this.showToast('Đã hoàn tất phân tích bệnh lý thực vật!', 'success');
    } catch (e) {
      console.error('[Diagnosis] Error:', e);
      this.showToast('Lỗi chẩn đoán: ' + e.message, 'error');
    } finally {
      if (scanBtn) scanBtn.disabled = false;
      if (loadingState) loadingState.classList.add('hidden');
      if (scanBeam) scanBeam.classList.add('hidden');
      if (resultCard) resultCard.classList.remove('opacity-30', 'pointer-events-none');
    }
  }

  renderDiagnosis(data) {
    const card = document.getElementById('diagnosisResultCard');
    if (!card) return;

    let severityBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Mức Độ: Nhẹ</span>';
    if (data.severityLevel === 'Nghiêm trọng') {
      severityBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">Mức Độ: Nghiêm Trọng</span>';
    } else if (data.severityLevel === 'Trung bình') {
      severityBadge = '<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Mức Độ: Cảnh Báo</span>';
    }

    document.getElementById('resCropName').textContent = data.cropName;
    document.getElementById('resDiseaseVi').textContent = data.diseaseNameVi;
    document.getElementById('resDiseaseScientific').textContent = data.diseaseNameScientific;
    document.getElementById('resConfidence').textContent = `${data.confidenceScore}%`;
    document.getElementById('resConfidenceBar').style.width = `${data.confidenceScore}%`;
    document.getElementById('resSeverityContainer').innerHTML = severityBadge;
    document.getElementById('resSymptoms').textContent = data.symptomsSummary;
    document.getElementById('resCauses').textContent = data.primaryCauses;

    // Organic Tab
    const organic = data.organicTreatment || {};
    document.getElementById('organicSteps').innerHTML = (organic.steps || []).map((s, i) => `
      <li class="flex items-start gap-3 text-sm text-slate-200">
        <span class="flex-shrink-0 w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center justify-center font-mono font-bold">${i + 1}</span>
        <span class="leading-relaxed">${escapeHTML(s)}</span>
      </li>
    `).join('');
    document.getElementById('organicBioProducts').textContent = organic.bioProducts || 'Trichoderma viride, Bacillus subtilis VietGAP.';

    // Chemical Tab
    const chem = data.chemicalTreatment || {};
    document.getElementById('chemActive').textContent = chem.activeIngredients || 'Hoạt chất đặc trị';
    document.getElementById('chemDosage').textContent = chem.dosageInstructions || 'Pha theo hướng dẫn';
    document.getElementById('chemQuarantine').textContent = `${chem.quarantineDays || 14} Ngày`;
    document.getElementById('chemSafety').textContent = chem.safetyNotes || 'Bảo hộ lao động đầy đủ.';

    // Prevention List
    document.getElementById('resPreventionList').innerHTML = (data.seasonalPrevention || []).map(p => `
      <li class="flex items-start gap-2.5 text-xs text-slate-300">
        <span class="text-emerald-400 font-bold shrink-0">✓</span>
        <span class="leading-relaxed">${escapeHTML(p)}</span>
      </li>
    `).join('');

    card.classList.remove('hidden');
    this.switchTreatmentTab(this.treatmentTab);
  }

  switchTreatmentTab(tab) {
    this.treatmentTab = tab;
    const tabOrgBtn = document.getElementById('tabOrgBtn');
    const tabChemBtn = document.getElementById('tabChemBtn');
    const paneOrg = document.getElementById('paneOrganic');
    const paneChem = document.getElementById('paneChemical');

    if (!tabOrgBtn || !tabChemBtn) return;

    if (tab === 'organic') {
      tabOrgBtn.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-md flex items-center gap-1.5 transition-all';
      tabChemBtn.className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900/60 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-all';
      paneOrg.classList.remove('hidden');
      paneChem.classList.add('hidden');
    } else {
      tabChemBtn.className = 'px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white shadow-md flex items-center gap-1.5 transition-all';
      tabOrgBtn.className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900/60 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-all';
      paneChem.classList.remove('hidden');
      paneOrg.classList.add('hidden');
    }
  }

  setTankCapacity(liters) {
    this.tankCapacity = liters;
    document.querySelectorAll('.tank-btn').forEach(btn => {
      const cap = Number(btn.getAttribute('data-capacity'));
      if (cap === liters) {
        btn.className = 'tank-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md border border-emerald-500 transition-all';
      } else {
        btn.className = 'tank-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all';
      }
    });
    this.calculateDosage();
  }

  calculateDosage() {
    const calcDoseAmount = document.getElementById('calcDoseAmount');
    const calcWaterAmount = document.getElementById('calcWaterAmount');
    const calcCoverageArea = document.getElementById('calcCoverageArea');
    if (!calcDoseAmount) return;

    let dosePerL = 1.0; // 1g or 1ml per Liter
    if (this.selectedCrop === 'durian') dosePerL = 2.5;
    if (this.selectedCrop === 'dragonfruit') dosePerL = 1.4;
    if (this.selectedCrop === 'coffee') dosePerL = 1.2;

    const totalDose = Math.round(dosePerL * this.tankCapacity);
    const coverageM2 = Math.round(this.tankCapacity * 20); // 20m2 per Liter on average

    calcDoseAmount.textContent = `${totalDose} g (hoặc ml)`;
    calcWaterAmount.textContent = `${this.tankCapacity} Lít Nước`;
    calcCoverageArea.textContent = `~ ${coverageM2} m² tán lá`;
  }

  async submitVoiceQuery(question) {
    if (!question || !question.trim()) return;

    const chatContainer = document.getElementById('voiceChatHistory');
    const input = document.getElementById('voiceInput');
    if (input) input.value = '';

    if (chatContainer) {
      chatContainer.innerHTML += `
        <div class="flex items-start gap-3 justify-end">
          <div class="bg-emerald-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] text-sm shadow-md leading-relaxed">
            ${escapeHTML(question)}
          </div>
          <div class="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-200 shrink-0">Bạn</div>
        </div>
      `;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    const context = this.currentDiagnosis ? {
      crop: this.currentDiagnosis.cropName,
      disease: this.currentDiagnosis.diseaseNameVi
    } : {};

    const answer = await GeminiService.askFarmingAssistant(question, context, this.apiKey);

    if (chatContainer) {
      chatContainer.innerHTML += `
        <div class="flex items-start gap-3 justify-start">
          <div class="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">AI</div>
          <div class="bg-slate-900 border border-emerald-900/40 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3.5 max-w-[85%] text-sm shadow-md space-y-2">
            <p class="leading-relaxed">${escapeHTML(answer)}</p>
            <button class="btn-read-aloud text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 mt-2 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
              🔊 Nghe phát âm
            </button>
          </div>
        </div>
      `;
      chatContainer.scrollTop = chatContainer.scrollHeight;

      chatContainer.querySelectorAll('.btn-read-aloud').forEach(b => {
        b.onclick = () => this.speakText(answer);
      });
    }

    this.speakText(answer);
  }

  async loadWeather(lat = 10.0452, lon = 105.7469) {
    const container = document.getElementById('weatherCard');
    if (!container) return;

    try {
      const data = await WeatherRadarService.getAgriculturalRisk(lat, lon);
      document.getElementById('weatherLocation').textContent = data.locationName;
      document.getElementById('weatherTemp').textContent = `${data.temperature}°C`;
      document.getElementById('weatherHumidity').textContent = `${data.humidity}%`;
      document.getElementById('weatherPrecip').textContent = `${data.precipitation} mm`;

      const risk = data.riskEvaluation;
      const riskBadge = document.getElementById('weatherRiskBadge');
      const riskDesc = document.getElementById('weatherRiskWarning');

      if (riskBadge) {
        riskBadge.textContent = risk.level;
        riskBadge.className = `px-3 py-1 rounded-full text-xs font-bold border ${risk.badgeClass}`;
      }
      if (riskDesc) riskDesc.textContent = risk.warningText;

      const forecastEl = document.getElementById('weatherForecastDays');
      if (forecastEl && data.forecast3Days) {
        forecastEl.innerHTML = data.forecast3Days.map(f => `
          <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center space-y-1">
            <div class="text-xs text-slate-400 font-medium">${f.date}</div>
            <div class="text-sm font-bold text-slate-100 my-0.5">${f.tempMin}° - ${f.tempMax}°C</div>
            <div class="text-xs text-cyan-400 font-medium">🌧️ Mưa: ${f.rainProb}%</div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error('[Weather] Failed to load:', e);
    }
  }

  saveCurrentToLogbook() {
    if (!this.currentDiagnosis) {
      this.showToast('Chưa có kết quả chẩn đoán nào để lưu!', 'warning');
      return;
    }

    const entry = LogbookService.addLog({
      ...this.currentDiagnosis,
      thumbnail: this.currentImageBase64,
      location: document.getElementById('weatherLocation')?.textContent || 'Vườn nhà'
    });

    this.renderLogbook();
    this.showToast(`Đã lưu "${entry.diseaseNameVi}" vào Nhật Ký Đồng Ruộng!`, 'success');
  }

  renderLogbook() {
    const tableBody = document.getElementById('logbookTableBody');
    const countEl = document.getElementById('logbookCount');
    if (!tableBody) return;

    const logs = LogbookService.getLogs();
    if (countEl) countEl.textContent = `(${logs.length} bản ghi)`;

    if (logs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-10 text-slate-500 text-sm">
            Chưa có ghi chép bệnh hại nào. Hãy thực hiện chẩn đoán và bấm "Lưu Vào Nhật Ký".
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = logs.map(l => `
      <tr class="border-b border-slate-800/60 hover:bg-emerald-950/10 text-sm transition-colors">
        <td class="py-3.5 px-3 text-slate-400 text-xs font-mono">${new Date(l.createdAt).toLocaleDateString('vi-VN')}</td>
        <td class="py-3.5 px-3 font-bold text-slate-200">${escapeHTML(l.cropName)}</td>
        <td class="py-3.5 px-3 font-semibold text-emerald-400">${escapeHTML(l.diseaseNameVi)}</td>
        <td class="py-3.5 px-3">
          <span class="px-2.5 py-1 rounded-md text-xs font-medium ${l.severityLevel === 'Nghiêm trọng' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
            ${escapeHTML(l.severityLevel)}
          </span>
        </td>
        <td class="py-3.5 px-3">
          <select data-log-id="${escapeHTML(l.id)}" class="status-select bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:ring-1 focus:ring-emerald-500">
            <option value="Đang theo dõi" ${l.status === 'Đang theo dõi' ? 'selected' : ''}>Đang theo dõi</option>
            <option value="Đã xử lý" ${l.status === 'Đã xử lý' ? 'selected' : ''}>Đã xử lý</option>
            <option value="Đã khỏi bệnh" ${l.status === 'Đã khỏi bệnh' ? 'selected' : ''}>Đã khỏi bệnh</option>
          </select>
        </td>
        <td class="py-3.5 px-3 text-right">
          <button data-delete-id="${escapeHTML(l.id)}" class="btn-delete-log text-slate-500 hover:text-rose-400 text-xs px-2 py-1 transition-colors">Xóa</button>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.status-select').forEach(sel => {
      sel.onchange = (e) => {
        const id = e.target.getAttribute('data-log-id');
        LogbookService.updateStatus(id, e.target.value);
        this.showToast('Đã cập nhật tiến độ điều trị!', 'info');
      };
    });

    tableBody.querySelectorAll('.btn-delete-log').forEach(b => {
      b.onclick = (e) => {
        const id = e.target.getAttribute('data-delete-id');
        LogbookService.deleteLog(id);
        this.renderLogbook();
        this.showToast('Đã xóa ghi chép!', 'info');
      };
    });
  }

  exportCSV() {
    const csvContent = LogbookService.exportToCSV();
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agriviet_nhat_ky_dong_ruong_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Đã xuất file báo cáo CSV thành công!', 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const colors = {
      success: 'bg-emerald-600 text-white shadow-emerald-900/50',
      error: 'bg-rose-600 text-white shadow-rose-900/50',
      warning: 'bg-amber-600 text-white shadow-amber-900/50',
      info: 'bg-slate-900 text-slate-100 border border-slate-700 shadow-slate-900/50'
    };

    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all transform duration-300 ${colors[type] || colors.info}`;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3500);
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        this.switchNavTab(target);
      });
    });

    // Treatment Mode Tabs
    const tabOrg = document.getElementById('tabOrgBtn');
    const tabChem = document.getElementById('tabChemBtn');
    if (tabOrg) tabOrg.addEventListener('click', () => this.switchTreatmentTab('organic'));
    if (tabChem) tabChem.addEventListener('click', () => this.switchTreatmentTab('chemical'));

    // Tank Capacity Buttons for Dosage Calculator
    document.querySelectorAll('.tank-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cap = Number(btn.getAttribute('data-capacity'));
        this.setTankCapacity(cap);
      });
    });

    // Crop Selector
    const cropSel = document.getElementById('cropSelector');
    if (cropSel) {
      cropSel.addEventListener('change', (e) => {
        this.selectedCrop = e.target.value;
        this.calculateDosage();
      });
    }

    // Run Scan Button
    const btnScan = document.getElementById('btnRunScan');
    if (btnScan) btnScan.addEventListener('click', () => this.runDiagnosis());

    // File Upload / Drop
    const fileInput = document.getElementById('leafFileInput');
    const dropZone = document.getElementById('uploadDropZone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileSelected(file);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-emerald-500', 'bg-emerald-950/40');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-emerald-500', 'bg-emerald-950/40');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-emerald-500', 'bg-emerald-950/40');
        if (e.dataTransfer.files.length) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    // Voice Mic & Submit
    const micBtn = document.getElementById('micButton');
    if (micBtn) micBtn.addEventListener('click', () => this.toggleRecording());

    const voiceSubmit = document.getElementById('btnVoiceSubmit');
    const voiceInput = document.getElementById('voiceInput');
    if (voiceSubmit && voiceInput) {
      voiceSubmit.addEventListener('click', () => this.submitVoiceQuery(voiceInput.value));
      voiceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitVoiceQuery(voiceInput.value);
      });
    }

    // Quick Voice Chips
    document.querySelectorAll('.voice-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent.trim().replace(/^"|"$/g, '');
        if (voiceInput) voiceInput.value = text;
        this.submitVoiceQuery(text);
      });
    });

    // Save to Logbook
    const btnSaveLog = document.getElementById('btnSaveLogbook');
    if (btnSaveLog) btnSaveLog.addEventListener('click', () => this.saveCurrentToLogbook());

    // Export CSV
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) btnExportCSV.addEventListener('click', () => this.exportCSV());

    // Region Select for Weather
    const regionSelect = document.getElementById('regionSelect');
    if (regionSelect) {
      regionSelect.innerHTML = VIETNAM_REGIONS.map((r, i) => `
        <option value="${i}">${r.name}</option>
      `).join('');
      regionSelect.addEventListener('change', (e) => {
        const r = VIETNAM_REGIONS[e.target.value];
        if (r) this.loadWeather(r.lat, r.lon);
      });
    }

    // API Key Modal
    const btnOpenKeyModal = document.getElementById('btnApiKeyModal');
    const modal = document.getElementById('apiKeyModal');
    const btnCloseModal = document.getElementById('btnCloseKeyModal');
    const btnSaveKey = document.getElementById('btnSaveApiKey');
    const apiKeyInput = document.getElementById('geminiApiKeyInput');

    if (btnOpenKeyModal && modal) {
      btnOpenKeyModal.onclick = () => {
        if (apiKeyInput) apiKeyInput.value = this.apiKey;
        modal.classList.remove('hidden');
      };
    }
    if (btnCloseModal && modal) {
      btnCloseModal.onclick = () => modal.classList.add('hidden');
    }
    if (btnSaveKey && apiKeyInput && modal) {
      btnSaveKey.onclick = () => {
        this.saveApiKey(apiKeyInput.value);
        modal.classList.add('hidden');
      };
    }
  }

  handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Vui lòng chọn một file hình ảnh (JPG, PNG, WebP)!', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.currentImageBase64 = GeminiService.resizeImageToMax(img, 800);
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const scanHud = document.getElementById('scannerHudOverlay');
        if (preview && placeholder) {
          preview.src = this.currentImageBase64;
          preview.classList.remove('hidden');
          placeholder.classList.add('hidden');
          if (scanHud) scanHud.classList.remove('hidden');
        }
        this.showToast('Đã tải ảnh lá lên. Nhấn "Phân Tích Bệnh" để chẩn đoán.', 'info');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  switchNavTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(t => {
      if (t.getAttribute('data-tab') === tabName) {
        t.className = 'nav-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 shadow-sm transition-all';
      } else {
        t.className = 'nav-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 flex items-center gap-2 transition-all';
      }
    });

    ['scanner', 'voice', 'weather', 'logbook'].forEach(pane => {
      const el = document.getElementById(`pane_${pane}`);
      if (el) {
        if (pane === tabName) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new AgriVietApp();
    window.app.init();
  });
}
