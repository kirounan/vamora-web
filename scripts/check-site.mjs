import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
if (!process.argv[2])
  throw new Error(
    "Provide the URL of an already running site. This check does not start a server or change its port.",
  );
const origin = process.argv[2].replace(/\/$/, "");
for (const [path, lang, needle] of [
  ["/", "ar", "صحابك."],
  ["/en", "en", "Your mates."],
  ["/privacy-policy", "ar", "سياسة الخصوصية"],
  ["/en/privacy-policy", "en", "Privacy Policy"],
]) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  const html = await r.text(),
    doc = new JSDOM(html).window.document;
  assert.equal(doc.documentElement.lang, lang, path);
  assert.equal(doc.querySelectorAll("title").length, 1, path);
  assert.ok(doc.querySelector("#root").textContent.includes(needle), path);
  assert.equal(
    doc.querySelector("link[rel=canonical]")?.href,
    "https://vamora.net" + path,
    path,
  );
  assert.equal(
    doc.querySelector("meta[name=robots]")?.content,
    "index, follow",
    path,
  );
  assert.ok(doc.querySelector("link[hreflang=ar]"));
  assert.ok(doc.querySelector("link[hreflang=en]"));
  if (path === "/" || path === "/en")
    assert.ok(!doc.querySelector('a[href*="delete-account"]'));
  for (const tag of doc.querySelectorAll("script[src],link[rel=stylesheet]")) {
    const asset = tag.getAttribute("src") || tag.getAttribute("href");
    const res = await fetch(origin + asset);
    assert.equal(res.status, 200, asset);
    assert.ok(!res.headers.get("content-type")?.includes("text/html"), asset);
  }
  console.log("PASS public HTML", path, lang);
}
for (const path of [
  "/team-invite/AbC_1?lang=en",
  "/delete-account",
  "/unknown",
]) {
  const r = await fetch(origin + path),
    doc = new JSDOM(await r.text()).window.document;
  assert.equal(
    doc.querySelector("meta[name=robots]")?.content,
    "noindex, follow",
    path,
  );
  assert.ok(!doc.querySelector("link[rel=canonical]"), path);
  assert.ok(!doc.head.textContent.includes("AbC_1"), path);
  console.log("PASS private fallback", path);
}
for (const path of [
  "/.well-known/apple-app-site-association",
  "/.well-known/assetlinks.json",
]) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  assert.ok(r.headers.get("content-type").includes("application/json"), path);
  await r.json();
  console.log("PASS association JSON", path);
}
for (const path of [
  "/images/logo.webp",
  "/images/matchday-640.webp",
  "/icon-32.png",
  "/favicon.ico",
]) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  assert.ok(r.headers.get("content-type").includes("image"), path);
  console.log("PASS image", path);
}
for (const [path, needle] of [
  ["/robots.txt", "Sitemap: https://vamora.net/sitemap.xml"],
  ["/sitemap.xml", "<urlset"],
  ["/site.webmanifest", "Vamora"],
]) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  const s = await r.text();
  assert.ok(s.includes(needle), path);
  assert.ok(!s.includes("<html"), path);
  console.log("PASS discovery", path);
}
console.log("All static-host checks passed:", origin);
