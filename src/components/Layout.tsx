import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocale } from "../lib/locale";
import { SUPPORT_EMAIL } from "../config";
import PageMetadata from "./PageMetadata";
import Icon from "./Icon";
export default function Layout() {
  const { t, ar, home, privacy, switchHref } = useLocale();
  const location = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const current = location.pathname + location.search + location.hash;
  const menuOpen = menuPath === current;
  const close = () => setMenuPath(null);
  return (
    <div className="site">
      <PageMetadata />
      <a className="skip-link" href="#main-content">
        {t("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link
            to={home}
            className="brand"
            aria-label={t("Vamora home", "Vamora — الرئيسية")}
            onClick={close}
          >
            <picture>
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/assets/plates/logo.png"
                width="60"
                height="60"
                alt=""
              />
            </picture>
            <span lang="en" dir="ltr">
              VAMORA
            </span>
          </Link>
          <nav
            className="desktop-nav"
            aria-label={t("Primary navigation", "التنقل الرئيسي")}
          >
            <a href={home + "#how-it-works"}>{t("How to play", "كيف تلعب")}</a>
            <a href={home + "#features"}>{t("Features", "المميزات")}</a>
            <a href={home + "#faq"}>{t("FAQs", "الأسئلة الشائعة")}</a>
          </nav>
          <div className="header-actions">
            <Link
              className="language-link"
              to={switchHref}
              lang={ar ? "en" : "ar"}
              hrefLang={ar ? "en" : "ar"}
              aria-label={ar ? "View in English" : "العرض بالعربية"}
              onClick={close}
            >
              {ar ? "EN" : "عربي"}
            </Link>
            <a
              className="btn btn-primary header-download"
              href={home + "#download"}
            >
              {t("Get the app", "حمّل التطبيق")}
              <Icon name="download" size={19} />
            </a>
            <button
              id="menu-toggle"
              className="menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={t(
                menuOpen ? "Close navigation" : "Open navigation",
                menuOpen ? "إغلاق القائمة" : "فتح القائمة",
              )}
              onClick={() => setMenuPath(menuOpen ? null : current)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label={t("Mobile navigation", "قائمة الهاتف")}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                close();
                document.getElementById("menu-toggle")?.focus();
              }
            }}
          >
            <a onClick={close} href={home + "#how-it-works"}>
              {t("How to play", "كيف تلعب")}
            </a>
            <a onClick={close} href={home + "#features"}>
              {t("Features", "المميزات")}
            </a>
            <a onClick={close} href={home + "#faq"}>
              {t("FAQs", "الأسئلة الشائعة")}
            </a>
            <a onClick={close} href={home + "#download"}>
              {t("Get the app", "حمّل التطبيق")}
            </a>
          </nav>
        )}
      </header>
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-top">
          <Link
            className="brand"
            to={home}
            aria-label={t("Vamora home", "Vamora — الرئيسية")}
          >
            <picture>
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/assets/plates/logo.png"
                width="48"
                height="48"
                loading="lazy"
                alt=""
              />
            </picture>
            <span lang="en" dir="ltr">
              VAMORA
            </span>
          </Link>
          <p>
            {t(
              "The game is better when it’s yours.",
              "الكورة أحلى لما تكون حكايتكم.",
            )}
          </p>
          <div className="footer-links">
            <Link to={privacy}>{t("Privacy Policy", "سياسة الخصوصية")}</Link>
            <a href={"mailto:" + SUPPORT_EMAIL}>
              {t("Contact us", "تواصل معنا")}
            </a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Vamora.{" "}
            {t("All rights reserved.", "جميع الحقوق محفوظة.")}
          </span>
          <span>
            {t(
              "Built by 2MK. Made for your game.",
              "صُنع بواسطة 2MK. من أجل كورتكم.",
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
