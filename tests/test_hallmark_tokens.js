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

for (const token of [
  '--color-paper',
  '--color-primary',
  '--color-ink',
  '--color-accent',
  '--color-alert',
  '--color-border',
  '--color-surface'
]) {
  assert.ok(tokensCss.includes(token), `tokens.css must define ${token}`);
}

assert.match(
  tokensCss,
  /\[data-theme="dark"\]\s*\{/,
  'tokens.css must include a dark theme token block'
);

assert.match(
  tokensCss,
  /:focus-visible\s*\{/,
  'tokens.css must include a visible focus ring rule'
);

console.log('Hallmark token tests passed.');
