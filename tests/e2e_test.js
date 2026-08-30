import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { SAMPLE_PRESETS } from '../src/data/sample-presets.js';
import { WeatherRadarService } from '../src/services/weather-radar.js';
import { LogbookService } from '../src/services/logbook-service.js';

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

    // The application renders logbook rows as HTML. Parse the controls needed
    // by the integration test so the real event listeners can be exercised.
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
    if (selector === 'button' && this.tagName === 'BUTTON') return this;
    if (selector === 'input' && this.tagName === 'INPUT') return this;
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
  if (simpleSelector.startsWith('#')) return element.id === simpleSelector.slice(1);
  if (simpleSelector.startsWith('.')) return element.classList.contains(simpleSelector.slice(1));

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
  const elementPattern = /<([a-z][a-z0-9-]*)\b([^>]*?(?:\bid=["'][^"']+["']|\bdata-tab=["'][^"']+["']|\bclass=["'][^"']*(?:nav-tab-btn|preset-btn|tank-btn|voice-chip)[^"']*)[^>]*)>/gi;

  for (const match of html.matchAll(elementPattern)) {
    const tagName = match[1];
    const attributes = parseAttributes(match[2]);
    if (!attributes.id && !attributes['data-tab'] && !String(attributes.class).match(/\b(?:nav-tab-btn|preset-btn|tank-btn|voice-chip)\b/)) continue;
    if (attributes.id && document.getElementById(attributes.id)) continue;
    document.body.appendChild(new MiniElement(tagName, attributes, document));
  }

  // Add every remaining id-bearing element, including panels and form fields.
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
  console.log('Starting AgriViet Lens end-to-end integration tests.');
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  const originalFetch = globalThis.fetch;

  try {
    const indexResponse = await originalFetch(`${baseUrl}/`);
    assert.equal(indexResponse.status, 200, 'index.html should return 200 OK');
    const html = await indexResponse.text();

    // Static Hallmark Workbench structure and asset contract.
    assert.match(html, /AgriViet Lens/i, 'HTML missing AgriViet Lens branding');
    assert.match(html, /Hallmark[^\n]*Workbench/i, 'HTML missing Hallmark Workbench stamp');
    assert.match(html, /<link[^>]+href=["']tokens\.css["']/i, 'index.html must load tokens.css');
    assert.match(html, /class=["'][^"']*\bapp-shell\b[^"']*["']/i, 'HTML missing app shell');
    assert.match(html, /class=["'][^"']*\btopbar\b[^"']*["']/i, 'HTML missing Workbench topbar');
    assert.match(html, /class=["'][^"']*\bworkspace-nav\b[^"']*["']/i, 'HTML missing Workbench navigation');
    assert.match(html, /class=["'][^"']*\bmain-shell\b[^"']*["']/i, 'HTML missing Workbench main shell');
    assert.equal((html.match(/class=["'][^"']*\bnav-tab-btn\b[^"']*["']/gi) || []).length, 4, 'Workbench should expose four navigation tabs');
    assert.equal((html.match(/id=["']view(?:Scanner|Voice|Weather|Logbook)["']/gi) || []).length, 4, 'Workbench should expose four view panels');
    assertNoEmojiInInteractiveMarkup(html);

    const modulePaths = [
      '/src/app.js',
      '/src/data/sample-presets.js',
      '/src/services/gemini-service.js',
      '/src/services/weather-radar.js',
      '/src/services/logbook-service.js',
      '/src/utils/dosage-calculator.js',
      '/src/utils/image-processor.js'
    ];
    for (const modulePath of modulePaths) {
      const response = await originalFetch(`${baseUrl}${modulePath}`);
      assert.equal(response.status, 200, `${modulePath} should return 200 OK`);
    }

    // Install a deterministic browser-like surface, then execute the real app controller.
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

    // All four tabs must switch their view and ARIA state.
    const navigation = [
      ['scanner', 'navTabScanner', 'viewScanner'],
      ['voice', 'navTabVoice', 'viewVoice'],
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

    // Preset loading must update the crop and render the diagnosis card.
    const presetButtons = document.querySelectorAll('.preset-btn');
    const durianButton = presetButtons.find(button => button.dataset.preset === 'durian');
    assert.ok(durianButton, 'Durian preset button should be wired in the Workbench');
    durianButton.click();
    await waitFor(() => app.currentDiagnosis?.diseaseNameVi === 'Bệnh Xì Mủ Nứt Thân', 'durian preset diagnosis');
    assert.equal(document.getElementById('diagnosisCard').hidden, false, 'Diagnosis card should be visible after preset loading');
    assert.equal(document.getElementById('diseaseTitle').textContent, 'Bệnh Xì Mủ Nứt Thân');
    assert.equal(document.getElementById('confidenceBadge').textContent, '94%');
    assert.ok(document.getElementById('organicSteps').innerHTML || document.getElementById('organicSteps').children.length > 0, 'Diagnosis should render organic treatment steps');

    const riceButton = presetButtons.find(button => button.dataset.preset === 'rice');
    riceButton.click();
    await waitFor(() => app.currentDiagnosis?.diseaseNameVi === 'Bệnh Đạo Ôn Lá', 'rice preset diagnosis reset');

    // Spray dosage must scale the loaded 8 g / 16 L instruction for every supported tank.
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

    // VietGAP organic and chemical treatment tabs must expose the right panel and quarantine data.
    const organicButton = document.getElementById('tabOrganicBtn');
    const chemicalButton = document.getElementById('tabChemicalBtn');
    organicButton.click();
    assert.equal(organicButton.getAttribute('aria-selected'), 'true');
    assert.equal(document.getElementById('organicTreatmentPanel').hidden, false);
    assert.equal(document.getElementById('chemicalTreatmentPanel').hidden, true);
    chemicalButton.click();
    assert.equal(chemicalButton.getAttribute('aria-selected'), 'true');
    assert.equal(document.getElementById('organicTreatmentPanel').hidden, true);
    assert.equal(document.getElementById('chemicalTreatmentPanel').hidden, false);
    assert.equal(document.getElementById('quarantineDays').textContent, '14 ngày');
    assert.match(document.getElementById('activeIngredients').textContent, /Tricyclazole/);

    // Weather service data and regional select changes must flow into the active view.
    const regionalWeather = await WeatherRadarService.fetchRegionalWeather(2);
    assert.equal(regionalWeather.regionName, 'Đông Nam Bộ (Đồng Nai / Tiền Giang)');
    assert.equal(regionalWeather.temp, 30);
    assert.equal(regionalWeather.humidity, 78);
    assert.ok(regionalWeather.risk);

    const regionSelect = document.getElementById('weatherRegionSelect');
    assert.equal(regionSelect.value, '0');
    assert.match(regionSelect.innerHTML, /Đông Nam Bộ/);
    regionSelect.value = '2';
    regionSelect.dispatchEvent({ type: 'change' });
    await waitFor(() => document.getElementById('weatherLocation').textContent.includes('Đông Nam Bộ'), 'regional weather selection');
    assert.equal(document.getElementById('weatherTemperature').textContent, '30°C');
    assert.equal(document.getElementById('weatherHumidity').textContent, '78%');
    assert.equal(document.getElementById('weatherWind').textContent, '6.8 km/h');

    // Saving, progressing, and exporting a diagnosis must update the VietGAP logbook.
    document.getElementById('saveLogbookBtn').click();
    assert.equal(document.getElementById('logbookTotal').textContent, '1');
    assert.equal(document.getElementById('logbookOpen').textContent, '1');
    assert.equal(LogbookService.getLogs()[0].status, 'Đang theo dõi');

    let statusSelect = document.querySelector('.status-select');
    assert.ok(statusSelect, 'Saved logbook row should render a status select');
    statusSelect.value = 'Đã xử lý';
    statusSelect.dispatchEvent({ type: 'change' });
    assert.equal(LogbookService.getLogs()[0].status, 'Đã xử lý');
    assert.equal(document.getElementById('logbookResolved').textContent, '0');

    statusSelect = document.querySelector('.status-select');
    statusSelect.value = 'Đã khỏi bệnh';
    statusSelect.dispatchEvent({ type: 'change' });
    assert.equal(LogbookService.getLogs()[0].status, 'Đã khỏi bệnh');
    assert.equal(document.getElementById('logbookOpen').textContent, '0');
    assert.equal(document.getElementById('logbookResolved').textContent, '1');

    const csv = app.exportLogbookCsv();
    assert.match(csv, /Mã ghi chép,Thời gian/);
    assert.match(csv, /Bệnh Đạo Ôn Lá/);
    assert.match(csv, /Đã khỏi bệnh/);
    assert.equal(csv.split('\n').length, 2, 'CSV export should contain one header and one log row');

    assert.equal(SAMPLE_PRESETS.length, 4, 'E2E flow should retain all four offline presets');
    console.log('End-to-end Workbench, diagnosis, dosage, weather, and logbook tests passed.');
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
