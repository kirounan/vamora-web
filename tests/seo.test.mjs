import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, after, test } from "node:test";
import { createServer } from "vite";
let server, getPageMeta, renderHead, resolveLocale, languageHref, renderPage;
before(async () => {
  server = await createServer({
  server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  ({ getPageMeta, renderHead } = await server.ssrLoadModule("/src/lib/seo.ts"));
  ({ resolveLocale, languageHref } =
    await server.ssrLoadModule("/src/lib/locale.ts"));
  ({ renderPage } = await server.ssrLoadModule("/src/prerender.tsx"));
});
after(async () => await server?.close());
test("Arabic is default; public English URLs win and functional pages accept explicit language", () => {
  assert.equal(resolveLocale("/"), "ar");
  assert.equal(resolveLocale("/en"), "en");
  assert.equal(resolveLocale("/en/privacy-policy"), "en");
  assert.equal(resolveLocale("/privacy-policy", "?lang=en"), "ar");
  assert.equal(resolveLocale("/team-invite/MiXeD", "?lang=en"), "en");
});
test("language switch preserves exact path, encoded tokens, other parameters, and fragments", () => {
  assert.equal(
    languageHref(
      "/team-invite/AbC%3Fnext%3Dx",
      "?ref=friend&lang=ar",
      "#help",
      "en",
    ),
    "/team-invite/AbC%3Fnext%3Dx?ref=friend&lang=en#help",
  );
  assert.equal(
    languageHref("/privacy-policy", "", "#retention", "en"),
    "/en/privacy-policy#retention",
  );
  assert.equal(languageHref("/en", "", "#faq", "ar"), "/#faq");
});
test("public pages render meaningful Arabic/English content and localized metadata without JavaScript", () => {
  for (const path of ["/", "/en", "/privacy-policy", "/en/privacy-policy"]) {
    const { html, head, locale } = renderPage(path);
    assert.ok(html.includes("<h1"));
    assert.ok(html.length > 8000);
    assert.ok(head.includes('rel="canonical"'));
    assert.ok(head.includes('hreflang="ar"'));
    assert.ok(head.includes('hreflang="en"'));
    assert.ok(head.includes("index, follow"));
    assert.equal(locale, path.startsWith("/en") ? "en" : "ar");
  }
  const ar = renderPage("/privacy-policy").html,
    en = renderPage("/en/privacy-policy").html;
  for (const id of [
    "info-we-collect",
    "legal-basis",
    "sharing",
    "retention",
    "deletion",
    "your-rights",
    "children",
    "contact",
  ]) {
    assert.ok(ar.includes('id="' + id + '"'));
    assert.ok(en.includes('id="' + id + '"'));
  }
  assert.ok(ar.includes("٣ مايو ٢٠٢٦"));
  assert.ok(en.includes("May 3, 2026"));
  assert.ok(renderPage("/").html.includes("صحابك."));
  assert.ok(renderPage("/en").html.includes("Your mates."));
});
test("utility metadata is noindex and never contains invitation tokens or query values", () => {
  for (const path of [
    "/team-invite/SECRET_Token",
    "/captain-invite/SECRET_Token",
    "/join/SECRET_Token",
    "/competition/SECRET_Token",
    "/delete-account",
    "/not-a-page",
  ]) {
    const head = renderHead(getPageMeta(path, "?lang=en&token=PRIVATE_QUERY"));
    assert.ok(head.includes("noindex, follow"));
    assert.ok(!head.includes("SECRET_Token"));
    assert.ok(!head.includes("PRIVATE_QUERY"));
    assert.ok(!head.includes('rel="canonical"'));
  }
});
test("public structured data is factual and excludes invented ratings", () => {
  const head = renderPage("/").head;
  assert.ok(head.includes("application/ld+json"));
  assert.ok(head.includes('"@type":"Organization"'));
  assert.ok(head.includes('"@type":"WebSite"'));
  assert.ok(!head.includes("aggregateRating"));
});
test("account deletion remains absent from public navigation and public sitemap", async () => {
  for (const path of ["/", "/en", "/privacy-policy", "/en/privacy-policy"])
    assert.ok(!renderPage(path).html.includes('href="/delete-account'));
  const sitemap = await readFile("public/sitemap.xml", "utf8");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 4);
  assert.ok(!sitemap.includes("invite"));
  assert.ok(!sitemap.includes("delete-account"));
});
