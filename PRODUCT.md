# Vamora website

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Players in groups of friends and local football communities are primary. Competition hosts, captains, and administrators are secondary.

## Product Purpose

Turn real amateur football into organized competitions with a fantasy game built around the people in the group. The public website explains the product and leads visitors to the published iOS and Android apps. A private administration workspace supports tournament operators.

## Positioning

Fantasy squads use real friends. Real match events drive points, player ratings, leaderboards, achievements, and progression. Competition formats include Gameday, League, Tournament/Cup, and Hybrid groups plus knockout.

## Capabilities and Constraints

- Public website: Arabic at `/` is primary; English at `/en` has equal content and quality.
- React, TypeScript, Vite, and static hosting remain.
- Existing invite routes, case-sensitive tokens, app URL behavior, and association files must remain compatible.
- Account deletion remains unlinked and requires sign-in and explicit confirmation.
- Preserve privacy policy substance and dates; translate faithfully.
- No payments, advertising, or analytics. Public website work adds no backend features; the separately authorized private admin backend is the exception described below.
- No fabricated customers, statistics, reviews, partnerships, or store claims.
- Private admin at `/admin` is English only, unlisted, and `noindex, nofollow`, with no homepage, public navigation, or sitemap references. Username and password are configured through the backend `.env`.
- Admin supports full Gameday and Hybrid operations, including transactional recovery; other competition formats remain read-only. Name-only reusable virtual players (guests), ongoing enrollment, and team assignment take priority. Pause/resume is deferred.
- Admin uses separate backend endpoints in `D:/2MK/Fantastico-API`. The mobile app/repository and existing mobile API contracts must remain unchanged. Setup is documented in that repository's `docs/private-web-admin.md`.

## Brand Commitments

Vamora. User-supplied lime shield logos from `C:/Users/kirol/Downloads/logo_png.png` and `logo_background.png`; charcoal, lime, and off-white. Strong typography, generous spacing, restrained motion. Image-first design with generated amateur-football imagery. Built by 2MK.

## Evidence on Hand

Mobile product record at `D:/2MK/fanasicomob/PRODUCT.md`, mobile source and translations, existing website content, live store listings. Google Play package `com.vamora.fanasicomob`; Apple app ID `6774752743`. Support: m2ktechies@gmail.com.

## Accessibility & Inclusion

Complete Arabic and English public content, RTL/LTR layouts, keyboard access, reduced motion, responsive imagery, and accessible contrast. Preserve exact invite tokens when switching languages. The English-only admin workspace uses LTR, responsive layouts, keyboard access, and visible task states.

## Release

The original public-site release authorized implementation and a normal push to the existing `origin/main` branch, limited to this website repository. The subsequent private-admin scope authorizes changes in this website repository and the separate admin backend at `D:/2MK/Fantastico-API`. Preserve the existing public Arabic/English website behavior and all mobile boundaries above.
