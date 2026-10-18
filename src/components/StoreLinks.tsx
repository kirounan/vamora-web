import { useLocale } from "../lib/locale";
import Icon from "./Icon";
export const APPLE_URL = "https://apps.apple.com/us/app/vamora/id6774752743";
export const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.vamora.fanasicomob";
export default function StoreLinks() {
  const { t } = useLocale();
  return (
    <div className="store-links" dir="ltr">
      <a
        className="store-link"
        href={APPLE_URL}
        aria-label={t(
          "Download Vamora on the App Store",
          "حمّل Vamora من App Store",
        )}
      >
        <Icon name="apple" size={29} />
        <span>
          <small>{t("Download on the", "حمّل من")}</small>
          <strong>App Store</strong>
        </span>
      </a>
      <a
        className="store-link"
        href={PLAY_URL}
        aria-label={t(
          "Get Vamora on Google Play",
          "حمّل Vamora من Google Play",
        )}
      >
        <Icon name="play" size={29} />
        <span>
          <small>{t("Get it on", "متاح على")}</small>
          <strong>Google Play</strong>
        </span>
      </a>
    </div>
  );
}
