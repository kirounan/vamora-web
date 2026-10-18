import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, deleteMyAccount, signIn } from "../lib/api";
import { SUPPORT_EMAIL } from "../config";
import { useLocale } from "../lib/locale";
import Icon from "../components/Icon";

type Step = "signin" | "confirm" | "done";
interface AuthedUser {
  id: string;
  email: string;
  name?: string | null;
  nickname?: string | null;
}
const PREFILLED_EMAIL = "delete_vamora@gmail.com";
const PREFILLED_PASSWORD = "Test123?";

export default function DeleteAccount() {
  const { t, privacy, home, ar } = useLocale();
  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState(PREFILLED_EMAIL);
  const [password, setPassword] = useState(PREFILLED_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function errorText(err: unknown, action: "signin" | "delete") {
    if (err instanceof ApiError) {
      if (err.status === 401)
        return t(
          "Your email or password is incorrect, or your session has expired. Please sign in again.",
          "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو انتهت جلستك. سجّل الدخول مرة أخرى.",
        );
      if (!ar) return err.message;
    }
    return action === "signin"
      ? t(
          "We could not sign you in. Check your connection and try again.",
          "تعذّر تسجيل دخولك. تحقق من اتصالك وحاول مرة أخرى.",
        )
      : t(
          "We could not delete your account. Please try again in a few minutes.",
          "تعذّر حذف حسابك. يُرجى المحاولة مرة أخرى بعد بضع دقائق.",
        );
  }
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!email.trim() || !password) {
      setError(
        t(
          "Please enter both your email and password.",
          "يُرجى إدخال البريد الإلكتروني وكلمة المرور.",
        ),
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(
        t("Enter a valid email address.", "أدخل عنوان بريد إلكتروني صالحًا."),
      );
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(email.trim(), password);
      if (!res.accessToken || !res.user?.email)
        throw new Error("Invalid sign-in response");
      setAccessToken(res.accessToken);
      setUser(res.user);
      setAcknowledged(false);
      setStep("confirm");
    } catch (err) {
      setError(errorText(err, "signin"));
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete() {
    if (!accessToken || !acknowledged || loading) return;
    setLoading(true);
    setError(null);
    try {
      await deleteMyAccount(accessToken);
      setAccessToken(null);
      setPassword("");
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAccessToken(null);
        setUser(null);
        setAcknowledged(false);
        setStep("signin");
      }
      setError(errorText(err, "delete"));
    } finally {
      setLoading(false);
    }
  }
  function cancel() {
    setAccessToken(null);
    setUser(null);
    setEmail(PREFILLED_EMAIL);
    setPassword(PREFILLED_PASSWORD);
    setAcknowledged(false);
    setError(null);
    setStep("signin");
  }
  return (
    <section className="account-section section container-narrow">
      <h1>{t("Delete your Vamora account", "حذف حسابك في Vamora")}</h1>
      <p className="account-intro">
        {t(
          "Permanently delete your account and the personal data associated with it. To verify it’s really you, please sign in first.",
          "احذف حسابك والبيانات الشخصية المرتبطة به نهائيًا. للتأكد من هويتك، يُرجى تسجيل الدخول أولًا.",
        )}
      </p>
      <div className="account-panel" aria-busy={loading}>
        {step === "signin" && (
          <>
            <h2>
              {t("Step 1 — Verify your identity", "الخطوة ١ — تأكيد هويتك")}
            </h2>
            <p>
              {t(
                "Sign in with the email and password you use in the Vamora app.",
                "سجّل الدخول بالبريد الإلكتروني وكلمة المرور المستخدمين في تطبيق Vamora.",
              )}
            </p>
            <p className="alert alert-info" role="note">
              {t(
                "Test credentials are pre-filled for app store reviewers. Replace them with your own account details to manage your account.",
                "بيانات حساب تجريبي مُعبأة مسبقًا لمراجعي متاجر التطبيقات. استبدلها ببيانات حسابك لإدارة حسابك.",
              )}
            </p>
            <form onSubmit={handleSignIn} noValidate>
              <div className="form-field">
                <label htmlFor="email">{t("Email", "البريد الإلكتروني")}</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error ? "account-error" : undefined}
                />
              </div>
              <div className="form-field">
                <label htmlFor="password">{t("Password", "كلمة المرور")}</label>
                <div className="password-field">
                  <input
                    id="password"
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    dir="ltr"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    disabled={loading}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    aria-label={t(
                      showPassword ? "Hide password" : "Show password",
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور",
                    )}
                  >
                    {t(
                      showPassword ? "Hide" : "Show",
                      showPassword ? "إخفاء" : "إظهار",
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p
                  id="account-error"
                  role="alert"
                  className="alert alert-error"
                >
                  {error}
                </p>
              )}
              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    {t("Signing in…", "جارٍ تسجيل الدخول…")}
                  </>
                ) : (
                  t("Sign in to continue", "سجّل الدخول للمتابعة")
                )}
              </button>
            </form>
            <p className="form-help">
              {t(
                "Your credentials are sent securely to our API and are not stored in this browser. You will confirm before any data is deleted.",
                "تُرسل بيانات دخولك بأمان إلى خوادمنا ولا تُخزّن في هذا المتصفح. ستؤكّد الطلب قبل حذف أي بيانات.",
              )}
            </p>
          </>
        )}
        {step === "confirm" && user && (
          <>
            <h2>{t("Step 2 — Confirm deletion", "الخطوة ٢ — تأكيد الحذف")}</h2>
            <p>
              {t("You’re signed in as", "أنت مسجّل الدخول باسم")}{" "}
              <bdi className="signed-in-email">{user.email}</bdi>
              {user.nickname && <> ({user.nickname})</>}.{" "}
              {t("This action is permanent.", "هذا الإجراء دائم.")}
            </p>
            <div className="alert alert-warning" role="note">
              <strong>
                {t(
                  "This will permanently delete:",
                  "سيؤدي هذا إلى حذف ما يلي نهائيًا:",
                )}
              </strong>
              <ul>
                <li>
                  {t(
                    "Your account, profile, and login credentials",
                    "حسابك وملفك الشخصي وبيانات تسجيل دخولك",
                  )}
                </li>
                <li>
                  {t(
                    "Your nickname, avatar, position, and other profile data",
                    "اسمك المستعار وصورتك ومركزك وبيانات ملفك الشخصي الأخرى",
                  )}
                </li>
                <li>
                  {t(
                    "Your match participations, ratings, and personal stats",
                    "مشاركاتك في المباريات وتقييماتك وإحصاءاتك الشخصية",
                  )}
                </li>
              </ul>
              <p>
                {t(
                  "Aggregate or anonymized records may be retained to keep historical leaderboards consistent for other players, as described in the Privacy Policy.",
                  "قد يتم الاحتفاظ بالسجلات الإجمالية أو المجهّلة للحفاظ على اتساق الترتيبات التاريخية للاعبين الآخرين، كما هو موضح في سياسة الخصوصية.",
                )}
              </p>
            </div>
            <label className="acknowledgement">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={loading}
              />
              <span>
                {t(
                  "I understand this action is permanent and my account and personal data cannot be recovered after deletion.",
                  "أفهم أن هذا الإجراء دائم، وأنه لا يمكن استعادة حسابي وبياناتي الشخصية بعد الحذف.",
                )}
              </span>
            </label>
            {error && (
              <p id="account-error" role="alert" className="alert alert-error">
                {error}
              </p>
            )}
            <div className="hero-actions">
              <button
                className="btn btn-danger"
                type="button"
                disabled={!acknowledged || loading}
                onClick={handleDelete}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    {t("Deleting…", "جارٍ الحذف…")}
                  </>
                ) : (
                  t("Permanently delete my account", "احذف حسابي نهائيًا")
                )}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={cancel}
                disabled={loading}
              >
                {t("Cancel", "إلغاء")}
              </button>
            </div>
          </>
        )}
        {step === "done" && (
          <div role="status">
            <div className="success-icon">
              <Icon name="check" size={30} />
            </div>
            <h2>{t("Your account has been deleted", "تم حذف حسابك")}</h2>
            <p>
              {t(
                "Your Vamora account and personal data have been permanently deleted from our active systems. Backup copies will be purged within 30 days as described in our",
                "تم حذف حسابك وبياناتك الشخصية نهائيًا من أنظمتنا النشطة. ستُمحى النسخ الاحتياطية خلال ٣٠ يومًا، كما هو موضح في",
              )}{" "}
              <Link className="inline-link" to={privacy}>
                {t("Privacy Policy", "سياسة الخصوصية")}
              </Link>
              .
            </p>
            <p>
              {t("For questions, contact", "لأي استفسارات، تواصل عبر")}{" "}
              <a
                className="inline-link"
                href={"mailto:" + SUPPORT_EMAIL}
                dir="ltr"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <Link to={home} className="btn btn-ghost">
              {t("Back to home", "ارجع للرئيسية")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
