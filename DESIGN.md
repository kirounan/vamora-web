---
name: Vamora
description: Contemporary matchday editorial for real football with friends.
colors:
  charcoal: "#101313"
  panel: "#1b201e"
  section-green: "#18201b"
  lime: "#c5f62f"
  lime-hover: "#d4ff53"
  off-white: "#f4f3ec"
  muted: "#b7bdb7"
  line: "#3e4540"
  ink: "#11170b"
  danger: "#ff9b8f"
  danger-action: "#b7352c"
  danger-action-hover: "#942c25"
  white: "#fff"
  field: "#101713"
  field-border: "#667367"
  info-surface: "#243124"
  info-text: "#d0dfc8"
  error-surface: "#44201b"
  error-text: "#ffd1cb"
  warning-surface: "#3c3219"
  warning-text: "#ffe5aa"
typography:
  display:
    fontFamily: "Vamora, sans-serif"
    fontSize: "clamp(48px, 5.72vw, 88px)"
    fontWeight: 800
    lineHeight: 1.6
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Vamora, sans-serif"
    fontSize: "clamp(32px, 3.45vw, 52px)"
    fontWeight: 800
    lineHeight: 1.6
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Vamora, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.7
  body:
    fontFamily: "Vamora, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Vamora, sans-serif"
    fontSize: "15px"
    fontWeight: 700
rounded:
  menu: "6px"
  control: "8px"
  panel: "12px"
  squad: "16px"
  header-action: "40px"
spacing:
  tight: "8px"
  control-gap: "12px"
  text-gap: "16px"
  small: "20px"
  regular: "24px"
  medium: "28px"
  panel: "36px"
  large: "44px"
  section-mobile: "64px"
  section: "88px"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.lime-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.off-white}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.panel}"
  button-danger:
    backgroundColor: "{colors.danger-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
  button-danger-hover:
    backgroundColor: "{colors.danger-action-hover}"
  store-link:
    backgroundColor: "rgba(7,11,9,.91)"
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
    height: "68px"
  format-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "15px 18px"
  format-tab-selected:
    backgroundColor: "{colors.lime}"
    textColor: "#17200b"
  format-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "44px"
  form-input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  alert-info:
    backgroundColor: "{colors.info-surface}"
    textColor: "{colors.info-text}"
    rounded: "{rounded.control}"
    padding: "18px 20px"
  alert-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.control}"
    padding: "18px 20px"
  alert-warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.control}"
    padding: "18px 20px"
---

# Design System: Vamora

## Overview

**Creative North Star: "The Contemporary Matchday Programme"**

Vamora treats amateur football with the confidence of a matchday publication. A charcoal canvas, electric lime, substantial Arabic typography, and real-feeling football photography give friends and their own performances the attention usually reserved for professional players. The supplied shield remains the identity anchor; the wordmark is live text.

The system is spacious and editorial. Large type and broad photographs establish hierarchy, while utility screens become quiet, readable tasks in the same visual language. Arabic is the primary reading experience; English receives equally deliberate composition. Motion is restrained and communicates a state change rather than performing for its own sake.

**Key Characteristics:**
- Image-first football identity with the supplied shield.
- Charcoal, lime, and off-white with subdued green surface changes.
- Strong bilingual typography and generous vertical rhythm.
- Native RTL/LTR reading order with explicit directional exceptions.
- Flat surfaces and clear, keyboard-accessible interaction states.

Extracted from `src/styles/global.css`, shared components, and the implemented home, policy, deletion, and app-handoff pages. The approved composition and browser captures are visual evidence. Independent finish review returned ship; automated image gates remain uncertified because local Kaspersky script injection, frozen-byte capture failures, and metadata-only spec-fingerprint invalidation prevented reliable certification. These limitations are not visual design rules.

## Colors

The palette combines near-black green charcoal with vivid lime and warm off-white; restrained green neutrals separate sections without introducing a second brand accent. Frontmatter values are normative.

### Primary
- **Matchday Lime** (`lime`): primary actions, selected format tabs, focused controls, emphasized headline fragments, check marks, and the closing download surface.
- **Lime Hover** (`lime-hover`): primary-button hover feedback.

### Neutral
- **Pitch Charcoal** (`charcoal`): root canvas, header, and primary reading surfaces.
- **Quiet Panel** (`panel`): format descriptions, account containers, table headers, and contents panels.
- **Section Green** (`section-green`): broad feature and organizer sections.
- **Warm Off-White** (`off-white`): headings, navigation, and important content.
- **Muted Grey-Green** (`muted`): supporting prose, metadata, and unselected options.
- **Boundary Green-Grey** (`line`): separators and secondary-control outlines.
- **Dark Action Ink** (`ink`): text on lime primary buttons; dark text on larger lime surfaces uses closely related local green inks.
- **White** (`white`): store labels and destructive-action text.
- **Field Green** and **Field Border** (`field`, `field-border`): filled form controls with a visible boundary.

Status colors are semantic exceptions, not extra brand accents: information uses the info pair, errors the error pair, and deletion warnings the warning pair. Destructive actions use `danger-action` and its hover variant. The existing `danger` custom property is a reserved source token; the rendered error treatment uses `error-text`.

