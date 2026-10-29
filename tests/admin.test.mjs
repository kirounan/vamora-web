import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import { createElement, act, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
let vite, Enrollment, AdminApp, Operation, CompetitionRevision, root, dom, calls, respond, createRoot;
const originals = { window: globalThis.window, document: globalThis.document, FormData: globalThis.FormData, Event: globalThis.Event, HTMLElement: globalThis.HTMLElement, fetch: globalThis.fetch };
const competition = {
  id: 'competition-1', updatedAt: '2026-10-27T12:00:00.000Z', maxPlayersPerTeam: 6, playersInMatch: 5,
  teams: [{ id: 'team-1', name: 'Falcons', approvalStatus: 'APPROVED', members: Array.from({ length: 5 }, (_, i) => ({ userId: 'p' + i })) }],
};
before(async () => {
  const initialDom = new JSDOM('<div></div>');
  globalThis.window = initialDom.window; globalThis.document = initialDom.window.document;
  ({ createRoot } = await import('react-dom/client'));
  Object.assign(globalThis, originals); initialDom.window.close();
  vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  Enrollment = (await vite.ssrLoadModule('/src/admin/PlayerEnrollment.tsx')).default;
  AdminApp = (await vite.ssrLoadModule('/src/admin/AdminApp.tsx')).default;
  ({ Operation } = await vite.ssrLoadModule('/src/admin/components.tsx'));
  ({ CompetitionRevision } = await vite.ssrLoadModule('/src/admin/revision.ts'));
});
after(async () => { await vite?.close(); });
beforeEach(() => {
  dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/admin' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, FormData: dom.window.FormData, Event: dom.window.Event, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
  calls = [];
  respond = async () => new Response(JSON.stringify({ user: { id: 'new-guest', name: 'Late Guest' }, teamId: 'team-1' }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  globalThis.fetch = async (url, options = {}) => { calls.push({ url, options }); return respond(url, options); };
  root = createRoot(document.getElementById('root'));
});
afterEach(async () => {
  await act(async () => root.unmount()); dom.window.close();
  Object.assign(globalThis, originals); delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
const render = async (element) => act(async () => root.render(element));
const submit = async () => act(async () => document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
function fillEnrollment() {
  document.querySelector('input[name=name]').value = 'Late Guest';
  document.querySelector('input[name=reason]').value = 'Late arrival approved';
  document.querySelector('select[name=teamId]').value = 'team-1';
}
test('name-only guest enrollment carries team, reason and revision without silently changing capacity', async () => {
  let saved = false, closed = false;
  await render(createElement(Enrollment, { competition, saved: async () => { saved = true; }, close: () => { closed = true; } }));
  fillEnrollment(); await submit();
  assert.equal(calls.length, 1);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.name, 'Late Guest'); assert.equal(body.teamId, 'team-1');
  assert.equal(body.expectedUpdatedAt, competition.updatedAt); assert.equal(body.reason, 'Late arrival approved');
  assert.ok(body.requestId); assert.ok(!('maxPlayersPerTeam' in body));
  assert.equal(calls[0].options.credentials, 'include');
  assert.equal(saved, true); assert.equal(closed, true);
});
test('failed enrollment retains inputs and reuses its request ID when retried', async () => {
  respond = async () => new Response(JSON.stringify({ message: 'Team is full. Increase capacity explicitly.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  let closed = false;
  await render(createElement(Enrollment, { competition, saved: async () => {}, close: () => { closed = true; } }));
  fillEnrollment(); await submit(); await submit();
  assert.match(document.querySelector('[role=alert]').textContent, /Team is full/);
  assert.equal(document.querySelector('input[name=name]').value, 'Late Guest');
  assert.equal(JSON.parse(calls[0].options.body).requestId, JSON.parse(calls[1].options.body).requestId);
  assert.equal(closed, false);
});
test('registered-player enrollment requires a selected search result', async () => {
  await render(createElement(Enrollment, { competition, saved: async () => {}, close: () => {} }));
  await act(async () => document.querySelector('input[value=registered]').click());
  document.querySelector('input[name=reason]').value = 'Approved';
  await submit();
  assert.equal(calls.length, 0); assert.match(document.querySelector('[role=alert]').textContent, /Choose a player/);
});
test('admin login keeps credentials out of browser storage and uses the separate admin endpoint', async () => {
  respond = async (url) => new Response(JSON.stringify(url.endsWith('/auth/login')
    ? { username: 'operator', csrfToken: 'csrf-test' } : { message: 'Sign in' }),
  { status: url.endsWith('/auth/login') ? 201 : 401, headers: { 'Content-Type': 'application/json' } });
  await render(createElement(MemoryRouter, { initialEntries: ['/admin'] }, createElement(AdminApp)));
  document.querySelector('input[name=username]').value = 'operator';
  document.querySelector('input[name=password]').value = 'test-password';
  await submit();
  const login = calls.find((c) => c.url.endsWith('/admin/auth/login'));
  assert.ok(login); assert.deepEqual(JSON.parse(login.options.body), { username: 'operator', password: 'test-password' });
  assert.equal(login.options.credentials, 'include'); assert.ok(!login.options.headers.Authorization);
  assert.equal(window.localStorage.length, 0); assert.equal(window.sessionStorage.length, 0);
});
test('admin is unlisted and every static host entry serves a private English shell', async () => {
  const { getPageMeta, renderHead } = await vite.ssrLoadModule('/src/lib/seo.ts');
  for (const path of ['/admin', '/admin/competitions/test-id']) {
    const meta = getPageMeta(path); assert.equal(meta.locale, 'en'); assert.equal(meta.index, false);
    assert.match(renderHead(meta), /noindex, nofollow/); assert.equal(meta.canonical, undefined);
  }
  const [sitemap, layout, serve, vercel, prerender] = await Promise.all(['public/sitemap.xml', 'src/components/Layout.tsx', 'public/serve.json', 'vercel.json', 'scripts/prerender.mjs'].map((path) => readFile(path, 'utf8')));
  assert.ok(!sitemap.includes('/admin')); assert.ok(!layout.includes('/admin'));
  for (const host of [JSON.parse(serve), JSON.parse(vercel)]) {
    assert.ok(host.rewrites.some((r) => r.source === '/admin' && r.destination === '/admin/index.html'));
    assert.ok(host.headers.some((h) => h.source === '/admin' && h.headers.some((v) => v.key === 'X-Robots-Tag' && v.value === 'noindex, nofollow')));
  }
  assert.match(prerender, /dist\/admin\/index\.html/);
});
test('an open live-operation form advances its own revision and explicitly reviews independent changes', async () => {
  const submitted = [];
  let updateExternally;
  function Harness() {
    const [revision, setRevision] = useState('2026-10-27T12:00:00.000Z');
    updateExternally = setRevision;
    return createElement(CompetitionRevision.Provider, { value: revision }, createElement(Operation, {
      title: 'Record event', onSubmit: async (form) => {
        submitted.push(form.get('expectedUpdatedAt'));
        const next = '2026-10-27T12:00:0' + submitted.length + '.000Z';
        setRevision(next); return next;
      },
    }, createElement('input', { name: 'player', defaultValue: 'Chosen player' })));
  }
  await render(createElement(Harness));
  await act(async () => document.querySelector('summary').click());
  document.querySelector('input[name=reason]').value = 'Match event';
  await submit(); await submit();
  assert.deepEqual(submitted, ['2026-10-27T12:00:00.000Z', '2026-10-27T12:00:01.000Z']);
  assert.equal(document.querySelector('details').open, true);
  await act(async () => updateExternally('2026-10-27T12:00:05.000Z'));
  assert.equal(document.querySelector('input[name=expectedUpdatedAt]').value, '2026-10-27T12:00:02.000Z');
  await act(async () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Use latest data').click());
  assert.equal(document.querySelector('input[name=expectedUpdatedAt]').value, '2026-10-27T12:00:05.000Z');
  assert.equal(document.querySelector('input[name=player]').value, 'Chosen player');
});
