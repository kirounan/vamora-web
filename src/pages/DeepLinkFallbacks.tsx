import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocale } from "../lib/locale";
import StoreLinks from "../components/StoreLinks";
import Icon from "../components/Icon";

type AppScreen =
  | "home"
  | "upcoming"
  | "play"
  | "profile"
  | "settings"
  | "login"
  | "signup";
function AutoOpenApp({ appUrl }: { appUrl: string }) {
  const lastAttempt = useRef<string | null>(null);
  useEffect(() => {
    if (lastAttempt.current === appUrl) return;
    lastAttempt.current = appUrl;
    try {
      window.location.assign(appUrl);
    } catch {
      /* The explicit link remains available when the browser requires a gesture. */
    }
  }, [appUrl]);
  return null;
}
function Handoff({
  path,
  title,
  body,
  code,
  requiresLogin = false,
}: {
  path: string;
  title: string;
  body: string;
  code?: string;
  requiresLogin?: boolean;
}) {
  const { t, home, locale } = useLocale();
  const appUrl = "vamora://open/" + path;
  return (
    <section className="utility-section container-narrow" lang={locale}>
      <AutoOpenApp appUrl={appUrl} />
      <img
        className="utility-logo"
        src="/images/logo.webp"
        width="72"
        height="76"
        alt=""
      />
      <h1>{title}</h1>
      <p className="utility-lead">{body}</p>
      {code && (
        <div className="code-block">
          <span>{t("Invite code", "كود الدعوة")}</span>
          <strong
            className="invite-code"
            dir="ltr"
            aria-label={t("Competition invite code", "كود دعوة المنافسة")}
          >
            {code}
          </strong>
        </div>
      )}
      {requiresLogin && (
        <p>
          {t(
            "You may need to log in before this screen is available in the app.",
            "قد تحتاج إلى تسجيل الدخول للوصول إلى هذه الشاشة في التطبيق.",
          )}
        </p>
      )}
      <div className="hero-actions">
        <a href={appUrl} className="btn btn-primary">
          {t("Open in Vamora App", "افتح في تطبيق Vamora")}
          <Icon name="arrow" size={19} />
        </a>
        <Link to={home} className="btn btn-ghost">
          {t("Learn about Vamora", "اعرف أكتر عن Vamora")}
        </Link>
      </div>
      <div className="handoff-help">
        <h2>{t("Don’t have the app yet?", "لسّه ما حمّلتش التطبيق؟")}</h2>
        <p>
          {t(
            "Install Vamora, then return to this link. If opening is blocked in an in-app browser, open this page in Safari or Chrome.",
            "حمّل Vamora وبعدها ارجع لنفس الرابط. لو التطبيق مش بيفتح من متصفح داخلي، افتح الصفحة في Safari أو Chrome.",
          )}
        </p>
        <StoreLinks />
      </div>
    </section>
  );
}
export function OpenAppFallback({ screen }: { screen: AppScreen }) {
  const { t } = useLocale();
  const names: Record<AppScreen, [string, string]> = {
    home: ["Home", "الرئيسية"],
    upcoming: ["Upcoming Games", "المنافسات القادمة"],
    play: ["Play", "اللعب"],
    profile: ["Profile", "الملف الشخصي"],
    settings: ["Settings", "الإعدادات"],
    login: ["Log In", "تسجيل الدخول"],
    signup: ["Sign Up", "إنشاء حساب"],
  };
  const title = t(
    "Open " + names[screen][0] + " in Vamora",
    "افتح " + names[screen][1] + " في Vamora",
  );
  return (
    <Handoff
      path={screen}
      title={title}
      body={t(
        "Continue in the mobile app. If it doesn’t open automatically, use the button below.",
        "كمّل في تطبيق الموبايل. لو ما فتحش تلقائيًا، استخدم الزر الموجود تحت.",
      )}
      requiresLogin={["profile", "settings", "login", "signup"].includes(
        screen,
      )}
    />
  );
}
export function JoinInvitePage() {
  const { competitionCode } = useParams();
  const { t } = useLocale();
  const code = competitionCode?.toUpperCase() ?? "";
  return (
    <Handoff
      path={code ? "join/" + encodeURIComponent(code) : "join"}
      code={code}
      title={t("Join a Vamora competition", "انضم لمنافسة في Vamora")}
      body={t(
        code
          ? "Open this invitation in Vamora to join the competition."
          : "Enter your invite code inside the Vamora app to join a competition.",
        code
          ? "افتح الدعوة في Vamora للانضمام إلى المنافسة."
          : "اكتب كود الدعوة داخل تطبيق Vamora للانضمام إلى المنافسة.",
      )}
    />
  );
}
export function CaptainInvitePage() {
  const { token } = useParams();
  const { t } = useLocale();
  return (
    <Handoff
      path={"captain-invite/" + encodeURIComponent(token ?? "")}
      title={t("Set up your team in Vamora", "جهّز فريقك في Vamora")}
      body={t(
        "New captains now request approval inside the competition. Unused captain links no longer grant captain access. Previously claimed setup remains available in the app.",
        "الكباتن الجدد بيطلبوا الموافقة من داخل المنافسة. روابط الكابتن غير المستخدمة لم تعد تمنح صلاحية الكابتن. الإعدادات اللي تم قبولها سابقًا تظل متاحة في التطبيق.",
      )}
    />
  );
}
export function CompetitionFallbackPage() {
  const { competitionId } = useParams();
  const { t } = useLocale();
  return (
    <Handoff
      path={"competition/" + encodeURIComponent(competitionId ?? "")}
      title={t("Open competition", "افتح المنافسة")}
      body={t(
        "Open Vamora to see competition details, fixtures, and standings.",
        "افتح Vamora لمشاهدة تفاصيل المنافسة والمواجهات والترتيب.",
      )}
    />
  );
}
export function TeamInvitePage() {
  const { token } = useParams();
  const { t } = useLocale();
  return (
    <Handoff
      path={"team-invite/" + encodeURIComponent(token ?? "")}
      title={t("Join your team in Vamora", "انضم لفريقك في Vamora")}
      body={t(
        "Open the app, sign in, and confirm joining the team. Opening this link alone does not add you to the roster.",
        "افتح التطبيق وسجّل دخولك وأكّد انضمامك للفريق. فتح الرابط وحده لا يضيفك إلى قائمة الفريق.",
      )}
    />
  );
}
