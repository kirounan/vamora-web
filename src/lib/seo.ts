import { WEBSITE_URL } from "../config";
import { resolveLocale } from "./locale";
import type { Locale } from "./locale";

export interface PageMeta {
  title: string;
  description: string;
  locale: Locale;
  index: boolean;
  canonical?: string;
  alternate?: string;
  kind: "home" | "privacy" | "utility" | "admin";
}
export function getPageMeta(pathname: string, search = ""): PageMeta {
  const path = pathname.replace(/\/$/, "") || "/";
  const locale = resolveLocale(path, search);
  const ar = locale === "ar";
  const base = { locale, index: false, kind: "utility" as const };
  if (path === "/admin" || path.startsWith("/admin/"))
    return { locale: "en", index: false, kind: "admin", title: "Tournament control | Vamora", description: "Private Vamora administration." };
  if (path === "/" || path === "/en")
    return {
      ...base,
      kind: "home",
      index: true,
      title: ar
        ? "Vamora | صحابك. ملعبك. مجدك."
        : "Vamora | Your mates. Your pitch. Your glory.",
      description: ar
        ? "حوّل ماتشاتك الحقيقية لدوري وفانتازي مع صحابك. كوّن فريقك، تابع نقاطك وتقييمك، ونظّم بطولتك مع Vamora على iOS وAndroid."
        : "Turn real football with friends into leagues and fantasy squads. Track match events, player ratings and leaderboards. Get Vamora for iOS and Android.",
      canonical: WEBSITE_URL + (ar ? "/" : "/en"),
      alternate: WEBSITE_URL + (ar ? "/en" : "/"),
    };
  if (path === "/privacy-policy" || path === "/en/privacy-policy")
    return {
      ...base,
      kind: "privacy",
      index: true,
      title: ar ? "سياسة الخصوصية | Vamora" : "Privacy Policy | Vamora",
      description: ar
        ? "تعرّف على البيانات التي يجمعها Vamora، واستخدامها ومشاركتها والاحتفاظ بها، وحقوقك في الوصول إليها أو حذفها."
        : "Read how Vamora collects, uses, shares and retains personal data, and how to exercise your privacy and deletion rights.",
      canonical: WEBSITE_URL + path,
      alternate: WEBSITE_URL + (ar ? "/en/privacy-policy" : "/privacy-policy"),
    };
  const key = path.split("/")[1];
  const labels: Record<string, [string, string]> = {
    "delete-account": ["Delete your account", "حذف حسابك"],
    "team-invite": ["Team invitation", "دعوة فريق"],
    "captain-invite": ["Captain invitation", "دعوة كابتن"],
    join: ["Competition invitation", "دعوة منافسة"],
    c: ["Competition invitation", "دعوة منافسة"],
    competition: ["Open competition", "فتح المنافسة"],
    competitions: ["Open competition", "فتح المنافسة"],
    home: ["Open Vamora", "فتح Vamora"],
    upcoming: ["Upcoming games", "المنافسات القادمة"],
    play: ["Play in Vamora", "العب في Vamora"],
    profile: ["Your profile", "ملفك الشخصي"],
    settings: ["Settings", "الإعدادات"],
    login: ["Log in", "تسجيل الدخول"],
    signup: ["Sign up", "إنشاء حساب"],
  };
  const label = labels[key] ?? ["Page not found", "الصفحة غير موجودة"];
  return {
    ...base,
    title: label[ar ? 1 : 0] + " | Vamora",
    description: ar
      ? "تابع بأمان في تطبيق Vamora أو ارجع إلى الصفحة الرئيسية."
      : "Continue securely in the Vamora app or return to the homepage.",
  };
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function renderHead(meta: PageMeta) {
  const tag = (name: string, value: string, property = false) =>
    `<meta data-route-meta ${property ? "property" : "name"}="${name}" content="${escape(value)}">`;
  const url = meta.canonical;
  const tags = [
    `<title data-route-meta>${escape(meta.title)}</title>`,
    tag("description", meta.description),
    tag("robots", meta.index ? "index, follow" : meta.kind === "admin" ? "noindex, nofollow" : "noindex, follow"),
    tag("og:title", meta.title, true),
    tag("og:description", meta.description, true),
    tag("og:type", "website", true),
    tag("og:site_name", "Vamora", true),
    tag("og:locale", meta.locale === "ar" ? "ar_EG" : "en_US", true),
    tag("og:image", WEBSITE_URL + "/images/social.webp", true),
    tag("og:image:width", "1200", true),
    tag("og:image:height", "630", true),
    tag(
      "og:image:alt",
      meta.locale === "ar"
        ? "أصدقاء يلعبون كرة القدم على ملعب مضاء"
        : "Friends playing football on a floodlit community pitch",
      true,
    ),
    tag("twitter:card", "summary_large_image"),
    tag("twitter:title", meta.title),
    tag("twitter:description", meta.description),
    tag("twitter:image", WEBSITE_URL + "/images/social.webp"),
  ];
  if (url)
    tags.push(
      `<link data-route-meta rel="canonical" href="${url}">`,
      tag("og:url", url, true),
    );
  if (meta.alternate) {
    for (const lang of ["ar", "en", "x-default"])
      tags.push(
        `<link data-route-meta rel="alternate" hreflang="${lang}" href="${lang === "en" ? (meta.locale === "en" ? url : meta.alternate) : meta.locale === "ar" ? url : meta.alternate}">`,
      );
    tags.push(
      tag(
        "og:locale:alternate",
        meta.locale === "ar" ? "en_US" : "ar_EG",
        true,
      ),
    );
  }
  if (meta.kind === "home") {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": WEBSITE_URL + "/#organization",
          name: "Vamora",
          url: WEBSITE_URL,
          logo: WEBSITE_URL + "/icon-512.png",
          email: "m2ktechies@gmail.com",
        },
        {
          "@type": "WebSite",
          "@id": WEBSITE_URL + "/#website",
          name: "Vamora",
          url: WEBSITE_URL,
          inLanguage: ["ar", "en"],
          publisher: { "@id": WEBSITE_URL + "/#organization" },
        },
      ],
    };
    tags.push(
      `<script data-route-meta type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
    );
  }
  return tags.join("\n");
}