**The Purposeful Lime Rule.** Use lime to identify action, selection, emphasis, or a deliberate chapter surface; preserve a clear hierarchy inside each context.

## Typography

**Display Font:** Vamora, sans-serif.
**Body Font:** Vamora, sans-serif.

Vamora is the CSS family alias for the bundled Noto Arabic regular and extra-bold TrueType files. Regular maps to weight (400); the extra-bold file serves the declared range (700–900). Preserve these actual files and alias rather than substituting a Latin display font. The live wordmark uses the same family at weight (700), with generous tracking (.09em) and explicit English/LTR semantics.

**Character:** Rounded, substantial Arabic forms create sporting confidence without sacrificing approachable prose. English uses the same family with its own headline sizing and tighter tracking, rather than mechanically copying Arabic metrics.

### Hierarchy
- **Display:** use the frontmatter display role for the Arabic hero; English is `clamp(44px, 5vw, 76px)` with line height (1.4) and tracking (-.04em). The story heading grows to `clamp(36px, 5.1vw, 78px)` with line height (1.65); the closing heading reaches `clamp(42px, 5.7vw, 86px)`.
- **Headline:** frontmatter headline role for feature, organizer, format-section, and FAQ titles. Utility and legal page headings are quieter: `clamp(32px, 3.2vw, 48px)`.
- **Title:** frontmatter title role for instructional steps and account-panel headings; legal subheadings use (26px) and (19px).
- **Body:** frontmatter body role for reading content. Marketing leads range from (17–19px); hero support scales from (17–28px). Long feature and handoff paragraphs are constrained to (65ch); expanded FAQ text reaches (75ch).
- **Label:** frontmatter label role for buttons. Navigation uses (15px) regular, smaller metadata (11–14px), and store names (23px) bold on desktop.

**The Arabic Rhythm Rule.** Preserve the generous line heights that keep Arabic clear; translate the composition as well as the words when switching language.

## Layout

Wide content uses `min(87%, 1328px)` and centered inline margins. Legal, deletion, and handoff pages use `min(88%, 820px)`. At (800px) and below, wide containers become (88%). Desktop section padding is (88px) vertically, falling to (64px) on mobile. The spacing tokens capture recurring measurements rather than a fabricated mathematical scale.

Desktop layouts combine open three-column instruction lists and two-column feature, format, and organizer compositions. At (800px) and below, these stack into a single reading flow; instructional numbers move into an inline-start rail, tabs become a two-by-two grid, and the footer stacks. Format panels reduce padding from (44px) through (30px) to (28px), with (24px) on the smallest screens. The squad diagram keeps its deliberate LTR spatial coordinate system.

The header is in normal document flow. Its height steps from (102px) to (88px) at (1100px), then (78px) at (800px). On mobile, desktop navigation and the header download pill give way to an explicit menu button; the language switch remains visible. Additional adjustments at (1000px) tighten content columns, and at (380px) compact the brand, badges, diagrams, and panels. A wide-screen adjustment at (1700px) increases hero top spacing.

The image-led home hero is a surface pattern, not a required layout for every page. Desktop height is (46.68vw), constrained between (600px) and (780px), with a (570px) minimum at the intermediate breakpoint. Mobile uses (740px), then (700px) on the smallest screens. Photography fills the frame with `object-fit: cover`, repositions toward the lower action, and receives a stronger top scrim on mobile. Mobile headline wrapping is intentional; English has independent responsive display metrics.

Native document language and direction drive reading flow. Use logical spacing, alignment, and positioning. The header shell, live English wordmark, store-link group, squad diagram, and exact codes retain intentional LTR handling; arrows mirror where they communicate reading direction. Legal contents change from two columns to one, with wrapping table content and inline-start alignment. Preserve exact route tokens during language switching.

## Elevation & Depth

The interface has no box-shadow vocabulary. Depth comes from tonal section changes, visible outlines, large photographic crops, and restrained hero scrims. Panels remain flat; the store-link hover moves upward (2px) without adding a shadow. Header and skip-link stacking support usability rather than a floating-surface aesthetic.

**The Flat Surface Rule.** Use tonal separation and borders for structure; preserve the incumbent system's shadow-free surfaces.

## Shapes

Controls have softly squared corners: the control radius covers buttons, fields, tabs, and alerts. The menu button is slightly tighter, panels and store links more generous, and the squad frame slightly rounder again. Only the header download action uses the elongated pill radius. Player markers, pitch center, success icon, and spinner are circular because of their meaning. Keep full-bleed photography rectangular; the organizer photo uses the panel radius. Thin separators and pitch markings provide geometry without ornamental frames.

## Components

### Buttons

Confident, compact actions with clear state feedback. Standard buttons use a minimum height (50px), an outlined boundary (1px), the control radius, and frontmatter padding. Lime primary, transparent ghost, and red destructive variants use the declared color assignments. The header action is a pill with (28px) inline padding. Primary hover lightens, ghost hover fills with the panel tone, and destructive hover darkens. Disabled controls reduce opacity (.5) and use a disallowed cursor. Busy states pair readable action text with an (18px) spinner; account containers expose `aria-busy`. No custom pressed transform is implemented.

