import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.resolve(testsDirectory, '..', 'tokens.css');

assert.ok(fs.existsSync(tokensPath), 'tokens.css must exist at the project root');

const tokensCss = fs.readFileSync(tokensPath, 'utf8');

assert.ok(
  tokensCss.includes('/* Hallmark · macrostructure: Workbench'),
  'tokens.css must include the Hallmark Workbench stamp comment'
);

const requiredTokens = [
  '--color-paper',
  '--color-primary',
  '--color-primary-hover',
  '--color-primary-soft',
  '--color-ink',
  '--color-muted',
  '--color-accent',
  '--color-accent-soft',
  '--color-alert',
  '--color-border',
  '--color-surface',
  '--color-surface-soft',
  '--badge-bio-bg',
  '--badge-bio-text',
  '--badge-chem-bg',
  '--badge-chem-text',
  '--gauge-healthy',
  '--gauge-warning',
  '--gauge-danger',
  '--shopee-orange',
  '--shopee-orange-hover'
];

for (const token of requiredTokens) {
  assert.ok(tokensCss.includes(token), `tokens.css must define ${token}`);
}

assert.match(
  tokensCss,
  /\[data-theme="dark"\]\s*\{/,
  'tokens.css must include a dark theme token block'
);

const darkBlockMatch = tokensCss.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/);
assert.ok(darkBlockMatch, 'Dark theme block must be parseable');
const darkBlock = darkBlockMatch[1];

for (const token of [
  '--badge-bio-bg',
  '--badge-bio-text',
  '--badge-chem-bg',
  '--badge-chem-text',
  '--gauge-healthy',
  '--gauge-warning',
  '--gauge-danger',
  '--shopee-orange'
]) {
  assert.ok(darkBlock.includes(token), `Dark theme block must define ${token}`);
}

assert.match(
  tokensCss,
  /:focus-visible\s*\{/,
  'tokens.css must include a visible focus ring rule'
);

assert.match(
  tokensCss,
  /min-height:\s*48px/,
  'tokens.css must enforce minimum 48px touch targets'
);

console.log('Hallmark token tests passed.');
