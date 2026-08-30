import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { WeatherRadarService } from '../src/services/weather-radar.js';
import { LogbookService } from '../src/services/logbook-service.js';
import { GardenService } from '../src/services/garden-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class MockStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

class MiniClassList {
  constructor(element, initial = '') {
    this.element = element;
    this.tokens = new Set(String(initial).split(/\s+/).filter(Boolean));
  }

  add(...tokens) {
    tokens.forEach(token => this.tokens.add(token));
  }

  remove(...tokens) {
    tokens.forEach(token => this.tokens.delete(token));
  }

  toggle(token, force) {
    const shouldAdd = force === undefined ? !this.tokens.has(token) : Boolean(force);
    if (shouldAdd) this.tokens.add(token);
    else this.tokens.delete(token);
    return shouldAdd;
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toString() {
    return [...this.tokens].join(' ');
  }
}

class MiniElement {
  constructor(tagName = 'div', attributes = {}, ownerDocument = null) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this._textContent = '';
    this._innerHTML = '';
    this.classList = new MiniClassList(this);

    Object.entries(attributes).forEach(([name, value]) => this.setAttribute(name, value));
  }

  set id(value) {
    this.setAttribute('id', value);
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set className(value) {
    this.classList = new MiniClassList(this, value);
    this.attributes.set('class', String(value));
  }

  get className() {
    return this.classList.toString();
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
  }

  get textContent() {
    if (this._textContent) return this._textContent;
    return this.children.map(child => child.textContent).join('');
  }

  set innerHTML(value) {
    this._innerHTML = String(value ?? '');
    this._textContent = '';
    this.children = [];

    // Parse dynamic child elements
    const tagPattern = /<([a-z][a-z0-9-]*)\b([^>]*)>([\s\S]*?)<\/\1>|<([a-z][a-z0-9-]*)\b([^>]*)\/?>/gi;
    for (const match of this._innerHTML.matchAll(tagPattern)) {
      const tagName = match[1] || match[4];
      const attrSource = match[2] || match[5] || '';
      const inner = match[3] || '';
      const attributes = parseAttributes(attrSource);
      const child = new MiniElement(tagName, attributes, this.ownerDocument);
      if (inner && !inner.includes('<')) {
        child.textContent = inner.trim();
      }
      if (tagName.toLowerCase() === 'select') {
        const selectedOption = inner.match(/<option\b[^>]*value=["']([^"']+)["'][^>]*selected[^>]*>/i);
        child.value = selectedOption ? selectedOption[1] : '';
      }
      if (inner && inner.includes('<')) {
        child.innerHTML = inner;
      }
      this.appendChild(child);
    }

    // Direct extraction for table elements
    const selectPattern = /<select\b([^>]*)class=["'][^"']*\bstatus-select\b[^"']*["'][^>]*>([\s\S]*?)<\/select>/gi;
    for (const match of this._innerHTML.matchAll(selectPattern)) {
      const attributes = parseAttributes(match[1]);
      attributes.class = 'status-select field-control';
      const selectedOption = match[2].match(/<option\b[^>]*value=["']([^"']+)["'][^>]*selected[^>]*>/i);
      const select = new MiniElement('select', attributes, this.ownerDocument);
      select.value = selectedOption ? selectedOption[1] : '';
      this.appendChild(select);
    }

    const deletePattern = /<button\b([^>]*)data-delete-id=["']([^"']+)["'][^>]*>/gi;
    for (const match of this._innerHTML.matchAll(deletePattern)) {
      const attributes = parseAttributes(match[1]);
      attributes['data-delete-id'] = match[2];
      this.appendChild(new MiniElement('button', attributes, this.ownerDocument));
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  setAttribute(name, value) {
    const attributeName = String(name);
    const attributeValue = String(value);
    this.attributes.set(attributeName, attributeValue);

    if (attributeName === 'class') this.className = attributeValue;
    if (attributeName === 'value') this.value = attributeValue;
    if (attributeName.startsWith('data-')) {
      const datasetKey = attributeName.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[datasetKey] = attributeValue;
    }

    this.ownerDocument?.register(this);
  }

  getAttribute(name) {
    return this.attributes.get(String(name)) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(String(name));
  }

  addEventListener(type, listener) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(listener);
    this.listeners.set(type, handlers);
  }

  dispatchEvent(event = {}) {
    const eventObject = {
      ...event,
      target: event.target || this,
      currentTarget: this
    };
    for (const listener of this.listeners.get(eventObject.type) || []) listener(eventObject);
    return true;
  }

  click() {
    return this.dispatchEvent({ type: 'click' });
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (matchesSelector(curr, selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  append(...nodes) {
    nodes.forEach(node => this.appendChild(node));
  }

  appendChild(node) {
    if (!node) return node;
    node.parentNode = this;
    node.ownerDocument = this.ownerDocument;
    this.children.push(node);
    this.ownerDocument?.register(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(child => child !== this);
    this.parentNode = null;
  }

  querySelectorAll(selector) {
    const results = [];
    const visit = node => {
      for (const child of node.children) {
        if (matchesSelector(child, selector)) results.push(child);
        visit(child);
      }
    };
    visit(this);
    return results;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

class MiniDocument {
  constructor() {
    this.elementsById = new Map();
    this.documentElement = new MiniElement('html', {}, this);
    this.body = new MiniElement('body', {}, this);
    this.documentElement.appendChild(this.body);
  }

  register(element) {
    element.ownerDocument = this;
    if (element.id) this.elementsById.set(element.id, element);
    element.children.forEach(child => this.register(child));
    return element;
  }

  createElement(tagName) {
    return new MiniElement(tagName, {}, this);
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

function parseAttributes(source) {
  const attributes = {};
  for (const match of String(source).matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attributes[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function matchesSelector(element, selector) {
  const simpleSelector = String(selector).trim();
  if (!simpleSelector) return false;
  if (simpleSelector === element.tagName?.toLowerCase() || simpleSelector === element.tagName) return true;
  if (simpleSelector.startsWith('#')) return element.id === simpleSelector.slice(1);
  if (simpleSelector.startsWith('.')) return element.classList.contains(simpleSelector.slice(1));

  const attrPresenceMatch = simpleSelector.match(/^\[([^=\]]+)\]$/);
  if (attrPresenceMatch) {
    return element.getAttribute(attrPresenceMatch[1]) !== null;
  }

  const attributeMatch = simpleSelector.match(/^\[([^=\]]+)(?:=["']?([^\]"']+)["']?)?\]$/);
  if (attributeMatch) {
    const value = element.getAttribute(attributeMatch[1]);
    return value !== null && (attributeMatch[2] === undefined || value === attributeMatch[2]);
  }

  const tagClassMatch = simpleSelector.match(/^([a-z0-9-]+)?(?:\.([a-z0-9_-]+))?$/i);
  if (tagClassMatch) {
    const tagMatches = !tagClassMatch[1] || element.tagName.toLowerCase() === tagClassMatch[1].toLowerCase();
    const classMatches = !tagClassMatch[2] || element.classList.contains(tagClassMatch[2]);
    return tagMatches && classMatches;
  }

  return false;
}

function buildDocumentFromHTML(html) {
  const document = new MiniDocument();
  const elementPattern = /<([a-z][a-z0-9-]*)\b([^>]*?(?:\bid=["'][^"']+["']|\bdata-tab=["'][^"']+["']|\bclass=["'][^"']*(?:nav-tab-btn|tank-btn|filter-pill|care-btn|shopee-btn)[^"']*)[^>]*)>/gi;

  for (const match of html.matchAll(elementPattern)) {
    const tagName = match[1];
    const attributes = parseAttributes(match[2]);
    if (!attributes.id && !attributes['data-tab'] && !String(attributes.class).match(/\b(?:nav-tab-btn|tank-btn|filter-pill|care-btn|shopee-btn)\b/)) continue;
    if (attributes.id && document.getElementById(attributes.id)) continue;
    document.body.appendChild(new MiniElement(tagName, attributes, document));
  }

  // Add every remaining id-bearing element
  const idPattern = /<([a-z][a-z0-9-]*)\b([^>]*\bid=["']([^"']+)["'][^>]*)>/gi;
  for (const match of html.matchAll(idPattern)) {
    const id = match[3];
    if (document.getElementById(id)) continue;
    document.body.appendChild(new MiniElement(match[1], parseAttributes(match[2]), document));
  }

  return document;
}

function stripTags(value) {
  return String(value).replace(/<[^>]*>/g, '');
}

function assertNoEmojiInInteractiveMarkup(html) {
  const emojiPattern = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u;
  const blocks = [
    ...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi),
    ...html.matchAll(/<[^>]*class=["'][^"']*\bbadge\b[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi)
  ];

  blocks.forEach(match => {
    assert.equal(
      emojiPattern.test(stripTags(match[0])),
      false,
      `Buttons and badges must use SVG/text, not emoji: ${stripTags(match[0]).trim()}`
    );
  });
}

function waitFor(predicate, label) {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        if (predicate()) {
          resolve();
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }
      await new Promise(wait => setTimeout(wait, 0));
    }
    reject(new Error(`Timed out waiting for ${label}`));
  });
}

function createServer() {
  return http.createServer((request, response) => {
    let requestPath = request.url === '/' ? '/index.html' : request.url;
    requestPath = requestPath.split('?')[0];
    const filePath = path.join(rootDir, requestPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not Found');
      return;
    }

    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.css': 'text/css; charset=utf-8'
    };
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function run() {
  console.log('Starting AgriViet Lens end-to-end integration tests...');
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  const originalFetch = globalThis.fetch;

  try {
    const indexResponse = await originalFetch(`${baseUrl}/`);
    assert.equal(indexResponse.status, 200, 'index.html should return 200 OK');
    const html = await indexResponse.text();

    // 1. Static Hallmark Workbench structure and asset contract.
    assert.match(html, /AgriViet Lens/i, 'HTML missing AgriViet Lens branding');
    assert.match(html, /Hallmark[^\n]*Workbench/i, 'HTML missing Hallmark Workbench stamp');
    assert.match(html, /<link[^>]+href=["']tokens\.css["']/i, 'index.html must load tokens.css');
    assert.match(html, /class=["'][^"']*\bapp-shell\b[^"']*["']/i, 'HTML missing app shell');
    assert.match(html, /class=["'][^"']*\btopbar\b[^"']*["']/i, 'HTML missing Workbench topbar');
    assert.match(html, /class=["'][^"']*\bworkspace-nav\b[^"']*["']/i, 'HTML missing Workbench navigation');
    assert.match(html, /class=["'][^"']*\bmain-shell\b[^"']*["']/i, 'HTML missing Workbench main shell');
    assert.equal((html.match(/class=["'][^"']*\bnav-tab-btn\b[^"']*["']/gi) || []).length, 5, 'Workbench should expose five navigation tabs');
    assert.equal((html.match(/id=["']view(?:Scanner|Garden|Medicine|Weather|Logbook)["']/gi) || []).length, 5, 'Workbench should expose five view panels');
    assertNoEmojiInInteractiveMarkup(html);

    // 2. Verify all modular scripts load via HTTP server
    const modulePaths = [
      '/src/app.js',
      '/src/data/sample-presets.js',
      '/src/services/gemini-service.js',
      '/src/services/garden-service.js',
      '/src/services/medicine-service.js',
      '/src/services/weather-radar.js',
      '/src/services/logbook-service.js',
      '/src/utils/dosage-calculator.js',
      '/src/utils/image-processor.js'
    ];
    for (const modulePath of modulePaths) {
      const response = await originalFetch(`${baseUrl}${modulePath}`);
      assert.equal(response.status, 200, `${modulePath} should return 200 OK`);
    }

    // 3. Install browser mock surface and instantiate AgriVietApp
    const document = buildDocumentFromHTML(html);
    const window = {
      listeners: new Map(),
      addEventListener(type, listener) {
        const handlers = this.listeners.get(type) || [];
        handlers.push(listener);
        this.listeners.set(type, handlers);
      },
      speechSynthesis: null
    };
    globalThis.document = document;
    globalThis.window = window;
    globalThis.localStorage = new MockStorage();

    const weatherPayloads = {
      '10.0452': { temperature: 26.4, humidity: 88, rain: 4, wind: 5.1 },
      '12.6667': { temperature: 27.1, humidity: 84, rain: 2, wind: 6.2 },
      '10.9574': { temperature: 30, humidity: 78, rain: 1.2, wind: 6.8 },
      '21.0285': { temperature: 24.8, humidity: 73, rain: 0, wind: 4.4 }
    };
    globalThis.fetch = async url => {
      const urlText = String(url);
      const coordinate = Object.keys(weatherPayloads).find(latitude => urlText.includes(`latitude=${latitude}`)) || '10.0452';
      const weather = weatherPayloads[coordinate];
      return {
        ok: true,
        async json() {
          return {
            current: {
              temperature_2m: weather.temperature,
              relative_humidity_2m: weather.humidity,
              precipitation: weather.rain,
              wind_speed_10m: weather.wind
            },
            hourly: {
              time: ['2026-08-30T08:00', '2026-08-30T09:00'],
              relative_humidity_2m: [weather.humidity, weather.humidity - 2]
            }
          };
        }
      };
    };

    const { AgriVietApp } = await import('../src/app.js');
    const app = new AgriVietApp();
    app.init();
    await waitFor(() => app.currentDiagnosis?.diseaseNameVi === 'Bệnh Đạo Ôn Lá', 'initial rice preset diagnosis');

    // 4. Test all 5 Navigation Tabs switching & ARIA state
    const navigation = [
      ['scanner', 'navTabScanner', 'viewScanner'],
      ['garden', 'navTabGarden', 'viewGarden'],
      ['medicine', 'navTabMedicine', 'viewMedicine'],
      ['weather', 'navTabWeather', 'viewWeather'],
      ['logbook', 'navTabLogbook', 'viewLogbook']
    ];
    for (const [tabName, buttonId, viewId] of navigation) {
      document.getElementById(buttonId).click();
      assert.equal(app.activeTab, tabName, `${tabName} tab should become active`);
      assert.equal(document.getElementById(buttonId).getAttribute('aria-selected'), 'true');
      for (const [, , candidateViewId] of navigation) {
        assert.equal(document.getElementById(candidateViewId).hidden, candidateViewId !== viewId, `${candidateViewId} visibility should follow active tab`);
      }
    }

    // Return to scanner tab for diagnosis verification
    document.getElementById('navTabScanner').click();
    assert.equal(document.getElementById('diagnosisCard').hidden, false, 'Diagnosis card should be visible');
    assert.equal(document.getElementById('diseaseTitle').textContent, 'Bệnh Đạo Ôn Lá');
    assert.equal(document.getElementById('confidenceBadge').textContent, '96%');

    // 5. Spray dosage must scale for all supported tank sizes
    const dosageCases = [
      ['16', '8 g thuốc cho bình 16L'],
      ['20', '10 g thuốc cho bình 20L'],
      ['25', '12.5 g thuốc cho bình 25L'],
      ['200', '100 g thuốc cho bình 200L'],
      ['30', '15 g thuốc cho bình 30L']
    ];
    for (const [capacity, expectedText] of dosageCases) {
      const button = document.querySelectorAll('.tank-btn').find(candidate => candidate.dataset.capacity === capacity);
      assert.ok(button, `Tank button for ${capacity}L should exist`);
      button.click();
      assert.equal(app.tankCapacity, Number(capacity));
      assert.match(document.getElementById('dosageOutputText').textContent, new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    // 6. Embedded Shopee recommendations in diagnosis card
    const shopeeContainer = document.getElementById('diagnosisShopeeCards');
    assert.ok(shopeeContainer, 'Shopee recommendations container should exist in diagnosis');
    assert.ok(shopeeContainer.children.length > 0, 'Shopee cards should be rendered in diagnosis');
    assert.match(shopeeContainer.innerHTML, /Shopee/i, 'Shopee cards should contain Shopee purchase CTA');

    // 7. Test Virtual Garden Tab & Simulation
    document.getElementById('navTabGarden').click();
    assert.equal(app.activeTab, 'garden');
    const gardenPlotsGrid = document.getElementById('gardenPlotsGrid');
    assert.ok(gardenPlotsGrid, 'Garden plots grid should exist');
    assert.ok(gardenPlotsGrid.children.length >= 2, 'Starter plots should be rendered');
    assert.ok(document.getElementById('gardenTotalPlots').textContent >= '2', 'Total plots counter should reflect plots');

    // Test watering action
    const plots = GardenService.getPlots();
    const initialMoisture = plots[0].moisture;
    app.handleGardenAction('water', plots[0].id);
    const updatedPlot = GardenService.getPlotById(plots[0].id);
    assert.ok(updatedPlot.moisture >= initialMoisture, 'Moisture should increase after watering');

    // Test Add Plot Modal & Creation
    app.openAddPlotModal();
    assert.equal(document.getElementById('addPlotModal').hidden, false, 'Add Plot modal should be visible');
    const selectTemplate = document.getElementById('newPlotTemplateSelect');
    if (selectTemplate) selectTemplate.value = 'coffee';
    const nameInput = document.getElementById('newPlotNameInput');
    if (nameInput) nameInput.value = 'Vườn Cà Phê Mới';
    app.confirmAddPlot();
    assert.equal(document.getElementById('addPlotModal').hidden, true, 'Add Plot modal should close after submit');
    assert.ok(GardenService.getPlots().some(p => p.name === 'Vườn Cà Phê Mới'), 'New plot should be added to garden');

    // 8. Test Medicine & Shopee Pharmacy Tab
    document.getElementById('navTabMedicine').click();
    assert.equal(app.activeTab, 'medicine');
    const medGrid = document.getElementById('medicineCatalogGrid');
    assert.ok(medGrid, 'Medicine catalog grid should exist');
    assert.ok(medGrid.children.length >= 10, 'Catalog should display all medicines');

    // Test Category filter pill
    const bioPill = document.getElementById('medCatBio');
    if (bioPill) {
      bioPill.click();
      assert.equal(app.medicineCategory, 'bio');
      assert.equal(medGrid.children.length, 5, 'Bio filter should show 5 bio products');
    }

    const allPill = document.getElementById('medCatAll');
    if (allPill) {
      allPill.click();
      assert.equal(app.medicineCategory, 'all');
      assert.equal(medGrid.children.length, 10, 'All filter should show 10 products');
    }

    // Test Search filter
    app.medicineSearchQuery = 'Trichoderma';
    app.renderMedicineCatalog();
    assert.ok(medGrid.children.length >= 1, 'Search for Trichoderma should return matching products');

    // Reset search
    app.medicineSearchQuery = '';
    app.renderMedicineCatalog();

    // 9. Weather Service & Regional Radar Tests
    document.getElementById('navTabWeather').click();
    const regionalWeather = await WeatherRadarService.fetchRegionalWeather(2);
    assert.equal(regionalWeather.regionName, 'Đông Nam Bộ (Đồng Nai / Tiền Giang)');
    assert.equal(regionalWeather.temp, 30);
    assert.equal(regionalWeather.humidity, 78);

    const regionSelect = document.getElementById('weatherRegionSelect');
    assert.equal(regionSelect.value, '0');
    assert.match(regionSelect.innerHTML, /Đông Nam Bộ/);
    regionSelect.value = '2';
    regionSelect.dispatchEvent({ type: 'change' });
    await waitFor(() => document.getElementById('weatherLocation').textContent.includes('Đông Nam Bộ'), 'regional weather selection');
    assert.equal(document.getElementById('weatherTemperature').textContent, '30°C');
    assert.equal(document.getElementById('weatherHumidity').textContent, '78%');

    // 10. VietGAP Logbook Tests
    document.getElementById('navTabLogbook').click();
    document.getElementById('navTabScanner').click();
    document.getElementById('saveLogbookBtn').click();
    document.getElementById('navTabLogbook').click();
    assert.equal(document.getElementById('logbookTotal').textContent, '1');
    assert.equal(document.getElementById('logbookOpen').textContent, '1');
    assert.equal(LogbookService.getLogs()[0].status, 'Đang theo dõi');

    let statusSelect = document.querySelector('.status-select');
    assert.ok(statusSelect, 'Saved logbook row should render a status select');
    statusSelect.value = 'Đã xử lý';
    statusSelect.dispatchEvent({ type: 'change' });
    assert.equal(LogbookService.getLogs()[0].status, 'Đã xử lý');

    statusSelect = document.querySelector('.status-select');
    statusSelect.value = 'Đã khỏi bệnh';
    statusSelect.dispatchEvent({ type: 'change' });
    assert.equal(LogbookService.getLogs()[0].status, 'Đã khỏi bệnh');
    assert.equal(document.getElementById('logbookResolved').textContent, '1');

    const csv = app.exportLogbookCsv();
    assert.match(csv, /Mã ghi chép,Thời gian/);
    assert.match(csv, /Bệnh Đạo Ôn Lá/);
    assert.match(csv, /Đã khỏi bệnh/);

    console.log('✅ End-to-end 5-tab Workspace, Virtual Garden, Shopee Medicine Finder, and VietGAP Logbook tests passed successfully!');
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.localStorage;
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error('E2E test failed:', error);
  process.exitCode = 1;
});
