import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMeta, renderHead } from "../lib/seo";
export default function PageMetadata() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const meta = getPageMeta(pathname, search);
    document.documentElement.lang = meta.locale;
    document.documentElement.dir = meta.locale === "ar" ? "rtl" : "ltr";
    document.head
      .querySelectorAll("[data-route-meta]")
      .forEach((node) => node.remove());
    document.head.insertAdjacentHTML("beforeend", renderHead(meta));
  }, [pathname, search]);
  return null;
}
