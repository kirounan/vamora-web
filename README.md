# Vamora — Web

Public-facing web pages for the [Vamora](https://vamora.cloud) Real Football Fantasy League mobile app.

This site exists primarily to satisfy Apple App Store and Google Play Store
requirements:

- A publicly hosted **Privacy Policy** that can be linked from each store listing.
- A publicly accessible **Account Deletion** flow (Google Play data-safety requirement) that lets users delete their Vamora account from the web.

It is built with [Vite](https://vite.dev) + React + TypeScript and is deployed
as a fully static site.

---

## Pages

| Path               | Purpose                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| `/`                | Landing page with a link to the privacy policy.                          |
| `/home`            | Mobile home deep-link fallback.                                          |
| `/upcoming`        | Mobile upcoming games deep-link fallback.                                |
| `/play`            | Mobile play/create deep-link fallback.                                   |
| `/profile`         | Mobile profile deep-link fallback.                                       |
| `/settings`        | Mobile settings deep-link fallback.                                      |
| `/join`            | Manual competition invite fallback.                                      |
| `/join/:code`      | Primary competition invite fallback with an app-open CTA.                |
| `/c/:code`         | Short competition invite alias, redirected to `/join/:code`.             |
| `/competition/:id` | Competition details fallback with an app-open CTA.                       |
| `/competitions/:id` | Competition details alias, redirected to `/competition/:id`.            |
| `/play/join`       | Join alias, redirected to `/join`.                                       |
| `/play/join/:code` | Join alias, redirected to `/join/:code`.                                 |
| `/login`           | Mobile login deep-link fallback.                                         |
| `/signup`          | Mobile signup deep-link fallback.                                        |
| `/privacy-policy`  | Full GDPR / CCPA-compliant Privacy Policy for the Vamora app.            |
| `/delete-account`  | Authenticated account-deletion flow (sign in, then confirm). Unlinked.   |

The legacy invite aliases `/competition/join/:code` and
`/competitions/join/:code` also redirect to `/join/:code`.

> The `/delete-account` page is intentionally **not linked from anywhere in the
> UI**. It is reachable only by typing the URL directly. It is referenced by
> the App Store / Play Store listings for compliance reviews.

The delete-account form ships with **pre-filled test credentials** so app
store reviewers can sign in with one click. The credentials are defined as
constants at the top of `src/pages/DeleteAccount.tsx` and can be rotated at
any time.

---

## Tech stack

- [Vite](https://vite.dev) for the dev server and build pipeline
- [React 19](https://react.dev) + TypeScript
- [react-router-dom](https://reactrouter.com) for client-side routing
- A single hand-written CSS theme in `src/styles/global.css` (no UI framework)

---

## API integration

The deletion flow talks to the Vamora API:

- `POST {API_BASE_URL}/api/v1/auth/signin` — to obtain a JWT.
- `DELETE {API_BASE_URL}/api/v1/users/me` — to delete the authenticated account.

The base URL is configured in [`src/config.ts`](src/config.ts):

```ts
export const API_BASE_URL = 'https://api.vamora.cloud';
```

Change it there if you need to point the site at a staging environment.

---

## Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check + production build (output: dist/)
npm run build

# preview the production build locally
npm run preview

# lint
npm run lint
```

Node 18+ is recommended (this repo was built with Node 22).

---

## Deployment

The project is a fully static site. After running `npm run build`, the
contents of `dist/` can be uploaded to any static host:

- **GitHub Pages** — easy + free. Either push `dist/` to a `gh-pages` branch, or use the GitHub Pages action.
- **Cloudflare Pages / Vercel / Netlify** — connect this repository, set the
  build command to `npm run build` and the output directory to `dist`. They
  auto-handle SPA fallback for client-side routing.
- **Dokploy / Coolify / Nixpacks (VPS)** — this repo ships with a
  [`nixpacks.toml`](./nixpacks.toml) that pins Node 22 and runs:
  - `install`: `npm ci`
  - `build`:   `npm run build`
  - `start`:   `npm run start` (serves `dist/` via [`serve`](https://www.npmjs.com/package/serve) with SPA fallback on the port from `$PORT`).
- **Any static file server** — make sure unknown paths (e.g.
  `/privacy-policy`, `/delete-account`) fall back to `index.html` so React
  Router can handle them.

> **Node version**: Vite 8 requires Node 20.19+ / 22.12+. The repo enforces
> Node 22 via `engines.node` in `package.json`, an `.nvmrc` file, and the
> `nixpacks.toml` config.

Once hosted, add the public URLs of `/privacy-policy` and `/delete-account` to
your Google Play Console and App Store Connect listings.

The app-link association files are served from:

- `/.well-known/assetlinks.json`
- `/.well-known/apple-app-site-association`

Replace the placeholder Android package name, Android SHA-256 signing
fingerprint, iOS Team ID, and iOS bundle ID in those files before relying on
Universal Links or Android App Links verification.

---

## Project structure

```
vamora-web/
├── public/                # Static assets served as-is (favicon, etc.)
├── src/
│   ├── components/        # Shared layout components
│   ├── lib/               # API client (signin, delete account)
│   ├── pages/             # Route-level components
│   ├── styles/            # Global CSS theme
│   ├── App.tsx            # Router definition
│   ├── config.ts          # App constants (API URL, support email, dates…)
│   └── main.tsx           # React entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

MIT — see [LICENSE](./LICENSE).