Global keyboard focus is a lime outline (3px) with offset (5px). On the lime download surface, the outline switches to dark green (`#17200b`) so focus remains visible. Preserve visible focus for links, buttons, tabs, and summaries. The skip link appears above the page when focused.

### Store Links

Recognizable two-line store actions use inline SVG marks, a dark translucent fill, lime outline, panel-radius corners, and a centered wrapping flex group. Desktop badges are at least (216px) wide and (68px) high; mobile badges become (165px) by (61px), with a (144px) minimum on the smallest screens. Hover changes the fill and translates upward (2px) over (.2s). Store names and group ordering remain LTR inside either locale. Keep real destinations and accessible localized labels.

### Navigation

The shared header combines a linked shield/wordmark, conventional section anchors, persistent language switch, and download action. Text links underline on hover. The language link has a minimum target (44px square). Mobile uses a bordered (44px) menu control with expanded state, controlled navigation identity, open/close icon, and a normal-flow link list; selecting a link or pressing Escape in the open navigation closes it. Escape returns focus to the menu toggle. It is a navigation disclosure, not a modal overlay. The footer repeats quiet identity, support, and privacy links.

### Format Selector and Panel

The signature interaction is an accessible tablist with four editorial choices. Selected tabs use lime fill and dark ink; unselected tabs use muted text, with a panel fill and off-white text on hover. Tabs are at least (56px) high. The associated panel is flat, padded, and split into explanatory copy plus a definition list on desktop; mobile stacks it with a separator. Roving tab stops, `aria-selected`, explicit tab/panel relationships, Home/End, and direction-aware left/right arrows are implemented. The panel itself can receive keyboard focus. Do not present this selection control as generic chips.

### Inputs / Fields

Readable filled controls use the field pair, minimum height (52px), control-radius corners, and (16px) text. Focus uses a lime outline (2px) offset (2px); disabled fields fade to opacity (.6). Labels stay visible above inputs. Email and password values remain LTR; the show/hide password control is positioned at inline-end with corresponding padding. Errors are communicated through alert text, not a fabricated red field-border state. The acknowledgement checkbox uses native semantics, a lime accent, and a (20px) control.

### Cards / Containers

Use flat panels for related information or focused tasks: format content, account forms, legal contents, and the lineup illustration. Account panels use padding (36px), reduced to (24px) on mobile. Legal contents use (28px 32px), reduced to (24px). The squad frame uses (24px), reduced to (17px) on the smallest screens. Preserve the meaningful pitch geometry and label the lineup as an illustration rather than an app screenshot.

### FAQ Disclosure

Native `details` and `summary` form the FAQ. Rows are separated by the line color, with large padded summaries and a lime plus icon. Opening rotates the icon (45deg) over (.2s); the answer remains in the same flat flow. Keep keyboard activation, visible focus, and native expanded semantics.

### Status and Task States

Information, warning, and error messages use the frontmatter semantic pairs, control-radius corners, and readable line height (1.9). Account deletion progresses from sign-in to explicit acknowledgement and confirmation, then a success status with a green circular check. Destructive submission stays disabled until acknowledgement; errors use `role="alert"`, and completion uses `role="status"`. Do not embed reviewer credentials in reusable design examples.

Handoff screens use a centered shield, quiet utility heading, optional exact invite code, primary app-open link, secondary home link, and separated installation help. Codes are LTR, lime, and allowed to wrap. Failed automatic opening leaves an explicit action available. Legal screens use article hierarchy, contents navigation, readable lists, underlined accent links, and bordered tables rather than campaign composition.

All implemented transitions are short (.2s); the loading spinner rotates over (.75s). Reduced-motion preference removes animation and transitions and turns smooth scrolling off. Do not add essential information that is conveyed only by movement.

## Do's and Don'ts

### Do:
- **Do** keep the supplied shield, charcoal/lime/off-white identity, and live wordmark together.
- **Do** give Arabic and English deliberate typography, native direction, and equal visual quality.
- **Do** use broad football imagery and substantial headings where a campaign surface calls for them.
- **Do** use the existing spacing, flat panels, and quiet green surfaces to organize content.
- **Do** preserve visible keyboard focus, accessible control semantics, readable state messages, and reduced motion.
- **Do** make legal and account tasks calm, narrow, and readable within the same system.

### Don't:
- **Don't** redraw the shield, bake interface copy into photography, or replace live controls with generated badge imagery.
- **Don't** introduce decorative shadows or competing brand accents into the established flat palette.
- **Don't** force Arabic headline metrics or RTL direction onto English text, store marks, or exact codes.
- **Don't** replace real friends and amateur-football imagery with invented customer endorsements, statistics, or app screenshots.
- **Don't** make hover or animation the only way to discover an action or understand a state.
- **Don't** canonize a capture failure or automated image-gate limitation as a visual-system rule.
