import { Link } from "react-router-dom";
import { useLocale } from "../lib/locale";
export default function NotFound() {
  const { t, home, privacy } = useLocale();
  return (
    <section className="utility-section container-narrow">
      <span className="error-code" aria-hidden="true">
        404
      </span>
      <h1>{t("This one went out of play.", "الكورة طلعت برّه الملعب.")}</h1>
      <p className="utility-lead">
        {t(
          "The page you’re looking for doesn’t exist or has moved. Let’s get you back to the game.",
          "الصفحة اللي بتدور عليها مش موجودة أو اتنقلت. نرجعك للملعب؟",
        )}
      </p>
      <div className="hero-actions">
        <Link className="btn btn-primary" to={home}>
          {t("Back to home", "ارجع للرئيسية")}
        </Link>
        <Link className="btn btn-ghost" to={privacy}>
          {t("Privacy Policy", "سياسة الخصوصية")}
        </Link>
      </div>
    </section>
  );
}
