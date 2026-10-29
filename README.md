# Vamora website

Arabic-first promotional website for Vamora: real football with friends, organized competitions, and fantasy squads built from the people in your group.

Built with React, TypeScript, and Vite. Production output is a static `dist/` directory. Existing VPS/Dokploy startup and port behavior are unchanged.

## Development and checks

- `npm ci` — install the locked dependencies.
- `npm run dev` — run the existing development server.
- `npm run build` — type-check, build, and pre-render public Arabic/English pages.
- `npm run lint` — lint the source.
- `npm test` — route, locale, metadata, privacy, and mocked account-deletion regression checks.
- `node scripts/check-site.mjs <running-site-url>` — read-only checks against an already running static server; it does not start a server, change a port, or call the account API.

Tests mock all account API requests. They never delete a production account.

## Public pages and SEO

| URL | Language |
| --- | --- |
| `/` | Arabic |
| `/en` | English |
| `/privacy-policy` | Arabic |
| `/en/privacy-policy` | English |

The build renders their visible content and route-specific metadata into HTML. Both languages include canonical URLs, reciprocal language alternates, social previews, and a localized sitemap. Organization and WebSite structured data use factual Vamora information.

`robots.txt`, `sitemap.xml`, favicon variants, an Apple touch icon, and `site.webmanifest` ship in `public/`. Unknown URLs return the branded `404.html` with noindex metadata. App handoff and account-management pages use a separate noindex `app.html` fallback, so they never inherit homepage indexing metadata. Invitation values are excluded from metadata and the sitemap.

## Existing app links

All existing paths are retained: `/home`, `/upcoming`, `/play`, `/profile`, `/settings`, `/login`, `/signup`, `/join`, `/join/:code`, `/team-invite/:token`, `/captain-invite/:token`, and `/competition/:id`.

Aliases `/c/:code`, `/competitions/:id`, `/play/join`, `/play/join/:code`, `/competition/join/:code`, and `/competitions/join/:code` remain compatible. Tokens and IDs preserve case and are encoded as a single app-URL path segment; competition join codes retain their existing uppercase normalization. Aliases preserve query strings and fragments.

Functional pages stay at their existing URLs and accept `?lang=ar` or `?lang=en`. The language switch preserves the path, token, other query parameters, and fragment. App links retain their automatic attempt and explicit open-app button, with download actions for users without the app.

`/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` are unchanged and must be served as JSON, not HTML. Real signing values must come from the app project; never invent replacements.

## Account deletion

`/delete-account` remains deliberately unlinked. It uses the existing sign-in and authenticated deletion API endpoints at `https://api.vamora.cloud`. The flow requires sign-in, explicit acknowledgement, and a separate final deletion action. Credentials and tokens are not persisted in browser storage.

Existing reviewer test credentials remain prefilled. Users can replace them with their own details. Cancellation clears the session; expiry returns to sign-in; failed requests remain recoverable.

The English privacy policy's substance and effective/update dates are preserved, with a faithful Arabic translation. Visual refreshes do not change policy dates.

## Production compatibility

Hosting is the existing VPS with Dokploy. No deployment was performed, no ports or `.env` files were changed, and **no new environment variables are required**. The existing `npm run start` command and `PORT` behavior remain unchanged.

`public/serve.json` is copied to `dist/`. Its explicit public-page rewrites preserve pre-rendered HTML; existing functional routes use `app.html`; unmatched paths use the branded 404. Directory listings are disabled. Keep this configuration with the deployed output. Do not replace it with an unconditional SPA rewrite, which would discard localized HTML and metadata.

`nixpacks.toml` explicitly runs the existing `npm run start` command so Nixpacks
uses this routing configuration instead of its automatic Vite/Caddy SPA server.
The existing `PORT` behavior is preserved. `/admin` and all its nested routes
serve a separate English shell with `noindex, nofollow` and `no-store` response
headers. The dashboard has no public navigation or sitemap links. Its separate
backend credentials are configured only on the API; no web credentials are needed.

## Assets and design

The shield comes from the supplied original logo. Campaign photos were generated with the built-in image-generation tool. Exact prompts are recorded in `assets/prompts.json` and the accompanying prompt files. `scripts/prepare-assets.mjs` prepares responsive WebP variants and original-logo icons; the output is committed. Noto Sans Arabic is self-hosted with its OFL license.

The fantasy lineup is a clearly labeled illustration with example names, not an app screenshot or customer evidence. No fabricated reviews, usage statistics, partnerships, payments, or analytics were added.

`PRODUCT.md` records product truth. `DESIGN.md` and `.impeccable/design.json` document the implemented visual system. The approved composition and direction are recorded under `.impeccable/`.
