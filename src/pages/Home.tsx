import { useState, useRef } from "react";
import { useLocale } from "../lib/locale";
import StoreLinks from "../components/StoreLinks";
import Icon from "../components/Icon";

export default function Home() {
  const { t, ar } = useLocale();
  const [format, setFormat] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const steps = [
    [
      t("Bring your people.", "جمّع صحابك."),
      t(
        "Create a competition or join with an invite link or code. Your football group, all in one place.",
        "أنشئ منافسة أو انضم برابط دعوة أو كود. شلّة الكورة كلها في مكان واحد.",
      ),
    ],
    [
      t("Build your fantasy squad.", "كوّن فريقك الفانتازي."),
      t(
        "Pick players from the people you actually play with. Choose your starters, bench, and captain.",
        "اختار لاعيبتك من الناس اللي بتلعب معاهم فعلاً. حدّد الأساسيين والبدلاء والكابتن.",
      ),
    ],
    [
      t("Play. Then settle the score.", "العب. وسيب الأرقام تتكلم."),
      t(
        "Real goals, assists, and match events turn into fantasy points, ratings, and a leaderboard worth talking about.",
        "الأهداف والأسيست وأحداث الماتش الحقيقية تتحوّل لنقاط فانتازي وتقييمات وترتيب يستاهل الكلام عليه.",
      ),
    ],
  ];
  const formats = [
    {
      name: t("Gameday", "يوم كورة"),
      title: t("One day. All to play for.", "يوم واحد. منافسة للآخر."),
      body: t(
        "Make your regular football session a competition. A focused format for the group’s next game, capped at eight hours.",
        "حوّل حجز الكورة المعتاد لمنافسة. نظام مناسب لماتشات شلّتكم في يوم واحد، بحد أقصى ٨ ساعات.",
      ),
      best: t("Your next football session", "حجز الكورة الجاي"),
      manage: t(
        "Teams, fixtures, and match events",
        "الفرق والمواجهات وأحداث الماتش",
      ),
      follow: t(
        "Match results and fantasy points",
        "نتائج الماتشات ونقاط الفانتازي",
      ),
    },
    {
      name: t("League", "دوري"),
      title: t("Make every round matter.", "كل جولة تفرق."),
      body: t(
        "Build a season with a single or double round robin. Follow fixtures, standings, and the rivalries that grow week after week.",
        "اعمل موسم بنظام دوري من دور واحد أو دورين. تابع المباريات والترتيب والمنافسة اللي بتكبر كل أسبوع.",
      ),
      best: t("Groups that play regularly", "المجموعات اللي بتلعب بانتظام"),
      manage: t(
        "Rounds, fixtures, and league standings",
        "الجولات والمواجهات وجدول الدوري",
      ),
      follow: t(
        "League position and round points",
        "ترتيب الدوري ونقاط كل جولة",
      ),
    },
    {
      name: t("Cup", "كأس"),
      title: t("One bracket. One winner.", "مشوار واحد. بطل واحد."),
      body: t(
        "Give your group a knockout competition. Follow the bracket as teams advance toward the final.",
        "خلّي مجموعتكم تعيش منافسة خروج المغلوب. تابعوا مسار البطولة لحد الماتش النهائي.",
      ),
      best: t("Knockout competition", "منافسات خروج المغلوب"),
      manage: t(
        "The bracket, fixtures, and winners",
        "مسار البطولة والمواجهات والفائزين",
      ),
      follow: t("Who advances to the next round", "مين بيكمّل للجولة الجاية"),
    },
    {
      name: t("Groups + knockout", "مجموعات وإقصائيات"),
      title: t(
        "The full tournament feeling.",
        "إحساس البطولة من أولها لآخرها.",
      ),
      body: t(
        "Start in groups, then take the qualifiers into knockout rounds. A hybrid format for a competition with a bigger story.",
        "ابدأ بمجموعات، وبعدها خلّي المتأهلين يكملوا بأدوار خروج المغلوب. نظام يجمع رحلة المجموعات وحماس الإقصائيات.",
      ),
      best: t("A multi-stage tournament", "بطولة على أكتر من مرحلة"),
      manage: t(
        "Group standings and knockout fixtures",
        "ترتيب المجموعات ومواجهات الإقصائيات",
      ),
      follow: t("Qualification through to the final", "التأهل لحد النهائي"),
    },
  ];
  const current = formats[format];
  const faqs = [
    [
      t(
        "Is this fantasy football for professional leagues?",
        "هل دي فانتازي للدوريات المحترفة؟",
      ),
      t(
        "Vamora is built around your own football group. Your fantasy squad is made from the real people in your competition, and points come from their real match events.",
        "Vamora معمول لمجموعتكم أنتم. فريق الفانتازي بيتكوّن من اللاعبين الحقيقيين في منافستكم، والنقاط جاية من أحداث ماتشاتهم الفعلية.",
      ),
    ],
    [
      t("How do I join my friends?", "إزاي أنضم لصحابي؟"),
      t(
        "Download Vamora, create your profile, then open an invite link or enter the competition code shared by your host. Team invitations ask you to confirm joining inside the app.",
        "حمّل Vamora واعمل ملفك الشخصي، وبعدها افتح رابط الدعوة أو اكتب كود المنافسة اللي المنظّم بعتُه. دعوات الفرق بتحتاج تأكيد الانضمام جوّه التطبيق.",
      ),
    ],
    [
      t(
        "Who records what happens in a match?",
        "مين بيسجّل اللي بيحصل في الماتش؟",
      ),
      t(
        "The host and authorized competition or match admins manage fixtures and record real match events. Those events drive the competition’s results and fantasy points.",
        "المنظّم ومسؤولو المنافسة أو الماتش المصرّح لهم بيديروا المواجهات وبيسجّلوا أحداث الماتش الحقيقية. الأحداث دي هي أساس النتائج ونقاط الفانتازي.",
      ),
    ],
    [
      t(
        "Does Vamora handle entry fees or payments?",
        "هل Vamora بيحصّل اشتراكات أو فلوس؟",
      ),
      t(
        "No. Money never moves through Vamora. An optional entry-fee field is display-only; any arrangements happen outside the app. Vamora has no in-app purchases or ads.",
        "لا. مفيش فلوس بتتنقل من خلال Vamora. خانة رسوم الدخول اختيارية وللعرض فقط، وأي اتفاقات بتكون خارج التطبيق. مفيش مشتريات داخل التطبيق أو إعلانات.",
      ),
    ],
    [
      t(
        "Is it available in Arabic and English?",
        "هل التطبيق متاح بالعربي والإنجليزي؟",
      ),
      t(
        "Yes. Vamora supports Arabic and English. This website also has a complete version of each language—use the language control in the header to switch.",
        "أيوه. Vamora بيدعم العربي والإنجليزي. والموقع كمان له نسخة كاملة بكل لغة؛ غيّر اللغة من الزر الموجود أعلى الصفحة.",
      ),
    ],
    [
      t("Where can I get help?", "إزاي أتواصل لو محتاج مساعدة؟"),
      t(
        "Contact m2ktechies@gmail.com for support. For details about personal data, read the Privacy Policy linked in the footer.",
        "راسل m2ktechies@gmail.com للمساعدة. ولتفاصيل بياناتك الشخصية، اقرأ سياسة الخصوصية الموجودة أسفل الصفحة.",
      ),
    ],
  ];
  function moveTab(key: string) {
    let next: number;
    if (key === "Home") next = 0;
    else if (key === "End") next = formats.length - 1;
    else if (key === "ArrowRight")
      next = (format + (ar ? -1 : 1) + formats.length) % formats.length;
    else if (key === "ArrowLeft")
      next = (format + (ar ? 1 : -1) + formats.length) % formats.length;
    else return false;
    setFormat(next);
    tabRefs.current[next]?.focus();
    return true;
  }
  return (
    <>
      <section className="matchday-hero" aria-labelledby="hero-title">
        <picture className="hero-photo">
          <source
            srcSet="/images/matchday-640.webp 640w, /images/matchday-1024.webp 1024w, /images/matchday-1536.webp 1536w"
            sizes="100vw"
            type="image/webp"
          />
          <img
            src="/assets/plates/football.png"
            width="1536"
            height="1024"
            fetchPriority="high"
            alt={t(
              "Friends playing a night football match on a floodlit community pitch",
              "أصدقاء يلعبون ماتش كرة قدم على ملعب مضاء ليلاً",
            )}
          />
        </picture>
        <div className="hero-content container">
          <h1 id="hero-title">
            {t("Your mates.", "صحابك.")} <em>{t("Your pitch.", "ملعبك.")}</em>{" "}
            {t("Your glory.", "مجدك.")}
          </h1>
          <p>
            {t(
              "Turn your real matches into leagues and fantasy football with friends.",
              "حوّل ماتشاتك الحقيقية لدوري وفانتازي مع صحابك.",
            )}
          </p>
          <StoreLinks />
        </div>
      </section>
      <section
        id="how-it-works"
        className="story-section section container"
        aria-labelledby="story-title"
      >
        <h2 id="story-title">
          {t("Every match deserves", "كل ماتش")}{" "}
          <em>{t("a story.", "يستاهل يتحكي.")}</em>
        </h2>
        <p className="section-intro">
          {t(
            "The goals. The rivalries. The friend who says they carried the team. Give your game the competition it deserves.",
            "الأهداف. المنافسة. وصاحبك اللي بيقول إنه شال الفريق. ادّوا لماتشاتكم المنافسة اللي تستاهلها.",
          )}
        </p>
        <ol className="steps">
          {steps.map(([title, body], i) => (
            <li key={title}>
              <span className="step-count" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section
        id="features"
        className="feature-section section"
        aria-labelledby="fantasy-title"
      >
        <div className="container feature-layout">
          <div className="feature-copy">
            <h2 id="fantasy-title">
              {t("Not football stars.", "مش نجوم الشاشة.")}
              <br />
              <em>{t("Your football stars.", "نجوم شلّتكم.")}</em>
            </h2>
            <p>
              {t(
                "Draft the people you know. The defender who never gives up. The friend who always finds the net. Real performances give your fantasy squad its story.",
                "اختار الناس اللي عارفها. المدافع اللي مش بيسيّب كورة، وصاحبك اللي دايمًا بيوصل للشبكة. الأداء الحقيقي هو اللي بيكتب حكاية فريقك الفانتازي.",
              )}
            </p>
            <ul className="plain-features">
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Build within your budget. Pick starters and a bench.",
                    "كوّن فريقك في حدود الميزانية. اختار الأساسيين والبدلاء.",
                  )}
                </span>
              </li>
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Follow fantasy points from real match events.",
                    "تابع نقاط الفانتازي من أحداث الماتشات الحقيقية.",
                  )}
                </span>
              </li>
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Track player ratings, tiers, and achievements.",
                    "تابع تقييمات اللاعبين ومستوياتهم وإنجازاتهم.",
                  )}
                </span>
              </li>
            </ul>
            <a href="#download" className="text-link">
              {t("Build your squad in Vamora", "كوّن فريقك في Vamora")}
              <Icon name="arrow" size={20} />
            </a>
          </div>
          <figure className="squad-figure">
            <div className="squad-heading">
              <strong>{t("Your starting lineup", "تشكيلتك الأساسية")}</strong>
              <span>{t("Your friends. Your picks.", "صحابك. اختيارك.")}</span>
            </div>
            <div
              className="pitch"
              role="img"
              aria-label={t(
                "Illustrative fantasy lineup with a goalkeeper, two defenders, two midfielders and a forward. This is not an app screenshot.",
                "مثال توضيحي لتشكيلة فانتازي بها حارس ومدافعان ولاعبا وسط ومهاجم. ليست لقطة من التطبيق.",
              )}
            >
              <div className="pitch-centre" />
              <div className="pitch-goal top" />
              <div className="pitch-goal bottom" />
              {[
                [50, 16, "O", "عمر"],
                [27, 39, "A", "علي"],
                [73, 39, "Y", "يوسف"],
                [27, 65, "M", "مروان"],
                [73, 65, "K", "كريم"],
                [50, 87, "H", "حسن"],
              ].map(([x, y, initial, name]) => (
                <div
                  className="pitch-player"
                  key={initial}
                  style={{ left: x + "%", top: y + "%" }}
                >
                  <span>{initial}</span>
                  <small>
                    {ar
                      ? name
                      : {
                          O: "Omar",
                          A: "Ali",
                          Y: "Youssef",
                          M: "Marwan",
                          K: "Karim",
                          H: "Hassan",
                        }[initial as "O"]}
                  </small>
                </div>
              ))}
            </div>
            <figcaption>
              {t(
                "Illustrative lineup · example names · not an app screenshot",
                "تشكيلة توضيحية · أسماء افتراضية · ليست لقطة من التطبيق",
              )}
            </figcaption>
          </figure>
        </div>
      </section>
      <section
        className="formats-section section container"
        aria-labelledby="formats-title"
      >
        <div className="section-heading">
          <h2 id="formats-title">
            {t("Your game.", "كورتكم.")}
            <br />
            <em>{t("Your format.", "على نظامكم.")}</em>
          </h2>
          <p>
            {t(
              "One football session or a whole season. Choose the competition that fits your people.",
              "يوم كورة أو موسم كامل. اختاروا المنافسة اللي تناسب مجموعتكم.",
            )}
          </p>
        </div>
        <div
          className="format-tabs"
          role="tablist"
          aria-label={t("Competition formats", "أنظمة المنافسات")}
        >
          {formats.map((item, i) => (
            <button
              key={item.name}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={"format-tab-" + i}
              role="tab"
              aria-selected={format === i}
              aria-controls="format-panel"
              tabIndex={format === i ? 0 : -1}
              onClick={() => setFormat(i)}
              onKeyDown={(e) => {
                if (moveTab(e.key)) e.preventDefault();
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div
          id="format-panel"
          className="format-panel"
          role="tabpanel"
          aria-labelledby={"format-tab-" + format}
          tabIndex={0}
        >
          <div>
            <h3>{current.title}</h3>
            <p>{current.body}</p>
          </div>
          <dl>
            {[
              [t("Best for", "مناسب لـ"), current.best],
              [t("What you manage", "بتنظّم إيه"), current.manage],
              [
                t("What players follow", "اللاعبين بيتابعوا إيه"),
                current.follow,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section
        className="organizer-section section"
        aria-labelledby="organizer-title"
      >
        <div className="container organizer-layout">
          <figure className="friends-photo">
            <picture>
              <source
                srcSet="/images/friends-640.webp 640w, /images/friends-1024.webp 1024w, /images/friends-1536.webp 1536w"
                sizes="(max-width: 800px) 88vw, 44vw"
                type="image/webp"
              />
              <img
                src="/images/friends-1024.webp"
                width="1536"
                height="1024"
                loading="lazy"
                alt={t(
                  "Illustrative campaign photo of friends laughing together after football",
                  "صورة توضيحية لأصدقاء بيضحكوا مع بعض بعد ماتش كورة",
                )}
              />
            </picture>
          </figure>
          <div className="organizer-copy">
            <h2 id="organizer-title">
              {t("You bring the people.", "إنت جمّع الشلّة.")}
              <br />
              <em>{t("We bring the structure.", "والتنظيم علينا.")}</em>
            </h2>
            <p>
              {t(
                "For the friend who makes every game happen. Run the competition, bring teams together, and keep everyone following the same story.",
                "لصاحبك اللي دايمًا بيظبّط الماتش. نظّم المنافسة، جمّع الفرق، وخلّي الكل متابع نفس الحكاية.",
              )}
            </p>
            <ul className="plain-features">
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Manage teams, captains, and competition admins.",
                    "إدارة الفرق والكباتن ومسؤولي المنافسة.",
                  )}
                </span>
              </li>
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Organize fixtures and record live match events.",
                    "تنظيم المواجهات وتسجيل أحداث الماتش مباشرةً.",
                  )}
                </span>
              </li>
              <li>
                <Icon name="check" />
                <span>
                  {t(
                    "Keep results, standings, and player histories together.",
                    "النتائج والترتيب وتاريخ اللاعبين في مكان واحد.",
                  )}
                </span>
              </li>
            </ul>
            <a className="btn btn-primary" href="#download">
              {t("Bring your group together", "ابدأ منافستكم")}
              <Icon name="arrow" size={19} />
            </a>
          </div>
        </div>
      </section>
      <section
        id="faq"
        className="faq-section section container"
        aria-labelledby="faq-title"
      >
        <div className="section-heading">
          <h2 id="faq-title">
            {t("Before the", "قبل")}{" "}
            <em>{t("first whistle.", "صافرة البداية.")}</em>
          </h2>
          <p>
            {t(
              "A few things you might be wondering.",
              "إجابات سريعة على اللي ممكن يكون في بالك.",
            )}
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                <span>{question}</span>
                <Icon name="plus" size={21} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section
        id="download"
        className="download-section"
        aria-labelledby="download-title"
      >
        <div className="container">
          <img
            src="/images/logo.webp"
            width="92"
            height="96"
            loading="lazy"
            alt=""
          />
          <h2 id="download-title">
            {t("The next match", "الماتش الجاي")}
            <br />
            {t("is yours.", "حكايتكم.")}
          </h2>
          <p>
            {t(
              "Get Vamora. Bring your friends. Let the game do the talking.",
              "حمّل Vamora. جمّع صحابك. وسيب الكورة تتكلم.",
            )}
          </p>
          <StoreLinks />
        </div>
      </section>
    </>
  );
}
