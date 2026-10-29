# Private administration

Mode: Operate. English only. Internal tournament operators managing Gameday and Hybrid competitions, often during live play.

## Direction contract

THESIS: Put the running match and the next decision first, with roster intervention one action away.

OWN-WORLD: Inherit Vamora charcoal, lime, off-white, flat bordered surfaces, bundled typography, and consistent line icons. Reserve lime for actions and current selection.

STORY: Find the competition, assess live play, add a late player, and resolve incidents with an inspectable history.

FIRST VIEWPORT: Compact navigation rail; competition heading and Add player action; live match selection alongside score, time, event history, and explicit controls. Secondary work lives in named tabs.

FORM: User-selected live-match workspace. No concept lottery: the approved implementation plan pins composition, language, identity, and interactions.

FINISH: Independent finish review returned ship after two resolved fixes. This is an ordinary operational extension of the incumbent identity; `DESIGN.md` and `.impeccable/design.json` were compared with the implementation and remain unchanged. No new raster assets ship. Documentation evidence and limitations are recorded in `review/admin-documentation.md`.

Constraints: `/admin` is English/LTR only, unlisted and `noindex, nofollow`, with no homepage, public navigation, or sitemap references. Backend `.env` username/password authentication. Full Gameday and Hybrid operations with transactional recovery; other formats read-only. Reusable name-only guests, ongoing enrollment, and team assignment take priority. Separate admin backend in `D:/2MK/Fantastico-API`; no mobile repository or existing mobile API contract changes. Pause/resume deferred. No new raster assets.

## Implemented surface notes

The running-match workspace preserves the approved composition: a compact navigation rail, heading-level Add player action, match selector, score and elapsed time, inspectable event history, and named secondary tabs. Enrollment can create a reusable virtual player from a name, reuse an existing virtual player, or select a registered player and assign a team in the same operation.

The exact incumbent canvas, panel, text, muted, boundary, lime, and action-ink colors and bundled Vamora font remain. Operational density is local to this surface: body (14px), heading (`clamp(24px, 2.4vw, 34px)`), (6px) control corners, and compact action spacing. At (900px), the navigation moves into normal flow; at (650px), match selection becomes horizontally scrollable and form/team grids stack. These measurements describe the admin implementation rather than changing public-site tokens.

The analytics extension adds a current-versus-period overview, a scrollable desktop navigation rail, URL-backed report filters and subtabs, bordered SVG charts with exact-value tables, recorded-evidence details, and CSV/PNG downloads. Graphs preserve the incumbent palette, distinguish series using labels and line patterns, and include reporting context in exports. The existing live match remains the default competition subtab. Analytical dates use Africa/Cairo; absence of historical evidence is visible rather than inferred.
