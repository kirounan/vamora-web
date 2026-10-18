import assert from "node:assert/strict";
import { before, after, beforeEach, afterEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
let server, DeleteAccount, root, dom, calls, respond;
const originalFetch = globalThis.fetch;
before(async () => {
  server = await createServer({
  server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  DeleteAccount = (await server.ssrLoadModule("/src/pages/DeleteAccount.tsx"))
    .default;
});
after(async () => {
  await server?.close();
  globalThis.fetch = originalFetch;
});
beforeEach(async () => {
  dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/delete-account?lang=en",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  calls = [];
  respond = async (url) =>
    url.endsWith("/signin")
      ? new Response(
          JSON.stringify({
            accessToken: "MOCK_TOKEN",
            user: { id: "test", email: "test@example.com" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      : new Response(null, { status: 204 });
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return respond(url, options);
  };
  root = createRoot(document.getElementById("root"));
  await act(async () =>
    root.render(
      createElement(
        MemoryRouter,
        { initialEntries: ["/delete-account?lang=en"] },
        createElement(DeleteAccount),
      ),
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.fetch = originalFetch;
});
const button = (text) =>
  [...document.querySelectorAll("button")].find((n) =>
    n.textContent.includes(text),
  );
const submit = async () =>
  act(async () =>
    document
      .querySelector("form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
test("sign-in alone never deletes; explicit acknowledgement and final action are required", async () => {
  await submit();
  assert.equal(calls.length, 1);
  assert.ok(button("Permanently").disabled);
  await act(async () => button("Permanently").click());
  assert.equal(calls.length, 1);
  await act(async () => document.querySelector("input[type=checkbox]").click());
  assert.equal(button("Permanently").disabled, false);
  await act(async () => button("Permanently").click());
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.method, "DELETE");
  assert.equal(calls[1].options.headers.Authorization, "Bearer MOCK_TOKEN");
  assert.ok(
    document
      .querySelector("[role=status]")
      .textContent.includes("has been deleted"),
  );
  assert.equal(window.localStorage.length, 0);
  assert.equal(window.sessionStorage.length, 0);
});
test("cancel clears confirmation state without a deletion request", async () => {
  await submit();
  await act(async () => document.querySelector("input[type=checkbox]").click());
  await act(async () => button("Cancel").click());
  assert.ok(document.querySelector("form"));
  assert.equal(calls.length, 1);
  await submit();
  assert.ok(button("Permanently").disabled);
});
test("failed deletion remains recoverable and does not show success", async () => {
  await submit();
  await act(async () => document.querySelector("input[type=checkbox]").click());
  respond = async () =>
    new Response(JSON.stringify({ message: "Please try again." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  await act(async () => button("Permanently").click());
  assert.ok(
    document
      .querySelector("[role=alert]")
      .textContent.includes("Please try again"),
  );
  assert.equal(document.querySelector("[role=status]"), null);
  assert.equal(button("Permanently").disabled, false);
});
test("expired deletion session returns to sign-in", async () => {
  await submit();
  await act(async () => document.querySelector("input[type=checkbox]").click());
  respond = async () =>
    new Response("{}", {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  await act(async () => button("Permanently").click());
  assert.ok(document.querySelector("form"));
  assert.ok(
    document.querySelector("[role=alert]").textContent.includes("expired"),
  );
});
test("failed sign-in never exposes the destructive action", async () => {
  respond = async () =>
    new Response("{}", {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  await submit();
  assert.ok(document.querySelector("[role=alert]"));
  assert.equal(button("Permanently"), undefined);
});
