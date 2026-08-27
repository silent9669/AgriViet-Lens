/**
 * AgriViet Lens - Agricultural Weather & Pest Risk Radar Service
 * Connects to Open-Meteo free API with reliable offline regional fallback data for Vietnam.
 */

export const VIETNAM_REGIONS = [
  { name: 'Đồng Bằng Sông Cửu Long (Cần Thơ)', lat: 10.0452, lon: 105.7469, mainCrops: 'Lúa gạo, Cây ăn trái' },
  { name: 'Tây Nguyên (Đắk Lắk - Buôn Ma Thuột)', lat: 12.6667, lon: 108.0500, mainCrops: 'Cà phê, Sầu riêng, Tiêu' },
  { name: 'Đông Nam Bộ (Đồng Nai / Tiền Giang)', lat: 10.9574, lon: 106.8427, mainCrops: 'Sầu riêng, Mít, Thanh long' },
  { name: 'Đồng Bằng Sông Hồng (Hà Nội / Nam Định)', lat: 21.0285, lon: 105.8542, mainCrops: 'Lúa vụ, Rau màu, Cây vụ đông' }
];

export class WeatherRadarService {
  /**
   * Calculates fungal and pest outbreak risk score based on microclimate
   */
  static calculateFungalRisk(temp, humidity, precipitation = 0) {
    let score = 20;

    // Relative humidity is the single most critical factor for fungal spore germination
    if (humidity >= 85) score += 45;
    else if (humidity >= 75) score += 30;
    else if (humidity >= 65) score += 15;

    // Favorable fungal temperature range (22°C - 30°C)
    if (temp >= 22 && temp <= 30) score += 25;
    else if (temp >= 18 && temp < 22) score += 15;
    else if (temp > 30 && temp <= 35) score += 10;

    // Rain / surface leaf wetness
    if (precipitation > 10) score += 15;
    else if (precipitation > 0) score += 10;

    score = Math.min(100, Math.max(0, score));

    let level = 'Nguy cơ Thấp';
    let warningText = 'Thời tiết khô ráo, nguy cơ nấm bệnh thấp. Tiếp tục chăm sóc bình thường.';
    let badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

    if (score >= 75) {
      level = 'Nguy cơ Cao';
      warningText = 'Ẩm độ không khí cao kết hợp nhiệt độ ấm thuận lợi cho nấm Đạo ôn, Xì mủ và Thán thư bùng phát! Khuyến cáo thăm vườn thường xuyên và chủ động phòng ngừa.';
      badgeClass = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    } else if (score >= 45) {
      level = 'Nguy cơ Trung bình';
      warningText = 'Độ ẩm ở mức trung bình, có nguy cơ bùng phát sâu hại và đốm lá tại các tán cây rậm rạp. Cần tỉa cành thông thoáng.';
      badgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }

    return {
      score,
      level,
      warningText,
      badgeClass
    };
  }

  /**
   * Fetches real-time weather and calculates agricultural risk
   */
  static async getAgriculturalRisk(lat = 10.0452, lon = 105.7469) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=3`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }

      const data = await response.json();
      const currentTemp = Math.round(data?.current?.temperature_2m || 28);
      const currentHumidity = Math.round(data?.current?.relative_humidity_2m || 82);
      const currentPrecip = data?.current?.precipitation || 0;

      const risk = this.calculateFungalRisk(currentTemp, currentHumidity, currentPrecip);

      // Match closest region name
      const region = VIETNAM_REGIONS.find(r => Math.abs(r.lat - lat) < 1.0 && Math.abs(r.lon - lon) < 1.0) || VIETNAM_REGIONS[0];

      const forecast3Days = (data?.daily?.time || []).map((dateStr, idx) => ({
        date: dateStr,
        tempMax: Math.round(data.daily.temperature_2m_max[idx] || 32),
        tempMin: Math.round(data.daily.temperature_2m_min[idx] || 24),
        rainProb: data.daily.precipitation_probability_max[idx] || 40
      }));

      return {
        locationName: region.name,
        mainCrops: region.mainCrops,
        temperature: currentTemp,
        humidity: currentHumidity,
        precipitation: currentPrecip,
        riskEvaluation: risk,
        forecast3Days
      };
    } catch (err) {
      console.warn('[WeatherRadarService] Using regional offline fallback weather data:', err.message);
      // Robust offline default for Vietnam Mekong Delta
      const fallbackRisk = this.calculateFungalRisk(28, 85, 5);
      return {
        locationName: 'Đồng Bằng Sông Cửu Long (Cần Thơ)',
        mainCrops: 'Lúa gạo, Cây ăn trái',
        temperature: 28,
        humidity: 85,
        precipitation: 5,
        riskEvaluation: fallbackRisk,
        forecast3Days: [
          { date: 'Hôm nay', tempMax: 32, tempMin: 25, rainProb: 65 },
          { date: 'Ngày mai', tempMax: 31, tempMin: 24, rainProb: 70 },
          { date: 'Ngày kia', tempMax: 33, tempMin: 25, rainProb: 40 }
        ]
      };
    }
  }
}
