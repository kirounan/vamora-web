import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

let server;
let App;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  App = (await server.ssrLoadModule('/src/App.tsx')).default;
});
after(async () => { await server?.close(); });

function renderRoute(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)));
}

test('captain link renders app handoff and preserves the exact case-sensitive token', () => {
  const html = renderRoute('/captain-invite/AbC_123-xYz');
  assert.ok(html.includes('href="vamora://open/captain-invite/AbC_123-xYz"'));
  assert.ok(html.includes('Set up your team'));
  assert.ok(html.includes('Open in Vamora App'));
  assert.ok(html.includes('Sign in there'));
});

test('encoded token remains one path segment and cannot introduce app URL parameters', () => {
  const html = renderRoute('/captain-invite/AbC%3Fnext%3Dother%23fragment');
  assert.ok(html.includes('href="vamora://open/captain-invite/AbC%3Fnext%3Dother%23fragment"'));
});

test('existing competition invite continues to open the join route', () => {
  assert.ok(renderRoute('/join/abc123').includes('href="vamora://open/join/ABC123"'));
});

test('Apple association and standalone static server cover captain handoff', async () => {
  const association = JSON.parse(await readFile('public/.well-known/apple-app-site-association', 'utf8'));
  assert.ok(association.applinks.details.some(detail => detail.components.some(rule => rule['/'] === '/captain-invite/*')));
  const config = JSON.parse(await readFile('public/serve.json', 'utf8'));
  assert.ok(config.headers.some(rule => rule.source === '.well-known/apple-app-site-association' && rule.headers.some(h => h.key === 'Content-Type' && h.value === 'application/json')));
});
