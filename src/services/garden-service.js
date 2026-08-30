/**
 * AgriViet Lens - Virtual Garden & Real-Life Farming Simulation Engine
 * Manages interactive farm plots, crop templates, growth cycles,
 * daily care actions, disease logging & treatments, weather linkages,
 * and localStorage persistence.
 */

const STORAGE_KEY = 'agriviet_virtual_garden_v1';

export const PLANT_TEMPLATES = [
  {
    key: 'rice',
    name: 'Lúa Nước ST25',
    category: 'Ngũ cốc & Lương thực',
    categoryKey: 'grain',
    growthCycleDays: 95,
    waterNeed: 'Cao (giữ nước 3-5cm)',
    idealTemp: '25°C – 32°C',
    idealHumidity: '75% – 85%',
    iconName: 'leaf',
    badgeClass: 'badge-success'
  },
  {
    key: 'durian',
    name: 'Sầu Riêng Ri6',
    category: 'Cây ăn trái lâu năm',
    categoryKey: 'fruit_tree',
    growthCycleDays: 120,
    waterNeed: 'Trung bình (thoát nước tốt)',
    idealTemp: '24°C – 30°C',
    idealHumidity: '65% – 75%',
    iconName: 'shield',
    badgeClass: 'badge-warning'
  },
  {
    key: 'coffee',
    name: 'Cà Phê Robusta Tây Nguyên',
    category: 'Cây công nghiệp',
    categoryKey: 'industrial',
    growthCycleDays: 180,
    waterNeed: 'Tưới đợt bung hoa',
    idealTemp: '22°C – 28°C',
    idealHumidity: '70% – 80%',
    iconName: 'lens',
    badgeClass: 'badge-warning'
  },
  {
    key: 'dragonfruit',
    name: 'Thanh Long Ruột Đỏ Bình Thuận',
    category: 'Cây ăn quả nhiệt đới',
    categoryKey: 'fruit_tree',
    growthCycleDays: 45,
    waterNeed: 'Thấp (chịu hạn tốt)',
    idealTemp: '26°C – 34°C',
    idealHumidity: '60% – 70%',
    iconName: 'sun',
    badgeClass: 'badge-success'
  },
  {
    key: 'vegetable',
    name: 'Rau Cải Xanh VietGAP',
    category: 'Rau màu ngắn ngày',
    categoryKey: 'vegetable',
    growthCycleDays: 30,
    waterNeed: 'Tưới ẩm hằng ngày',
    idealTemp: '20°C – 28°C',
    idealHumidity: '70% – 85%',
    iconName: 'leaf',
    badgeClass: 'badge-success'
  }
];

export class GardenService {
  /**
   * Loads all farm plots from localStorage.
   * If empty, initializes with 2 pre-seeded starter plots.
   */
  static getPlots() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Pre-seed with 2 realistic starter plots for immediate demo
        const starterPlots = [
          this._createPlotObject('rice', 'Thửa ruộng Lúa ST25 (Lô A1)'),
          this._createPlotObject('durian', 'Vườn Sầu Riêng Ri6 (Cây 4 năm)')
        ];

        starterPlots[0].growthProgress = 45;
        starterPlots[0].growthStage = 'vegetative';
        starterPlots[0].stageLabel = '🌿 Đẻ nhánh & Phát triển thân lá';
        starterPlots[0].healthScore = 95;
        starterPlots[0].moisture = 75;
        starterPlots[0].waterLevel = 75;

        starterPlots[1].growthProgress = 70;
        starterPlots[1].growthStage = 'flowering';
        starterPlots[1].stageLabel = '🌸 Ra hoa & Đậu quả';
        starterPlots[1].healthScore = 88;
        starterPlots[1].moisture = 65;
        starterPlots[1].waterLevel = 65;

