import { useLocation } from "react-router-dom";

export type Locale = "ar" | "en";
export function resolveLocale(pathname: string, search = ""): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/" || pathname === "/privacy-policy") return "ar";
  return new URLSearchParams(search).get("lang") === "en" ? "en" : "ar";
}
export function languageHref(
  pathname: string,
  search: string,
  hash: string,
  next: Locale,
) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (["/", "/en"].includes(path)) return (next === "en" ? "/en" : "/") + hash;
  if (["/privacy-policy", "/en/privacy-policy"].includes(path))
    return (next === "en" ? "/en/privacy-policy" : "/privacy-policy") + hash;
  const params = new URLSearchParams(search);
  params.set("lang", next);
  return pathname + "?" + params.toString() + hash;
}
export function useLocale() {
  const location = useLocation();
  const locale = resolveLocale(location.pathname, location.search);
  const ar = locale === "ar";
  return {
    locale,
    ar,
    home: ar ? "/" : "/en",
    privacy: ar ? "/privacy-policy" : "/en/privacy-policy",
    t: (en: string, arabic: string) => (ar ? arabic : en),
    switchHref: languageHref(
      location.pathname,
      location.search,
      location.hash,
      ar ? "en" : "ar",
    ),
  };
}
