import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Starting AgriViet Lens End-to-End Integration Tests...');

// 1. Static Web Server creation
const server = http.createServer((req, res) => {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  const filePath = path.join(rootDir, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test Server running at http://localhost:${port}/`);

  try {
    // 2. Fetch and test index.html
    const indexRes = await fetch(`http://localhost:${port}/`);
    assert.strictEqual(indexRes.status, 200, 'index.html should return 200 OK');
    const html = await indexRes.text();

    assert.ok(html.toLowerCase().includes('agriviet lens'), 'HTML missing AgriViet Lens branding');
    assert.ok(html.toLowerCase().includes('ai riser 2026'), 'HTML missing AI Riser 2026 tag');
    assert.ok(html.includes('id="pane_scanner"'), 'HTML missing scanner pane');
    assert.ok(html.includes('id="pane_voice"'), 'HTML missing voice copilot pane');
    assert.ok(html.includes('id="pane_weather"'), 'HTML missing weather radar pane');
    assert.ok(html.includes('id="pane_logbook"'), 'HTML missing farm logbook pane');
    assert.ok(html.includes('id="presetContainer"'), 'HTML missing preset demo container');
    assert.ok(html.includes('id="diagnosisResultCard"'), 'HTML missing diagnosis result card');
    assert.ok(html.includes('id="tabOrgBtn"'), 'HTML missing organic treatment tab button');
    assert.ok(html.includes('id="tabChemBtn"'), 'HTML missing chemical treatment tab button');

    // 3. Fetch and test app.js module
    const appRes = await fetch(`http://localhost:${port}/src/app.js`);
    assert.strictEqual(appRes.status, 200, 'src/app.js should return 200 OK');
    const appJs = await appRes.text();
    assert.ok(appJs.includes('AgriVietApp'), 'app.js missing AgriVietApp class');

    // 4. Fetch and test offline-diseases.js module
    const diseasesRes = await fetch(`http://localhost:${port}/src/data/offline-diseases.js`);
    assert.strictEqual(diseasesRes.status, 200, 'src/data/offline-diseases.js should return 200 OK');
    const diseasesJs = await diseasesRes.text();
    assert.ok(diseasesJs.includes('OFFLINE_DISEASES'), 'offline-diseases.js missing OFFLINE_DISEASES dictionary');
    assert.ok(diseasesJs.includes('SAMPLE_PRESETS'), 'offline-diseases.js missing SAMPLE_PRESETS array');

    // 5. Fetch and test gemini-service.js module
    const geminiRes = await fetch(`http://localhost:${port}/src/services/gemini-service.js`);
    assert.strictEqual(geminiRes.status, 200, 'src/services/gemini-service.js should return 200 OK');
    const geminiJs = await geminiRes.text();
    assert.ok(geminiJs.includes('GeminiService'), 'gemini-service.js missing GeminiService class');

    // 6. Fetch and test weather-radar.js module
    const weatherRes = await fetch(`http://localhost:${port}/src/services/weather-radar.js`);
    assert.strictEqual(weatherRes.status, 200, 'src/services/weather-radar.js should return 200 OK');

    // 7. Fetch and test logbook-service.js module
    const logbookRes = await fetch(`http://localhost:${port}/src/services/logbook-service.js`);
    assert.strictEqual(logbookRes.status, 200, 'src/services/logbook-service.js should return 200 OK');

    console.log('✅ End-to-End static server & module integrity tests passed with flying colors!');
  } catch (err) {
    console.error('❌ E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
