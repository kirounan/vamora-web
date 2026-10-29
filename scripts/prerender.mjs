import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { renderPage } = await server.ssrLoadModule("/src/prerender.tsx");
  const template = await readFile("dist/index.html", "utf8");
  for (const path of ["/", "/en", "/privacy-policy", "/en/privacy-policy"]) {
    const { html, head, locale } = renderPage(path);
    const target = path === "/" ? "dist/index.html" : `dist${path}/index.html`;
    await mkdir(target.slice(0, target.lastIndexOf("/")), { recursive: true });
    await writeFile(
      target,
      template
        .replace(
          /<html[^>]*>/,
          `<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">`,
        )
        .replace("<!--route-head-->", head)
        .replace(
          '<div id="root"></div>',
          `<div id="root" data-prerendered="true" data-path="${path}">${html}</div>`,
        ),
    );
  }
  const { getPageMeta, renderHead } = await server.ssrLoadModule("/src/lib/seo.ts");
  await mkdir("dist/admin", { recursive: true });
  await writeFile("dist/admin/index.html", template
    .replace(/<html[^>]*>/, '<html lang="en" dir="ltr">')
    .replace("<!--route-head-->", renderHead(getPageMeta("/admin"))));
  const fallback = renderPage("/not-found");
  await writeFile(
    "dist/app.html",
    template
      .replace("<!--route-head-->", fallback.head)
      .replace(
        "</body>",
        '<noscript><main style="max-width:700px;margin:60px auto;padding:24px;font-family:sans-serif"><h1>Vamora</h1><p>يرجى تفعيل JavaScript لفتح رابط التطبيق أو إدارة حسابك.</p><p dir="ltr">Please enable JavaScript to open the app link or manage your account.</p><a href="/">الرئيسية</a> · <a href="/en">English homepage</a></main></noscript></body>',
      ),
  );
  await writeFile(
    "dist/404.html",
    template
      .replace("<!--route-head-->", fallback.head)
      .replace(
        '<div id="root"></div>',
        `<div id="root" data-prerendered="true" data-path="/not-found">${fallback.html}</div>`,
      ),
  );
  console.log(
    "Pre-rendered Arabic and English public pages; separate noindex app fallback.",
  );
} finally {
  await server.close();
}
