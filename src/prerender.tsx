import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { getPageMeta, renderHead } from "./lib/seo";
export function renderPage(path: string) {
  const meta = getPageMeta(path);
  return {
    html: renderToString(
      createElement(StaticRouter, { location: path }, createElement(App)),
    ),
    head: renderHead(meta),
    locale: meta.locale,
  };
}
