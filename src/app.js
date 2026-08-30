/**
 * AgriViet Lens - Main Application Controller
 * Orchestrates AI crop pathology diagnosis, virtual garden simulation,
 * agricultural pharmacy & Shopee finder, weather radar risk analysis,
 * and the local VietGAP logbook.
 */

import { SAMPLE_PRESETS } from './data/sample-presets.js';
import { GeminiService, GEMINI_MODELS } from './services/gemini-service.js';
import { WeatherRadarService, VIETNAM_REGIONS } from './services/weather-radar.js';
import { LogbookService } from './services/logbook-service.js';
import { GardenService, PLANT_TEMPLATES } from './services/garden-service.js';
import { MedicineService } from './services/medicine-service.js';
import { ImageProcessor } from './utils/image-processor.js';
import { DosageCalculator } from './utils/dosage-calculator.js';
import { renderIcon } from './utils/icons.js';

const NAVIGATION_TABS = ['scanner', 'garden', 'medicine', 'weather', 'logbook'];
const VIEW_IDS = {
  scanner: 'viewScanner',
  garden: 'viewGarden',
  medicine: 'viewMedicine',
  weather: 'viewWeather',
  logbook: 'viewLogbook'
};

function getStorage() {
  return typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return '—';
  if (size < 1024) return `${Math.round(size)} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  return `${(size / (1024 * 1024)).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} MB`;
}

function estimateBase64Size(dataUri) {
  const encoded = String(dataUri ?? '').split(',')[1] || '';
  if (!encoded) return 0;
  return Math.max(0, Math.floor((encoded.length * 3) / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0));
}

function setHidden(element, hidden) {
  if (!element) return;
  element.hidden = hidden;
  element.classList?.toggle('hidden', hidden);
}

function getElement(id) {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

export class AgriVietApp {
  constructor() {
    const storage = getStorage();

    this.apiKey = storage?.getItem('agriviet_gemini_api_key') || '';
    this.theme = storage?.getItem('agriviet_theme') || 'light';
    this.activeTab = 'scanner';
    this.selectedModel = GEMINI_MODELS.FLASH;
    this.tankCapacity = 16;
    this.currentDiagnosis = null;
    this.currentImageBase64 = null;
    this.currentImageMetadata = null;
    this.currentWeather = null;
    this.isRecording = false;

    this.selectedCrop = 'rice';
    this.treatmentTab = 'organic';
    this.currentDosageInstruction = '';
    this.medicineSearchQuery = '';
    this.medicineCategory = 'all';

    this.recognition = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this._toastTimer = null;
  }

  init() {
    this.applyTheme();
    this.setupSpeech();
    this.bindEvents();
    this.loadWeather();
    this.renderGarden();
    this.renderMedicineCatalog();
    this.renderLogbook();

    if (SAMPLE_PRESETS[0]) {
      this.loadPreset(SAMPLE_PRESETS[0]);
    }
  }

  /**
   * Bind the top-level workbench navigation across all 5 main views.
   */
  bindNavigation() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('[data-tab]').forEach(tab => {
      if (tab.dataset.agrivietNavigationBound === 'true') return;
      tab.dataset.agrivietNavigationBound = 'true';
      tab.addEventListener('click', () => this.switchNavTab(tab.getAttribute('data-tab')));
    });

    this.switchNavTab(this.activeTab);
  }

  switchNavTab(tabName) {
    const nextTab = NAVIGATION_TABS.includes(tabName) ? tabName : 'scanner';
    this.activeTab = nextTab;

    if (typeof document === 'undefined') return;

    document.querySelectorAll('[data-tab]').forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === nextTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    Object.entries(VIEW_IDS).forEach(([name, id]) => {
      setHidden(getElement(id), name !== nextTab);
    });

    if (nextTab === 'garden') {
      this.renderGarden();
    } else if (nextTab === 'medicine') {
      this.renderMedicineCatalog();
    } else if (nextTab === 'logbook') {
      this.renderLogbook();
    }
  }

  setSelectedModel(model) {
    this.selectedModel = model === GEMINI_MODELS.PRO ? GEMINI_MODELS.PRO : GEMINI_MODELS.FLASH;

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.model-btn').forEach(button => {
        const isActive = button.getAttribute('data-model') === this.selectedModel;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-checked', String(isActive));
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    return this.selectedModel;
  }

  bindModelToggle() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('.model-btn').forEach(button => {
      if (button.dataset.agrivietModelBound === 'true') return;
      button.dataset.agrivietModelBound = 'true';
      button.addEventListener('click', () => this.setSelectedModel(button.getAttribute('data-model')));
    });

    this.setSelectedModel(this.selectedModel);
  }

  bindPresets() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('.preset-btn').forEach(button => {
      if (button.dataset.agrivietPresetBound === 'true') return;
      button.dataset.agrivietPresetBound = 'true';
      button.addEventListener('click', () => {
        const presetKey = button.getAttribute('data-preset') || '';
        const preset = SAMPLE_PRESETS.find(candidate => (
          candidate.id === presetKey ||
          candidate.cropKey === presetKey ||
          candidate.crop === presetKey
        ));
        if (preset) this.loadPreset(preset);
      });
    });
  }

  loadPreset(preset) {
    if (!preset) return;

    this.selectedCrop = preset.cropKey || preset.crop || 'general';
    this.currentImageBase64 = preset.sampleImageBase64 || null;
    this.currentImageMetadata = null;

    this.updateImagePreview(this.currentImageBase64, null);

    const analyzeButton = getElement('analyzeBtn');
    if (analyzeButton) analyzeButton.disabled = !this.currentImageBase64;

    // Presets are analyzed immediately for instant ready workbench state.
    void this.runAnalysis();
  }

  bindDropzoneAndUpload() {
    if (typeof document === 'undefined') return;

    const dropzone = getElement('dropzone');
    const fileInput = getElement('fileInput');
    const cameraInput = getElement('cameraInput');
    const cameraButton = getElement('cameraBtn');
    const uploadButton = getElement('uploadBtn');
    const clearButton = getElement('clearImageBtn');

    if (fileInput && fileInput.dataset.agrivietUploadBound !== 'true') {
      fileInput.dataset.agrivietUploadBound = 'true';
      fileInput.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (file) void this.handleFileSelected(file);
        event.target.value = '';
      });
    }

    if (cameraInput && cameraInput.dataset.agrivietUploadBound !== 'true') {
      cameraInput.dataset.agrivietUploadBound = 'true';
      cameraInput.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (file) void this.handleFileSelected(file);
        event.target.value = '';
      });
    }

    if (cameraButton && cameraInput && cameraButton.dataset.agrivietUploadBound !== 'true') {
      cameraButton.dataset.agrivietUploadBound = 'true';
      cameraButton.addEventListener('click', () => cameraInput.click());
    }

    if (uploadButton && fileInput && uploadButton.dataset.agrivietUploadBound !== 'true') {
      uploadButton.dataset.agrivietUploadBound = 'true';
      uploadButton.addEventListener('click', () => fileInput.click());
    }

    if (dropzone && dropzone.dataset.agrivietDropzoneBound !== 'true') {
      dropzone.dataset.agrivietDropzoneBound = 'true';
      dropzone.addEventListener('dragover', event => {
        event.preventDefault();
        dropzone.classList.add('drag-active');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-active'));
      dropzone.addEventListener('drop', event => {
        event.preventDefault();
        dropzone.classList.remove('drag-active');
        const file = event.dataTransfer?.files?.[0];
        if (file) void this.handleFileSelected(file);
      });
      dropzone.addEventListener('click', event => {
        if (event.target.closest('button') || event.target.closest('input')) return;
        fileInput?.click();
      });
      dropzone.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) {
          event.preventDefault();
          fileInput?.click();
        }
      });
    }

    if (clearButton && clearButton.dataset.agrivietUploadBound !== 'true') {
      clearButton.dataset.agrivietUploadBound = 'true';
      clearButton.addEventListener('click', () => this.clearSelectedImage());
    }

    if (typeof window !== 'undefined' && window.__agrivietPasteBound !== true) {
      window.__agrivietPasteBound = true;
      window.addEventListener('paste', event => {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
          if (!item.type.startsWith('image/')) continue;
          const file = item.getAsFile();
          if (file) void this.handleFileSelected(file);
          break;
        }
      });
    }
  }

  async handleFileSelected(file) {
    if (!file?.type?.startsWith('image/')) {
      this.showToast('Vui lòng chọn file hình ảnh (JPG, PNG hoặc WebP).', 'warning');
      return;
    }

    if (Number(file.size) > 10 * 1024 * 1024) {
      this.showToast('Ảnh vượt quá giới hạn 10 MB.', 'warning');
      return;
    }

    try {
      const result = await ImageProcessor.compressImage(file);
      const base64 = result?.base64Uri || result?.base64 || '';
      if (!base64) throw new Error('Image compression returned no image data.');

      this.currentImageBase64 = base64;
      this.currentImageMetadata = {
        width: Number(result.width) || 0,
        height: Number(result.height) || 0,
        originalSize: Number(file.size) || Number(result.originalSize) || 0,
        compressedSize: estimateBase64Size(base64)
      };
      this.updateImagePreview(base64, this.currentImageMetadata);
      const analyzeButton = getElement('analyzeBtn');
      if (analyzeButton) analyzeButton.disabled = false;
      this.showToast('Ảnh đã sẵn sàng. Nhấn “Phân tích ảnh” để chẩn đoán.', 'info');
    } catch (error) {
      console.warn('[AgriVietApp] Unable to process image:', error);
      this.showToast('Không đọc được ảnh. Vui lòng thử lại.', 'warning');
    }
  }

  updateImagePreview(base64, metadata = this.currentImageMetadata) {
    const preview = getElement('imagePreview');
    const frame = getElement('previewFrame');
    const placeholder = getElement('dropzonePlaceholder');
    const readyStatus = getElement('imageReadyStatus');
    const metadataElement = getElement('imagePreviewMeta');

    if (!base64) {
      if (preview) preview.removeAttribute('src');
      setHidden(frame, true);
      setHidden(placeholder, false);
      setHidden(readyStatus, true);
      setHidden(metadataElement, true);
      return;
    }

    if (preview) preview.src = base64;
    if (metadataElement && metadata?.width && metadata?.height) {
      const originalSize = Number(metadata.originalSize);
      const compressedSize = Number(metadata.compressedSize) || estimateBase64Size(base64);
      metadataElement.textContent = `${metadata.width} × ${metadata.height}px · ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} sau nén`;
      setHidden(metadataElement, false);
    } else {
      setHidden(metadataElement, true);
    }
    setHidden(frame, false);
    setHidden(placeholder, true);
    setHidden(readyStatus, false);
  }

  clearSelectedImage() {
    this.currentImageBase64 = null;
    this.currentImageMetadata = null;
    this.updateImagePreview(null, null);
    const analyzeButton = getElement('analyzeBtn');
    if (analyzeButton) analyzeButton.disabled = true;
  }

  async runAnalysis() {
    if (!this.currentImageBase64) {
      this.showToast('Vui lòng chọn hoặc chụp ảnh lá cây cần chẩn đoán.', 'warning');
      return null;
    }

    const analyzeButton = getElement('analyzeBtn');
    const loadingPanel = getElement('loadingSpinner');
    const diagnosisCard = getElement('diagnosisCard');
    const analyzeIcon = getElement('analyzeIcon');
    const analyzeSpinner = getElement('analyzeSpinner');
    const analyzeLabel = getElement('analyzeLabel');

    if (analyzeButton) {
      analyzeButton.disabled = true;
      analyzeButton.dataset.state = 'loading';
    }
    setHidden(loadingPanel, false);
    setHidden(analyzeIcon, true);
    setHidden(analyzeSpinner, false);
    if (analyzeLabel) analyzeLabel.textContent = 'Đang phân tích';
    if (diagnosisCard) diagnosisCard.setAttribute('aria-busy', 'true');

    try {
      const diagnosis = await GeminiService.diagnoseCropImage(this.currentImageBase64, {
        model: this.selectedModel,
        apiKey: this.apiKey,
        cropHint: this.selectedCrop
      });

      this.currentDiagnosis = diagnosis;
      this.renderDiagnosis(diagnosis);
      this.setTankCapacity(16);
      if (diagnosis.isOfflineFallback) {
        this.showToast('Mẫu thử nghiệm / Dữ liệu tham khảo: Gemini chưa khả dụng; hãy đối chiếu nhãn BVTV và hỏi cán bộ kỹ thuật trước khi xử lý.', 'warning');
      } else {
        this.showToast('Đã hoàn tất phân tích bệnh lý thực vật.', 'success');
      }
      return diagnosis;
    } catch (error) {
      console.error('[AgriVietApp] Diagnosis failed:', error);
      this.showToast(`Lỗi chẩn đoán: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    } finally {
      if (analyzeButton) {
        analyzeButton.disabled = false;
        delete analyzeButton.dataset.state;
      }
      setHidden(loadingPanel, true);
      setHidden(analyzeIcon, false);
      setHidden(analyzeSpinner, true);
      if (analyzeLabel) analyzeLabel.textContent = 'Phân tích ảnh';
      if (diagnosisCard) diagnosisCard.removeAttribute('aria-busy');
    }
  }

  renderDiagnosis(data) {
    if (!data) return;

    const diagnosisCard = getElement('diagnosisCard');
    setHidden(diagnosisCard, false);

    const cropName = getElement('diagnosisCrop');
    const diseaseName = getElement('diseaseTitle');
    const scientificName = getElement('diseaseScientific');
    const confidenceBadge = getElement('confidenceBadge');
    const confidenceMeter = getElement('confidenceMeter');
    const symptoms = getElement('symptomsText');
    const causes = getElement('causesText');

    if (cropName) cropName.textContent = data.cropName || 'Cây trồng';
    if (diseaseName) diseaseName.textContent = data.diseaseNameVi || 'Bệnh cây trồng chưa xác định';
    if (scientificName) scientificName.textContent = data.diseaseNameScientific || 'Đang cập nhật';

    const confidence = Math.max(0, Math.min(100, Number(data.confidenceScore) || 0));
    if (confidenceBadge) confidenceBadge.textContent = `${confidence}%`;
    if (confidenceMeter) confidenceMeter.style.width = `${confidence}%`;
    if (symptoms) symptoms.textContent = data.symptomsSummary || 'Chưa có mô tả triệu chứng.';
    if (causes) causes.textContent = data.primaryCauses || 'Chưa có thông tin nguyên nhân.';

    const severity = data.severityLevel || 'Trung bình';
    const severityBadge = getElement('severityBadge');
    if (severityBadge) {
      const severityClass = severity === 'Nghiêm trọng'
        ? 'badge-alert'
        : severity === 'Trung bình' ? 'badge-warning' : 'badge-success';
      severityBadge.className = `badge ${severityClass}`;
      severityBadge.textContent = `Mức độ: ${severity}`;
    }

    const organic = data.organicTreatment || {};
    const organicTitle = getElement('organicTreatmentText');
    const organicSteps = getElement('organicSteps');
    const organicProducts = getElement('organicBioProducts');
    if (organicTitle) organicTitle.textContent = organic.title || 'Phác đồ Sinh học / Hữu cơ VietGAP';
    if (organicSteps) {
      organicSteps.innerHTML = (Array.isArray(organic.steps) ? organic.steps : []).map((step, index) => `
        <li><span class="step-number">${index + 1}</span><span>${escapeHTML(step)}</span></li>
      `).join('');
    }
    if (organicProducts) organicProducts.textContent = organic.bioProducts || 'Trichoderma spp., Bacillus spp.';

    const chemical = data.chemicalTreatment || {};
    const chemicalTitle = getElement('chemicalTreatmentText');
    const activeIngredients = getElement('activeIngredients');
    const quarantineDays = getElement('quarantineDays');
    const dosageInstructions = getElement('dosageInstructions');
    const safetyNotes = getElement('safetyNotes');
    if (chemicalTitle) chemicalTitle.textContent = chemical.title || 'Phác đồ Hóa học Đặc trị';
    if (activeIngredients) activeIngredients.textContent = chemical.activeIngredients || 'Hoạt chất được đăng ký';
    const rawQuarantineDays = chemical.quarantineDays;
    const hasQuarantineValue = (typeof rawQuarantineDays === 'number' && Number.isFinite(rawQuarantineDays))
      || (typeof rawQuarantineDays === 'string' && rawQuarantineDays.trim() !== '');
    const parsedQuarantineDays = Number(rawQuarantineDays);
    const hasQuarantineDays = chemical.quarantineDaysSpecified !== false
      && hasQuarantineValue
      && Number.isFinite(parsedQuarantineDays)
      && parsedQuarantineDays >= 0;
    if (quarantineDays) {
      quarantineDays.textContent = hasQuarantineDays
        ? (chemical.quarantineDaysLabel || `${parsedQuarantineDays} ngày`)
        : 'Theo nhãn bao bì BVTV';
    }
    if (dosageInstructions) dosageInstructions.textContent = chemical.dosageInstructions || 'Pha theo đúng liều ghi trên nhãn.';
    if (safetyNotes) safetyNotes.textContent = chemical.safetyNotes || 'Mang đầy đủ bảo hộ cá nhân và bảo vệ nguồn nước theo nhãn sản phẩm.';

    this.currentDosageInstruction = chemical.dosageInstructions || '';
    this.switchTreatmentTab(this.treatmentTab);
    this.renderTankDosage();

    // Render embedded Shopee pharmacy recommendations for this diagnosed condition
    this.renderDiagnosisShopeeCards(data);
  }

  /**
   * Renders matching Shopee medicine cards into the diagnosis results panel
   */
  renderDiagnosisShopeeCards(data) {
    const container = getElement('diagnosisShopeeCards');
    if (!container) return;

    let matchingMedicines = MedicineService.findMedicinesForDisease(data.diseaseNameVi || data.diseaseNameScientific || '');
    if (!matchingMedicines || matchingMedicines.length === 0) {
      matchingMedicines = MedicineService.searchMedicines(data.cropName || '', 'all').slice(0, 3);
    }
    if (!matchingMedicines || matchingMedicines.length === 0) {
      matchingMedicines = MedicineService.getAllMedicines().slice(0, 2);
    }

    container.innerHTML = matchingMedicines.slice(0, 4).map(med => {
      const isBio = med.category === 'bio';
      const categoryBadge = isBio
        ? '<span class="badge badge-bio">Sinh học VietGAP</span>'
        : '<span class="badge badge-chem">Hóa học đặc trị</span>';
      const shopeeUrl = MedicineService.getShopeeSearchUrl(med);

      return `
        <div class="treatment-shopee-card">
          <div>
            <div class="flex items-center justify-between gap-2">
              ${categoryBadge}
              <span class="font-mono text-xs text-primary font-bold">${escapeHTML(med.priceDisplay.split('/')[0].trim())}</span>
            </div>
            <h4 class="font-extrabold text-sm text-ink mt-2 leading-tight">${escapeHTML(med.name)}</h4>
            <p class="text-xs text-muted mt-1 italic">${escapeHTML(med.activeIngredient)}</p>
            <p class="text-xs text-muted mt-2"><strong>Liều:</strong> ${escapeHTML(med.dosageGuide)}</p>
          </div>
          <a href="${escapeHTML(shopeeUrl)}" target="_blank" rel="noopener noreferrer" class="shopee-btn mt-3" aria-label="Mua ${escapeHTML(med.name)} trên Shopee Việt Nam">
            <svg class="icon-sm flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>Mua trên Shopee</span>
          </a>
        </div>
      `;
    }).join('');
  }

  switchTreatmentTab(tab) {
    this.treatmentTab = tab === 'chemical' ? 'chemical' : 'organic';
    const organicActive = this.treatmentTab === 'organic';

    const organicButton = getElement('tabOrganicBtn') || getElement('organicTab');
    const chemicalButton = getElement('tabChemicalBtn') || getElement('chemicalTab');
    const organicPanel = getElement('organicTreatmentPanel') || getElement('organicPanel');
    const chemicalPanel = getElement('chemicalTreatmentPanel') || getElement('chemicalPanel');

    if (organicButton) {
      organicButton.setAttribute('aria-selected', String(organicActive));
      organicButton.classList.toggle('active', organicActive);
    }
    if (chemicalButton) {
      chemicalButton.setAttribute('aria-selected', String(!organicActive));
      chemicalButton.classList.toggle('active', !organicActive);
    }
    setHidden(organicPanel, !organicActive);
    setHidden(chemicalPanel, organicActive);

    if (organicPanel) organicPanel.setAttribute('aria-hidden', String(!organicActive));
    if (chemicalPanel) chemicalPanel.setAttribute('aria-hidden', String(organicActive));
  }

  setTankCapacity(liters) {
    const parsedCapacity = Number(liters);
    this.tankCapacity = Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 16;

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.tank-btn').forEach(button => {
        const isActive = Number(button.getAttribute('data-capacity')) === this.tankCapacity;
        button.setAttribute('aria-pressed', String(isActive));
        button.classList.toggle('active', isActive);
      });
    }

    return this.renderTankDosage();
  }

  renderTankDosage() {
    const output = getElement('dosageOutputText') || getElement('tankDosageResult');
    if (!output) return null;

    if (!this.currentDosageInstruction) {
      output.textContent = 'Chọn dung tích bình để xem liều pha.';
      return null;
    }

    const result = DosageCalculator.calculateTankDosage(
      this.currentDosageInstruction,
      this.tankCapacity
    );
    output.textContent = result.calculatedDosageText;
    return result;
  }

  /**
   * ==========================================
   * VIRTUAL GARDEN SIMULATION ENGINE METHODS
   * ==========================================
   */

  renderGarden() {
    const grid = getElement('gardenPlotsGrid');
    if (!grid) return;

    const plots = GardenService.getPlots();
    const totalPlots = getElement('gardenTotalPlots');
    const healthyPlots = getElement('gardenHealthyPlots');
    const warningPlots = getElement('gardenWarningPlots');
    const readyPlots = getElement('gardenReadyPlots');

    const totalCount = plots.length;
    const healthyCount = plots.filter(p => (p.healthScore ?? 100) >= 80 && (!p.activeDiseases || p.activeDiseases.length === 0)).length;
    const warningCount = plots.filter(p => (p.healthScore ?? 100) < 80 || (p.activeDiseases && p.activeDiseases.length > 0)).length;
    const readyCount = plots.filter(p => (p.growthProgress ?? 0) >= 90).length;

    if (totalPlots) totalPlots.textContent = String(totalCount);
    if (healthyPlots) healthyPlots.textContent = String(healthyCount);
    if (warningPlots) warningPlots.textContent = String(warningCount);
    if (readyPlots) readyPlots.textContent = String(readyCount);

    // Weather impact banner for virtual garden
    const weatherBanner = getElement('gardenWeatherBanner');
    const weatherText = getElement('gardenWeatherText');
    if (weatherBanner) {
      if (this.currentWeather && (this.currentWeather.humidity > 80 || this.currentWeather.risk?.level === 'Nguy cơ Cao' || this.currentWeather.temp > 34)) {
        if (weatherText) {
          weatherText.textContent = this.currentWeather.risk?.warningText || `Cảnh báo vi khí hậu (${this.currentWeather.regionName || 'khu vực'}): Độ ẩm cao ${this.currentWeather.humidity}%, nguy cơ bùng phát nấm lá và bệnh đạo ôn tăng cao!`;
        }
        setHidden(weatherBanner, false);
      } else {
        setHidden(weatherBanner, true);
      }
    }

    if (plots.length === 0) {
      grid.innerHTML = `
        <div class="empty-garden col-span-full">
          <span class="empty-garden-icon" aria-hidden="true">🌱</span>
          <h3 class="text-lg font-extrabold text-ink">Chưa có thửa ruộng nào trong vườn</h3>
          <p class="text-sm text-muted max-w-md">Bắt đầu mô phỏng mùa vụ bằng cách tạo thửa ruộng đầu tiên cho Lúa ST25, Sầu riêng Ri6, Cà phê hoặc Rau màu.</p>
          <button id="emptyAddPlotBtn" type="button" class="btn btn-primary mt-2">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>
            <span>+ Thêm thửa ruộng đầu tiên</span>
          </button>
        </div>
      `;
      const emptyAddBtn = getElement('emptyAddPlotBtn');
      if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', () => this.openAddPlotModal());
      }
      return;
    }

    grid.innerHTML = plots.map(plot => {
      const hasDiseases = Array.isArray(plot.activeDiseases) && plot.activeDiseases.length > 0;
      const isReady = (plot.growthProgress ?? 0) >= 90;
      const healthScore = Math.max(0, Math.min(100, Number(plot.healthScore) || 0));
      const moisture = Math.max(0, Math.min(100, Number(plot.moisture ?? plot.waterLevel) || 0));
      const growthProgress = Math.max(0, Math.min(100, Number(plot.growthProgress) || 0));
      const healthClass = healthScore < 50 ? 'is-danger' : healthScore < 80 ? 'is-warning' : '';
      const cardClass = `plot-card ${hasDiseases ? 'is-sick' : ''} ${isReady ? 'is-ready' : ''}`;

      const template = PLANT_TEMPLATES.find(t => t.key === plot.plantKey) || PLANT_TEMPLATES[0];
      const iconSvg = renderIcon(template.iconName || 'leaf', { size: 28, strokeWidth: 1.8 });

      const diseasesHtml = hasDiseases ? `
        <div class="flex flex-wrap gap-1 mt-1">
          ${plot.activeDiseases.map(d => `
            <span class="plot-disease-tag">
              <svg class="icon-sm flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v4M12 16.5v.01"/></svg>
              <span>${escapeHTML(d.diseaseName || d.diseaseNameVi || 'Bệnh hại')}</span>
            </span>
          `).join('')}
        </div>
      ` : '';

      return `
        <article class="${cardClass}" data-plot-id="${escapeHTML(plot.id)}">
          <div class="plot-header">
            <div class="min-w-0">
              <span class="badge ${template.badgeClass || 'badge-success'} mb-1">${escapeHTML(plot.category || template.category)}</span>
              <h3 class="plot-title">${escapeHTML(plot.name)}</h3>
              <p class="plot-crop-type">${escapeHTML(template.name)} · Ngày ${escapeHTML(plot.daysElapsed || 1)}</p>
            </div>
            <button type="button" class="icon-btn btn-delete-plot" data-action="delete" data-plot-id="${escapeHTML(plot.id)}" aria-label="Xóa thửa ruộng" title="Xóa thửa ruộng">
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7l1-3h4l1 3"/></svg>
            </button>
          </div>

          <div class="plot-visual-row">
            <div class="plot-icon-wrap" aria-hidden="true">
              ${iconSvg}
            </div>
            <div class="plot-stage-info">
              <span class="plot-stage-badge">${escapeHTML(plot.stageLabel || 'Đang sinh trưởng')}</span>
              <span class="plot-days-count">Chu kỳ: ${growthProgress}% / ${escapeHTML(plot.growthCycleDays || template.growthCycleDays)} ngày</span>
            </div>
          </div>

          <div class="plot-meters">
            <div class="meter-row">
              <div class="meter-label-row">
                <span>Tiến độ sinh trưởng</span>
                <span class="meter-val">${growthProgress}%</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill-growth" style="width: ${growthProgress}%"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label-row">
                <span>Sức khỏe cây trồng</span>
                <span class="meter-val">${healthScore}%</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill-health ${healthClass}" style="width: ${healthScore}%"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label-row">
                <span>Độ ẩm đất</span>
                <span class="meter-val">${moisture}%</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill-moisture" style="width: ${moisture}%"></div>
              </div>
            </div>
          </div>

          ${diseasesHtml}

          <div class="care-btn-group">
            <button type="button" class="care-btn" data-action="water" data-plot-id="${escapeHTML(plot.id)}">
              <svg class="icon-sm text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7.2 17.5h10.3a4 4 0 0 0 .6-7.95A6.2 6.2 0 0 0 6.25 8.2a4.65 4.65 0 0 0 .95 9.3Z"/><path d="m8 20-1 2M12 20l-1 2M16 20l-1 2"/></svg>
              <span>Tưới nước</span>
            </button>
            <button type="button" class="care-btn" data-action="fertilize" data-plot-id="${escapeHTML(plot.id)}">
              <svg class="icon-sm text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20V7"/><path d="M12 11c-3.8-1.1-6-3.2-6.6-6.1C9.1 4.9 11.2 6 12 8.3"/><path d="M12 14.2c3.8-1.1 6-3.2 6.6-6.1-3.7 0-5.8 1.1-6.6 3.4"/><path d="M6 20h12"/></svg>
              <span>Bón phân</span>
            </button>
            <button type="button" class="care-btn" data-action="treat" data-plot-id="${escapeHTML(plot.id)}" ${hasDiseases ? '' : 'disabled'}>
              <svg class="icon-sm text-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 3h6"/><path d="M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.1 15h9.8"/></svg>
              <span>Trị bệnh</span>
            </button>
            <button type="button" class="care-btn ${isReady ? 'care-btn-harvest' : ''}" data-action="harvest" data-plot-id="${escapeHTML(plot.id)}" ${isReady ? '' : 'disabled'}>
              <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4 12.5 5 5L20 6.5"/></svg>
              <span>${isReady ? 'Thu hoạch ngay!' : 'Thu hoạch'}</span>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  handleGardenAction(action, plotId) {
    if (!plotId) return;

    if (action === 'water') {
      GardenService.performCare(plotId, 'water');
      this.showToast('Đã tưới nước bổ sung độ ẩm đất.', 'success');
      this.renderGarden();
    } else if (action === 'fertilize') {
      GardenService.performCare(plotId, 'fertilize');
      this.showToast('Đã bón phân vi sinh thúc đẩy tăng trưởng.', 'success');
      this.renderGarden();
    } else if (action === 'treat') {
      GardenService.performCare(plotId, 'treat');
      this.showToast('Đã phun chế phẩm sinh học trị sạch mầm bệnh.', 'success');
      this.renderGarden();
    } else if (action === 'harvest') {
      const result = GardenService.performCare(plotId, 'harvest');
      if (result && result.success === false) {
        this.showToast(result.message || 'Cây chưa đạt độ chín thu hoạch.', 'warning');
      } else {
        this.showToast('Thu hoạch mùa vụ thành công! Vụ mùa mới đã sẵn sàng.', 'success');
      }
      this.renderGarden();
    } else if (action === 'delete') {
      GardenService.deletePlot(plotId);
      this.showToast('Đã xóa thửa ruộng khỏi vườn.', 'info');
      this.renderGarden();
    }
  }

  openAddPlotModal() {
    const modal = getElement('addPlotModal');
    const select = getElement('newPlotTemplateSelect');
    const nameInput = getElement('newPlotNameInput');
    const notesInput = getElement('newPlotNotesInput');

    if (select) {
      select.innerHTML = PLANT_TEMPLATES.map(template => (
        `<option value="${escapeHTML(template.key)}">${escapeHTML(template.name)} (${escapeHTML(template.category)})</option>`
      )).join('');
    }

    if (nameInput) nameInput.value = '';
    if (notesInput) notesInput.value = '';

    setHidden(modal, false);
    nameInput?.focus?.();
  }

  closeAddPlotModal() {
    setHidden(getElement('addPlotModal'), true);
  }

  confirmAddPlot() {
    const select = getElement('newPlotTemplateSelect');
    const nameInput = getElement('newPlotNameInput');
    const notesInput = getElement('newPlotNotesInput');

    const templateKey = select?.value || 'rice';
    const customName = nameInput?.value?.trim() || '';
    const notes = notesInput?.value?.trim() || '';

    const newPlot = GardenService.addPlot(templateKey, customName, notes);
    this.closeAddPlotModal();
    this.showToast(`Đã tạo thửa ruộng “${newPlot.name}” thành công!`, 'success');
    this.renderGarden();
    return newPlot;
  }

  assignDiagnosisToGarden() {
    if (!this.currentDiagnosis) {
      this.showToast('Chưa có kết quả chẩn đoán nào để gán vào vườn.', 'warning');
      return null;
    }

    const plots = GardenService.getPlots();
    let targetPlot = plots.find(p => (
      p.plantKey === this.selectedCrop ||
      (this.currentDiagnosis.cropName && p.name.toLowerCase().includes(this.currentDiagnosis.cropName.toLowerCase()))
    ));

    if (!targetPlot && plots.length > 0) {
      targetPlot = plots[0];
    } else if (!targetPlot) {
      targetPlot = GardenService.addPlot(this.selectedCrop || 'rice', `Thửa ruộng ${this.currentDiagnosis.cropName || 'mới'}`);
    }

    GardenService.logDisease(targetPlot.id, {
      diseaseName: this.currentDiagnosis.diseaseNameVi,
      severity: this.currentDiagnosis.severityLevel,
      diagnosedAt: new Date().toISOString(),
      notes: this.currentDiagnosis.symptomsSummary
    });

    this.showToast(`Đã gán ca bệnh “${this.currentDiagnosis.diseaseNameVi}” vào thửa “${targetPlot.name}”.`, 'success');
    this.switchNavTab('garden');
    return targetPlot;
  }

  bindGardenEvents() {
    if (typeof document === 'undefined') return;

    const addPlotBtn = getElement('addPlotBtn');
    const waterAllBtn = getElement('waterAllBtn');
    const resetGardenBtn = getElement('resetGardenBtn');
    const closeAddModalBtn = getElement('closeAddPlotModalBtn');
    const cancelAddPlotBtn = getElement('cancelAddPlotBtn');
    const addPlotForm = getElement('addPlotForm');
    const gardenGrid = getElement('gardenPlotsGrid');
    const linkToGardenBtn = getElement('linkToGardenBtn');

    if (addPlotBtn && addPlotBtn.dataset.agrivietGardenBound !== 'true') {
      addPlotBtn.dataset.agrivietGardenBound = 'true';
      addPlotBtn.addEventListener('click', () => this.openAddPlotModal());
    }

    if (waterAllBtn && waterAllBtn.dataset.agrivietGardenBound !== 'true') {
      waterAllBtn.dataset.agrivietGardenBound = 'true';
      waterAllBtn.addEventListener('click', () => {
        const plots = GardenService.getPlots();
        plots.forEach(p => GardenService.performCare(p.id, 'water'));
        this.showToast('Đã tưới nước cho toàn bộ các thửa ruộng.', 'success');
        this.renderGarden();
      });
    }

    if (resetGardenBtn && resetGardenBtn.dataset.agrivietGardenBound !== 'true') {
      resetGardenBtn.dataset.agrivietGardenBound = 'true';
      resetGardenBtn.addEventListener('click', () => {
        GardenService.resetGarden();
        this.showToast('Đã đặt lại vườn ảo về trạng thái mẫu ban đầu.', 'info');
        this.renderGarden();
      });
    }

    if (closeAddModalBtn && closeAddModalBtn.dataset.agrivietGardenBound !== 'true') {
      closeAddModalBtn.dataset.agrivietGardenBound = 'true';
      closeAddModalBtn.addEventListener('click', () => this.closeAddPlotModal());
    }

    if (cancelAddPlotBtn && cancelAddPlotBtn.dataset.agrivietGardenBound !== 'true') {
      cancelAddPlotBtn.dataset.agrivietGardenBound = 'true';
      cancelAddPlotBtn.addEventListener('click', () => this.closeAddPlotModal());
    }

    if (addPlotForm && addPlotForm.dataset.agrivietGardenBound !== 'true') {
      addPlotForm.dataset.agrivietGardenBound = 'true';
      addPlotForm.addEventListener('submit', event => {
        event.preventDefault();
        this.confirmAddPlot();
      });
    }

    if (linkToGardenBtn && linkToGardenBtn.dataset.agrivietGardenBound !== 'true') {
      linkToGardenBtn.dataset.agrivietGardenBound = 'true';
      linkToGardenBtn.addEventListener('click', () => this.assignDiagnosisToGarden());
    }

    if (gardenGrid && gardenGrid.dataset.agrivietGardenBound !== 'true') {
      gardenGrid.dataset.agrivietGardenBound = 'true';
      gardenGrid.addEventListener('click', event => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const action = button.getAttribute('data-action');
        const plotId = button.getAttribute('data-plot-id');
        if (action && plotId) {
          this.handleGardenAction(action, plotId);
        }
      });
    }
  }

  /**
   * ==========================================
   * PHARMACY & SHOPEE FINDER METHODS
   * ==========================================
   */

  renderMedicineCatalog(query = this.medicineSearchQuery, category = this.medicineCategory) {
    const grid = getElement('medicineCatalogGrid');
    const badge = getElement('medicineCountBadge');
    if (!grid) return;

    const medicines = MedicineService.searchMedicines(query, category);

    if (badge) {
      badge.textContent = `${medicines.length} sản phẩm`;
    }

    if (medicines.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-10 text-center rounded-lg border border-border bg-surface-soft">
          <p class="text-base font-bold text-ink">Không tìm thấy sản phẩm phù hợp</p>
          <p class="text-sm text-muted mt-1">Thử tìm kiếm với từ khóa khác như "Trichoderma", "đạo ôn", "sầu riêng"...</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = medicines.map(med => {
      const isBio = med.category === 'bio';
      const categoryBadge = isBio
        ? '<span class="badge badge-bio">Sinh học VietGAP</span>'
        : '<span class="badge badge-chem">Hóa học đặc trị</span>';
      const shopeeUrl = MedicineService.getShopeeSearchUrl(med);

      return `
        <article class="medicine-card" data-medicine-id="${escapeHTML(med.id)}">
          <div class="medicine-card-header">
            <div class="min-w-0">
              ${categoryBadge}
              <h3 class="medicine-title mt-2">${escapeHTML(med.name)}</h3>
              <p class="medicine-ingredient mt-1">${escapeHTML(med.activeIngredient)}</p>
            </div>
          </div>

          <div class="medicine-tags">
            ${(med.targetDiseases || []).map(d => `<span class="medicine-tag">${escapeHTML(d)}</span>`).join('')}
          </div>

          <div class="medicine-price-box">
            <span class="medicine-price-label">Giá thị trường:</span>
            <span class="medicine-price">${escapeHTML(med.priceDisplay)}</span>
          </div>

          <div class="dosage-box">
            <p><strong>Liều pha:</strong> ${escapeHTML(med.dosageGuide)}</p>
            <p class="mt-1"><strong>Cách ly PHI:</strong> ${med.quarantineDays > 0 ? `${med.quarantineDays} ngày` : '0 ngày (an toàn VietGAP)'}</p>
            <p class="mt-1 text-subtle text-[11px]">${escapeHTML(med.safetyNotes)}</p>
          </div>

          <a href="${escapeHTML(shopeeUrl)}" target="_blank" rel="noopener noreferrer" class="shopee-btn" aria-label="Tìm mua ${escapeHTML(med.name)} trên Shopee Việt Nam">
            <svg class="icon-sm flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>Tìm mua trên Shopee</span>
          </a>
        </article>
      `;
    }).join('');
  }

  bindMedicineEvents() {
    if (typeof document === 'undefined') return;

    const searchInput = getElement('medicineSearchInput');
    if (searchInput && searchInput.dataset.agrivietMedicineBound !== 'true') {
      searchInput.dataset.agrivietMedicineBound = 'true';
      searchInput.addEventListener('input', event => {
        this.medicineSearchQuery = event.target.value;
        this.renderMedicineCatalog();
      });
    }

    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
      if (pill.dataset.agrivietMedicineBound === 'true') return;
      pill.dataset.agrivietMedicineBound = 'true';
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category') || 'all';
        this.medicineCategory = cat;
        filterPills.forEach(p => {
          const active = p === pill;
          p.classList.toggle('active', active);
          p.setAttribute('aria-checked', String(active));
        });
        this.renderMedicineCatalog();
      });
    });
  }

  /**
   * ==========================================
   * SPEECH & VOICE ASSISTANT METHODS
   * ==========================================
   */

  setupSpeech() {
    this.setupSpeechRecognition();
  }

  setupSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'vi-VN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateMicUI(true);
      };

      this.recognition.onresult = event => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (!transcript) return;
        const input = getElement('voiceTextInput');
        if (input) input.value = transcript;
        void this.submitVoiceQuery(transcript, { preserveTranscript: true });
      };

      this.recognition.onerror = event => {
        console.warn('[AgriVietApp] Speech recognition error:', event.error);
        this.isRecording = false;
        this.updateMicUI(false);
        this.showToast(`Nhận diện giọng nói: ${event.error || 'không xác định'}.`, 'warning');
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicUI(false);
      };
    } catch (error) {
      this.recognition = null;
      console.warn('[AgriVietApp] Speech recognition unavailable:', error);
    }
  }

  toggleRecording() {
    if (!this.recognition) {
      this.showToast('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng nhập câu hỏi bằng bàn phím.', 'warning');
      return;
    }

    try {
      if (this.isRecording) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    } catch (error) {
      console.warn('[AgriVietApp] Unable to toggle speech recognition:', error);
      this.isRecording = false;
      this.updateMicUI(false);
    }
  }

  updateMicUI(recording) {
    const button = getElement('voiceRecordBtn');
    const waveform = getElement('voiceWaveform');
    const status = getElement('voiceRecordStatus');

    if (button) {
      button.dataset.recording = String(recording);
      button.setAttribute('aria-pressed', String(recording));
      button.setAttribute('aria-label', recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm');
    }
    setHidden(waveform, !recording);
    if (status) status.textContent = recording ? 'ĐANG NGHE' : 'SẴN SÀNG';
  }

  async submitVoiceQuery(question, { preserveTranscript = false } = {}) {
    const cleanQuestion = String(question ?? '').trim();
    if (!cleanQuestion) return '';

    const input = getElement('voiceTextInput');
    if (input && !preserveTranscript) input.value = '';

    const chatStream = getElement('voiceChatStream');
    if (chatStream && typeof document !== 'undefined') {
      const userRow = document.createElement('div');
      userRow.className = 'chat-row is-user';
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble';
      userBubble.textContent = cleanQuestion;
      const userAvatar = document.createElement('span');
      userAvatar.className = 'chat-avatar';
      userAvatar.setAttribute('aria-hidden', 'true');
      userAvatar.textContent = 'Bạn';
      userRow.append(userBubble, userAvatar);
      chatStream.append(userRow);
      chatStream.scrollTop = chatStream.scrollHeight;
    }

    const weather = this.currentWeather;
    const weatherSummary = weather
      ? `${weather.regionName || weather.locationName || 'Khu vực theo dõi'}: ${weather.temp ?? weather.temperature ?? '—'}°C, ẩm độ ${weather.humidity ?? '—'}%, mưa ${weather.rain ?? weather.precipitation ?? '—'} mm, ${weather.isOffline ? 'dữ liệu ước tính khu vực' : 'dữ liệu trực tuyến'}.`
      : 'Chưa có dữ liệu thời tiết khu vực.';
    const context = {
      ...(this.currentDiagnosis
        ? { crop: this.currentDiagnosis.cropName, disease: this.currentDiagnosis.diseaseNameVi }
        : {}),
      weatherSummary,
      ...(weather ? {
        weather: {
          region: weather.regionName || weather.locationName || 'Khu vực theo dõi',
          temperature: weather.temp ?? weather.temperature ?? null,
          humidity: weather.humidity ?? null,
          precipitation: weather.rain ?? weather.precipitation ?? null,
          isOffline: weather.isOffline === true
        }
      } : {})
    };
    const answer = await GeminiService.askFarmingAssistant(cleanQuestion, context, {
      model: this.selectedModel,
      apiKey: this.apiKey
    });

    if (chatStream && typeof document !== 'undefined') {
      const answerRow = document.createElement('div');
      answerRow.className = 'chat-row';
      const answerAvatar = document.createElement('span');
      answerAvatar.className = 'chat-avatar';
      answerAvatar.setAttribute('aria-hidden', 'true');
      answerAvatar.textContent = 'AI';
      const answerBubble = document.createElement('div');
      answerBubble.className = 'chat-bubble';
      const answerParagraph = document.createElement('p');
      answerParagraph.textContent = String(answer ?? '');
      const readButton = document.createElement('button');
      readButton.type = 'button';
      readButton.className = 'btn btn-quiet btn-read-aloud';
      readButton.setAttribute('aria-label', 'Nghe câu trả lời');
      const iconDocument = new DOMParser().parseFromString(renderIcon('volume', { size: 16 }), 'image/svg+xml');
      const icon = iconDocument.documentElement;
      if (icon?.nodeName.toLowerCase() === 'svg') readButton.append(document.importNode(icon, true));
      const readLabel = document.createElement('span');
      readLabel.textContent = 'Nghe câu trả lời';
      readButton.append(readLabel);
      readButton.addEventListener('click', () => this.speakText(answer));
      answerBubble.append(answerParagraph, readButton);
      answerRow.append(answerAvatar, answerBubble);
      chatStream.append(answerRow);
      chatStream.scrollTop = chatStream.scrollHeight;
    }

    this.speakText(answer);
    return answer;
  }

  speakText(text) {
    if (!this.synth || typeof text !== 'string' || !text.trim()) return;

    const Utterance = typeof globalThis.SpeechSynthesisUtterance === 'function'
      ? globalThis.SpeechSynthesisUtterance
      : typeof window !== 'undefined' ? window.SpeechSynthesisUtterance : null;
    if (!Utterance) return;

    this.synth.cancel?.();
    const utterance = new Utterance(text.replace(/[*#_`]/g, '').trim());
    utterance.lang = 'vi-VN';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = this.synth.getVoices?.() || [];
    const vietnameseVoice = voices.find(voice => String(voice.lang).toLowerCase().startsWith('vi'));
    if (vietnameseVoice) utterance.voice = vietnameseVoice;
    this.synth.speak?.(utterance);
  }

  /**
   * ==========================================
   * WEATHER RADAR METHODS
   * ==========================================
   */

  async loadWeather(regionIdx = 0) {
    const container = getElement('weatherData');
    if (!container) return null;

    const index = Number.isInteger(Number(regionIdx)) ? Number(regionIdx) : 0;
    const regionSelect = getElement('weatherRegionSelect');
    if (regionSelect) regionSelect.value = String(index);

    try {
      const data = typeof WeatherRadarService.fetchRegionalWeather === 'function'
        ? await WeatherRadarService.fetchRegionalWeather(index)
        : await WeatherRadarService.getAgriculturalRisk();

      const temperature = data.temp ?? data.temperature ?? 0;
      const humidity = data.humidity ?? 0;
      const precipitation = data.rain ?? data.precipitation ?? 0;
      const wind = data.wind ?? '—';
      const risk = data.risk || data.riskEvaluation || {};

      const location = getElement('weatherLocation');
      const temperatureElement = getElement('weatherTemperature');
      const humidityElement = getElement('weatherHumidity');
      const precipitationElement = getElement('weatherPrecipitation');
      const windElement = getElement('weatherWind');
      const riskLevel = getElement('fungalRiskLevel');
      const riskScore = getElement('fungalRiskScore');
      const riskMeter = getElement('fungalRiskMeter');
      const riskAlert = getElement('fungalRiskAlert');
      const weatherStatusBadge = getElement('weatherStatusBadge');

      this.currentWeather = data;
      if (location) location.textContent = `${data.regionName || data.locationName || 'Khu vực theo dõi'} · ${data.mainCrops || ''}`;
      if (weatherStatusBadge) {
        const isOffline = data.isOffline === true;
        weatherStatusBadge.className = `badge ${isOffline ? 'badge-warning' : 'badge-success'}`;
        weatherStatusBadge.textContent = isOffline ? 'Dữ liệu ước tính khu vực' : 'Đồng bộ tự động';
      }
      if (temperatureElement) temperatureElement.textContent = `${temperature}°C`;
      if (humidityElement) humidityElement.textContent = `${humidity}%`;
      if (precipitationElement) precipitationElement.textContent = `${precipitation} mm`;
      if (windElement) windElement.textContent = typeof wind === 'number' ? `${wind} km/h` : String(wind);
      if (riskLevel) {
        riskLevel.textContent = risk.level || 'Chưa xác định';
        riskLevel.className = `badge ${this.getRiskBadgeClass(risk)}`;
      }
      if (riskScore) riskScore.textContent = String(risk.score ?? 0);
      if (riskMeter) riskMeter.style.width = `${Math.max(0, Math.min(100, Number(risk.score) || 0))}%`;
      if (riskAlert) riskAlert.textContent = risk.warningText || 'Chưa có cảnh báo thời tiết.';

      this.renderHourlyTrend(data.hourly);

      // Link real-time weather effects to the virtual garden
      GardenService.applyWeatherEffect(data);

      return data;
    } catch (error) {
      console.error('[AgriVietApp] Weather load failed:', error);
      this.showToast('Không tải được dữ liệu thời tiết khu vực.', 'warning');
      return null;
    }
  }

  getRiskBadgeClass(risk) {
    const score = Number(risk?.score);
    if (risk?.level === 'Nguy cơ Cao' || score >= 75) return 'badge-alert';
    if (risk?.level === 'Nguy cơ Trung bình' || score >= 45) return 'badge-warning';
    return 'badge-success';
  }

  renderHourlyTrend(hourly) {
    const trend = getElement('hourlyTrend');
    if (!trend) return;

    trend.innerHTML = '';

    const humidityValues = Array.isArray(hourly?.relative_humidity_2m)
      ? hourly.relative_humidity_2m.slice(0, 8)
      : [];
    const times = Array.isArray(hourly?.time) ? hourly.time.slice(0, humidityValues.length) : [];

    if (!humidityValues.length) return;

    const min = Math.min(...humidityValues);
    const max = Math.max(...humidityValues);
    trend.innerHTML = humidityValues.map((value, index) => {
      const ratio = max === min ? 0.65 : (value - min) / (max - min);
      const height = Math.round(32 + ratio * 68);
      const label = times[index] ? String(times[index]).slice(11, 16) : `${index + 1}h`;
      return `<div class="trend-column"><span class="trend-bar" style="height: ${height}px" title="${escapeHTML(value)}%"></span><span class="trend-label">${escapeHTML(label)}</span></div>`;
    }).join('');
  }

  /**
   * ==========================================
   * VIETGAP LOGBOOK METHODS
   * ==========================================
   */

  renderLogbook() {
    const tableBody = getElement('logbookList') || (
      typeof document !== 'undefined' ? document.querySelector('#logbookTable tbody') : null
    );
    if (!tableBody) return;

    const logs = LogbookService.getLogs();
    const total = getElement('logbookTotal');
    const open = getElement('logbookOpen');
    const resolved = getElement('logbookResolved');

    if (total) total.textContent = String(logs.length);
    if (open) open.textContent = String(logs.filter(log => log.status === 'Đang theo dõi').length);
    if (resolved) resolved.textContent = String(logs.filter(log => log.status === 'Đã khỏi bệnh').length);

    if (!logs.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="py-12 text-center">Chưa có ghi chép. Hãy lưu kết quả chẩn đoán đầu tiên.</td></tr>';
      return;
    }

    tableBody.innerHTML = logs.map(log => {
      const severityClass = log.severityLevel === 'Nghiêm trọng' ? 'badge-alert' : 'badge-warning';
      return `
        <tr>
          <td>${escapeHTML(new Date(log.createdAt).toLocaleDateString('vi-VN'))}</td>
          <td>${escapeHTML(log.cropName)}</td>
          <td>${escapeHTML(log.diseaseNameVi)}</td>
          <td><span class="badge ${severityClass}">${escapeHTML(log.severityLevel)}</span></td>
          <td>
            <select data-log-id="${escapeHTML(log.id)}" class="status-select field-control">
              <option value="Đang theo dõi" ${log.status === 'Đang theo dõi' ? 'selected' : ''}>Đang theo dõi</option>
              <option value="Đã xử lý" ${log.status === 'Đã xử lý' ? 'selected' : ''}>Đã xử lý</option>
              <option value="Đã khỏi bệnh" ${log.status === 'Đã khỏi bệnh' ? 'selected' : ''}>Đã khỏi bệnh</option>
            </select>
          </td>
          <td><button type="button" data-delete-id="${escapeHTML(log.id)}" class="btn btn-quiet btn-delete-log">Xóa</button></td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', event => {
        LogbookService.updateStatus(event.target.getAttribute('data-log-id'), event.target.value);
        this.renderLogbook();
        this.showToast('Đã cập nhật tiến độ điều trị.', 'info');
      });
    });

    tableBody.querySelectorAll('.btn-delete-log').forEach(button => {
      button.addEventListener('click', event => {
        LogbookService.deleteLog(event.currentTarget.getAttribute('data-delete-id'));
        this.renderLogbook();
        this.showToast('Đã xóa ghi chép.', 'info');
      });
    });
  }

  saveCurrentDiagnosisToLogbook() {
    if (!this.currentDiagnosis) {
      this.showToast('Chưa có kết quả chẩn đoán nào để lưu.', 'warning');
      return null;
    }

    const entry = LogbookService.addLog({
      ...this.currentDiagnosis,
      thumbnail: this.currentImageBase64,
      location: 'Vườn nhà'
    });
    this.renderLogbook();
    this.showToast(`Đã lưu “${entry.diseaseNameVi}” vào nhật ký đồng ruộng.`, 'success');
    return entry;
  }

  saveCurrentToLogbook() {
    return this.saveCurrentDiagnosisToLogbook();
  }

  exportLogbookCsv() {
    const csvContent = LogbookService.exportToCSV();
    if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') {
      return csvContent;
    }

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agriviet-nhat-ky-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL?.(url);
    this.showToast('Đã xuất file báo cáo CSV.', 'success');
    return csvContent;
  }

  exportCSV() {
    return this.exportLogbookCsv();
  }

  showToast(message, type = 'info') {
    const toast = getElement('toast');
    if (!toast) return;

    if (this._toastTimer) clearTimeout(this._toastTimer);
    toast.dataset.type = type;
    toast.textContent = String(message ?? '');
    toast.classList.add('is-visible');
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3500);
  }

  saveApiKey(key) {
    const inputValue = key ?? getElement('apiKeyInput')?.value ?? '';
    this.apiKey = String(inputValue).trim();

    const storage = getStorage();
    if (this.apiKey) {
      storage?.setItem('agriviet_gemini_api_key', this.apiKey);
      this.showToast('Đã kích hoạt Google Gemini API.', 'success');
    } else {
      storage?.removeItem('agriviet_gemini_api_key');
      this.showToast('Đã chuyển về bộ dữ liệu ngoại tuyến.', 'info');
    }

    this.updateApiKeyStatus();
    this.closeApiKeyModal();
    return this.apiKey;
  }

  async updateApiKeyStatus() {
    const status = getElement('apiKeyStatus');
    const dot = getElement('apiKeyStatusDot');
    let isConnected = Boolean(this.apiKey);
    if (!isConnected && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (data.hasServerApiKey) isConnected = true;
        }
      } catch {
        // Ignore in offline or isolated test environment
      }
    }
    if (status) status.textContent = isConnected ? 'API đã kết nối' : 'API chưa kết nối';
    if (dot) dot.classList.toggle('is-connected', isConnected);
  }

  openApiKeyModal() {
    const modal = getElement('apiKeyModal');
    const input = getElement('apiKeyInput');
    if (input) input.value = this.apiKey;
    setHidden(modal, false);
    input?.focus?.();
  }

  closeApiKeyModal() {
    setHidden(getElement('apiKeyModal'), true);
  }

  applyTheme(theme = this.theme) {
    this.theme = theme === 'dark' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.theme);
      const themeButton = getElement('themeToggleBtn');
      if (themeButton) {
        themeButton.setAttribute('aria-pressed', String(this.theme === 'dark'));
        themeButton.setAttribute('title', this.theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối');
      }
    }
    getStorage()?.setItem('agriviet_theme', this.theme);
    this.updateApiKeyStatus();
    return this.theme;
  }

  toggleTheme() {
    return this.applyTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    this.bindNavigation();
    this.bindModelToggle();
    this.bindDropzoneAndUpload();
    this.bindPresets();
    this.bindGardenEvents();
    this.bindMedicineEvents();

    const themeButton = getElement('themeToggleBtn');
    if (themeButton && themeButton.dataset.agrivietBound !== 'true') {
      themeButton.dataset.agrivietBound = 'true';
      themeButton.addEventListener('click', () => this.toggleTheme());
    }

    const organicButton = getElement('tabOrganicBtn');
    const chemicalButton = getElement('tabChemicalBtn');
    if (organicButton && organicButton.dataset.agrivietBound !== 'true') {
      organicButton.dataset.agrivietBound = 'true';
      organicButton.addEventListener('click', () => this.switchTreatmentTab('organic'));
    }
    if (chemicalButton && chemicalButton.dataset.agrivietBound !== 'true') {
      chemicalButton.dataset.agrivietBound = 'true';
      chemicalButton.addEventListener('click', () => this.switchTreatmentTab('chemical'));
    }

    document.querySelectorAll('.tank-btn').forEach(button => {
      if (button.dataset.agrivietBound === 'true') return;
      button.dataset.agrivietBound = 'true';
      button.addEventListener('click', () => this.setTankCapacity(button.getAttribute('data-capacity')));
    });

    const analyzeButton = getElement('analyzeBtn');
    if (analyzeButton && analyzeButton.dataset.agrivietBound !== 'true') {
      analyzeButton.dataset.agrivietBound = 'true';
      analyzeButton.addEventListener('click', () => void this.runAnalysis());
    }

    const micButton = getElement('voiceRecordBtn');
    if (micButton && micButton.dataset.agrivietBound !== 'true') {
      micButton.dataset.agrivietBound = 'true';
      micButton.addEventListener('click', () => this.toggleRecording());
    }

    const voiceForm = getElement('voiceQuestionForm');
    if (voiceForm && voiceForm.dataset.agrivietBound !== 'true') {
      voiceForm.dataset.agrivietBound = 'true';
      voiceForm.addEventListener('submit', event => {
        event.preventDefault();
        void this.submitVoiceQuery(getElement('voiceTextInput')?.value);
      });
    }

    document.querySelectorAll('.voice-chip').forEach(chip => {
      if (chip.dataset.agrivietBound === 'true') return;
      chip.dataset.agrivietBound = 'true';
      chip.addEventListener('click', () => {
        const text = chip.textContent.trim();
        const input = getElement('voiceTextInput');
        if (input) input.value = text;
        void this.submitVoiceQuery(text);
      });
    });

    const speakButton = getElement('speakDiagnosisBtn');
    if (speakButton && speakButton.dataset.agrivietBound !== 'true') {
      speakButton.dataset.agrivietBound = 'true';
      speakButton.addEventListener('click', () => this.speakText(this.getDiagnosisSpeechText()));
    }

    const saveButton = getElement('saveLogbookBtn');
    if (saveButton && saveButton.dataset.agrivietBound !== 'true') {
      saveButton.dataset.agrivietBound = 'true';
      saveButton.addEventListener('click', () => this.saveCurrentDiagnosisToLogbook());
    }

    const askButton = getElement('askAboutDiseaseBtn');
    if (askButton && askButton.dataset.agrivietBound !== 'true') {
      askButton.dataset.agrivietBound = 'true';
      askButton.addEventListener('click', () => {
        this.switchNavTab('medicine');
        if (this.currentDiagnosis?.diseaseNameVi) {
          const input = getElement('medicineSearchInput');
          if (input) {
            input.value = this.currentDiagnosis.diseaseNameVi;
            this.medicineSearchQuery = this.currentDiagnosis.diseaseNameVi;
            this.renderMedicineCatalog();
          }
        }
      });
    }

    const exportButton = getElement('exportCsvBtn');
    if (exportButton && exportButton.dataset.agrivietBound !== 'true') {
      exportButton.dataset.agrivietBound = 'true';
      exportButton.addEventListener('click', () => this.exportLogbookCsv());
    }

    const regionSelect = getElement('weatherRegionSelect');
    if (regionSelect) {
      regionSelect.innerHTML = VIETNAM_REGIONS.map((region, index) => (
        `<option value="${index}">${escapeHTML(region.name)}</option>`
      )).join('');
      regionSelect.value = '0';
      if (regionSelect.dataset.agrivietBound !== 'true') {
        regionSelect.dataset.agrivietBound = 'true';
        regionSelect.addEventListener('change', event => void this.loadWeather(event.target.value));
      }
    }

    const apiButton = getElement('apiKeyBtn');
    const closeButton = getElement('closeApiKeyModalBtn');
    const cancelButton = getElement('cancelApiKeyBtn');
    const saveApiKeyButton = getElement('saveApiKeyBtn');
    if (apiButton && apiButton.dataset.agrivietBound !== 'true') {
      apiButton.dataset.agrivietBound = 'true';
      apiButton.addEventListener('click', () => this.openApiKeyModal());
    }
    if (closeButton && closeButton.dataset.agrivietBound !== 'true') {
      closeButton.dataset.agrivietBound = 'true';
      closeButton.addEventListener('click', () => this.closeApiKeyModal());
    }
    if (cancelButton && cancelButton.dataset.agrivietBound !== 'true') {
      cancelButton.dataset.agrivietBound = 'true';
      cancelButton.addEventListener('click', () => this.closeApiKeyModal());
    }
    if (saveApiKeyButton && saveApiKeyButton.dataset.agrivietBound !== 'true') {
      saveApiKeyButton.dataset.agrivietBound = 'true';
      saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
    }

    this.updateApiKeyStatus();
  }

  getDiagnosisSpeechText() {
    if (!this.currentDiagnosis) return 'Chưa có kết quả chẩn đoán để đọc.';
    return [
      `Cây trồng: ${this.currentDiagnosis.cropName}.`,
      `Chẩn đoán: ${this.currentDiagnosis.diseaseNameVi}.`,
      `Độ tin cậy ${this.currentDiagnosis.confidenceScore} phần trăm.`,
      `Triệu chứng: ${this.currentDiagnosis.symptomsSummary}.`,
      `Nguyên nhân chính: ${this.currentDiagnosis.primaryCauses}.`
    ].join(' ');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new AgriVietApp();
    window.app.init();
  });
}