        this.savePlots(starterPlots);
        return starterPlots;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('[GardenService] Error loading plots:', e);
      return [];
    }
  }

  /**
   * Internal helper to create a plot object
   */
  static _createPlotObject(plantKey, customName, notes = '') {
    const template = PLANT_TEMPLATES.find(p => p.key === plantKey) || PLANT_TEMPLATES[0];
    return {
      id: 'plot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      plantKey: template.key,
      name: customName || template.name,
      category: template.category,
      categoryKey: template.categoryKey,
      growthCycleDays: template.growthCycleDays,
      waterNeed: template.waterNeed,
      idealTemp: template.idealTemp,
      idealHumidity: template.idealHumidity,
      plantedAt: new Date().toISOString(),
      daysElapsed: 1,
      growthProgress: 0, // 0 - 100
      growthStage: 'seedling', // 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest'
      stageLabel: '🌱 Cây con bén rễ',
      healthScore: 100, // 0 - 100
      moisture: 70, // 0 - 100
      waterLevel: 70, // backwards compatibility
      fertilizerLevel: 70, // 0 - 100
      lastWatered: new Date().toISOString(),
      lastFertilized: new Date().toISOString(),
      activeDiseases: [],
      diseases: [], // backwards compatibility
      careHistory: [],
      notes: notes || '',
      weatherWarnings: [],
      isHarvested: false,
      harvestCount: 0,
      reminders: [
        {
          id: 'rem_' + Date.now() + '_1',
          title: 'Tưới nước duy trì ẩm độ đất trồng',
          dueText: 'Hôm nay',
          isDone: false
        },
        {
          id: 'rem_' + Date.now() + '_2',
          title: 'Kiểm tra sâu hại & nấm bệnh định kỳ',
          dueText: '2 ngày tới',
          isDone: false
        }
      ]
    };
  }

  /**
   * Adds a new crop plot to the virtual farm
   */
  static addPlot(templateKey, customName = '', notes = '') {
    const plots = this.getPlots();
    const newPlot = this._createPlotObject(templateKey, customName, notes);
    plots.push(newPlot);
    this.savePlots(plots);
    return newPlot;
  }

  /**
   * Retrieves a single plot by ID
   */
  static getPlotById(plotId) {
    const plots = this.getPlots();
    return plots.find(p => p.id === plotId) || null;
  }

  /**
   * Updates growthStage and stageLabel based on growthProgress percentage
   * (0-20% seedling, 21-50% vegetative, 51-80% flowering, 81-99% fruiting, 100% harvest)
   */
  static _updateStage(plot) {
    if (plot.growthProgress >= 100) {
      plot.growthStage = 'harvest';
      plot.stageLabel = '🌾 Sẵn sàng thu hoạch!';
    } else if (plot.growthProgress >= 81) {
      plot.growthStage = 'fruiting';
      plot.stageLabel = '🍎 Quả phát triển & Chín';
    } else if (plot.growthProgress >= 51) {
      plot.growthStage = 'flowering';
      plot.stageLabel = '🌸 Ra hoa & Đậu quả';
    } else if (plot.growthProgress >= 21) {
      plot.growthStage = 'vegetative';
      plot.stageLabel = '🌿 Đẻ nhánh & Phát triển thân lá';
    } else {
      plot.growthStage = 'seedling';
      plot.stageLabel = '🌱 Cây con bén rễ';
    }
  }

  /**
   * Performs care action on a plot:
   * - 'water': moisture + 35 (max 100), healthScore + 5 (max 100)
   * - 'fertilize': growthProgress + 20 (max 100), healthScore + 5, recalculate stage
   * - 'treat': clears activeDiseases, healthScore + 25 (max 100)
   * - 'harvest': if growthProgress >= 90, marks isHarvested, adds harvest record, resets for next cycle
   */
  static performCare(plotId, actionType, notes = '') {
    const plots = this.getPlots();
    const plot = plots.find(p => p.id === plotId);
    if (!plot) return null;

    const action = (actionType || '').toLowerCase();
    const now = new Date().toISOString();

    if (action === 'water') {
      plot.moisture = Math.min(100, (plot.moisture ?? 70) + 35);
      plot.waterLevel = plot.moisture;
      plot.healthScore = Math.min(100, (plot.healthScore ?? 100) + 5);
      plot.lastWatered = now;
      plot.careHistory = plot.careHistory || [];
      plot.careHistory.unshift({
        id: 'care_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        action: 'water',
        actionLabel: 'Tưới nước',
        timestamp: now,
        notes: notes || 'Tưới nước bổ sung độ ẩm đất trồng'
      });
    } else if (action === 'fertilize') {
      plot.growthProgress = Math.min(100, (plot.growthProgress ?? 0) + 20);
      plot.fertilizerLevel = Math.min(100, (plot.fertilizerLevel ?? 50) + 30);
      plot.healthScore = Math.min(100, (plot.healthScore ?? 100) + 5);
      plot.lastFertilized = now;
      this._updateStage(plot);
      plot.careHistory = plot.careHistory || [];
      plot.careHistory.unshift({
        id: 'care_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        action: 'fertilize',
        actionLabel: 'Bón phân',
        timestamp: now,
        notes: notes || 'Bón phân hữu cơ vi sinh thúc đẩy tăng trưởng'
      });
    } else if (action === 'treat') {
      plot.activeDiseases = [];
      plot.diseases = [];
      plot.healthScore = Math.min(100, (plot.healthScore ?? 50) + 25);
      plot.careHistory = plot.careHistory || [];
      plot.careHistory.unshift({
        id: 'care_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        action: 'treat',
        actionLabel: 'Điều trị bệnh',
        timestamp: now,
        notes: notes || 'Phun chế phẩm sinh học tiêu diệt mầm bệnh'
      });
    } else if (action === 'harvest') {
      if ((plot.growthProgress ?? 0) >= 90) {
        plot.isHarvested = true;
        plot.harvestCount = (plot.harvestCount || 0) + 1;
        plot.careHistory = plot.careHistory || [];
        plot.careHistory.unshift({
          id: 'care_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          action: 'harvest',
          actionLabel: 'Thu hoạch vụ mùa',
          timestamp: now,
          notes: notes || `Thu hoạch vụ thứ ${plot.harvestCount} thành công!`
        });

        // Reset plot cycle for continuous gaming simulation
        plot.growthProgress = 0;
        this._updateStage(plot);
        plot.healthScore = 100;
        plot.moisture = 70;
        plot.waterLevel = 70;
        plot.fertilizerLevel = 70;
        plot.activeDiseases = [];
        plot.diseases = [];
        plot.isHarvested = false;
      } else {
        return {
          success: false,
          message: 'Cây chưa đạt độ chín thu hoạch (yêu cầu tiến độ >= 90%)',
          plot
        };
      }
    }

    this.savePlots(plots);
    return plot;
  }

  /**
   * Logs a diagnosed crop disease onto the plot and reduces health
   */
  static logDisease(plotId, diseaseData = {}) {
    const plots = this.getPlots();
    const plot = plots.find(p => p.id === plotId);
    if (!plot) return null;

    const severity = (diseaseData.severity || diseaseData.severityLevel || 'medium').toLowerCase();
    let penalty = 20;
    if (severity.includes('high') || severity.includes('nghiêm trọng') || severity.includes('nang')) {
      penalty = 40;
    } else if (severity.includes('low') || severity.includes('nhẹ')) {
      penalty = 10;
    } else {
      penalty = 20;
    }

    plot.healthScore = Math.max(0, (plot.healthScore ?? 100) - penalty);

    const diseaseRecord = {
      id: 'dis_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      diseaseName: diseaseData.diseaseName || diseaseData.diseaseNameVi || 'Bệnh hại cây trồng',
      severity: diseaseData.severity || diseaseData.severityLevel || 'medium',
      diagnosedAt: diseaseData.diagnosedAt || new Date().toISOString(),
      notes: diseaseData.notes || diseaseData.treatment || ''
    };

    plot.activeDiseases = plot.activeDiseases || [];
    plot.activeDiseases.unshift(diseaseRecord);
    plot.diseases = plot.activeDiseases; // sync alias

    this.savePlots(plots);
    return plot;
  }

  /**
   * Applies environmental weather effects to all plots
   */
  static applyWeatherEffect(weatherData = {}) {
    const plots = this.getPlots();
    const temp = weatherData.temp ?? weatherData.temperature ?? 28;
    const humidity = weatherData.humidity ?? weatherData.relative_humidity_2m ?? 70;
    const rainProb = weatherData.rainProb ?? weatherData.pop ?? weatherData.precipitation_probability ?? 0;
    const condition = (weatherData.condition || weatherData.weather || '').toLowerCase();
    const isRaining = rainProb > 60 || condition.includes('mưa') || condition.includes('rain');

    plots.forEach(plot => {
      plot.weatherWarnings = plot.weatherWarnings || [];

      // High heat effect: decreases moisture
      if (temp > 34) {
        plot.moisture = Math.max(0, (plot.moisture ?? 70) - 18);
        plot.waterLevel = plot.moisture;
        plot.weatherWarnings.unshift({
          type: 'heat_stress',
          message: `Nắng nóng cực độ (${temp}°C) làm giảm độ ẩm đất!`,
          timestamp: new Date().toISOString()
        });
      }

      // Rain effect: increases moisture
      if (isRaining) {
        plot.moisture = Math.min(100, (plot.moisture ?? 70) + 25);
        plot.waterLevel = plot.moisture;
      }

      // High humidity + rain/fungus risk notice
      if (humidity > 85) {
        plot.weatherWarnings.unshift({
          type: 'high_humidity_fungus_risk',
          message: `Độ ẩm cao (${humidity}%) tăng nguy cơ bùng phát nấm lá và bệnh đạo ôn!`,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.savePlots(plots);
    return plots;
  }

  /**
   * Deletes a plot by ID
   */
  static deletePlot(plotId) {
    const plots = this.getPlots();
    const filtered = plots.filter(p => p.id !== plotId);
    this.savePlots(filtered);
    return true;
  }

  /**
   * Resets garden to initial starter plots
   */
  static resetGarden() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    return this.getPlots();
  }

  /**
   * Saves plots array to localStorage
   */
  static savePlots(plots) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
      }
    } catch (e) {
      console.error('[GardenService] Error saving plots:', e);
    }
  }

  // --- Backwards Compatibility Helpers for Existing UI ---
  static waterPlot(plotId) {
    return this.performCare(plotId, 'water');
  }

  static fertilizePlot(plotId, type = 'organic') {
    const notes = type === 'organic' ? 'Bón phân hữu cơ sinh học' : `Bón phân ${type}`;
    return this.performCare(plotId, 'fertilize', notes);
  }

  static attachDiagnosisToPlot(plotId, diagnosis) {
    if (!diagnosis) return null;
    return this.logDisease(plotId, {
      diseaseName: diagnosis.diseaseNameVi,
      severity: diagnosis.severityLevel,
      notes: diagnosis.organicTreatment?.title || ''
    });
  }

  static harvestPlot(plotId) {
    return this.performCare(plotId, 'harvest');
  }

  static addReminder(plotId, reminderTitle, dueText = 'Sớm nhất') {
    const plots = this.getPlots();
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !reminderTitle) return null;

    const newReminder = {
      id: 'rem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      title: reminderTitle,
      dueText: dueText || 'Hôm nay',
      isDone: false
    };

    plot.reminders = plot.reminders || [];
    plot.reminders.unshift(newReminder);
    this.savePlots(plots);
    return newReminder;
  }

  static toggleReminder(plotId, reminderId) {
    const plots = this.getPlots();
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.reminders) return false;

    const reminder = plot.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.isDone = !reminder.isDone;
      if (reminder.isDone) {
        plot.healthScore = Math.min(100, (plot.healthScore ?? 95) + 5);
      }
      this.savePlots(plots);
      return true;
    }
    return false;
  }
}
