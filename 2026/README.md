# Java Developers’ Conference 2026

An Astro static site for JUGBD. The home page, sessions, schedule, abstracts, and biographies are generated as HTML. Small browser modules enhance theme selection, dialogs, filtering, countdowns, and a personal agenda. There is no runtime content fetch or service worker.

## Local development

Use Node.js 22.12 or newer (Node.js 24 is used in CI).

```sh
cd 2026
npm ci
npm run dev
```

Open the URL printed by Astro, including its `/jdc24/2026/` base path. From inside this directory, omit `cd 2026`.

```sh
npm run validate      # Schemas, references, schedule consistency, image sources
npm run check         # Astro and TypeScript diagnostics
npm test              # Model, time, storage, and validation regression tests
npm run build         # Validate, generate HTML/images/assets, check local links
npm run preview       # Serve the generated site
npm run format        # Format editable source and content
npm run format:check
```

For browser regression tests, first build the site and install Chromium if Google Chrome is not installed in its standard macOS location:

```sh
npx playwright install chromium
npm run test:browser
```

The browser suite builds the populated 2025 content into an ignored `.test-archive/` fixture. It checks both editions without changing the active event. Tests cover JavaScript-disabled reading, filters, agendas across pages/reloads, blocked storage, dialog focus and deep links, event timezone behavior, and mobile widths.

## Organization

```text
content/
  site.json                 Shared metadata, navigation, social links, active edition
  ui.json                   Shared interface labels and messages
  events/                   Explicit edition, dates, timezone, venue, CTA
  pages/                    Page copy and about.md
  collections/
    speakers/               Markdown biographies with typed frontmatter
    sessions/               Markdown abstracts with typed frontmatter
    agenda/                 The only source of session times
    team/                   Organizer records shared across editions
    sponsors/               Edition-specific sponsors
src/
  content.config.ts         Astro collections using shared Zod schemas
  lib/                      Content access, schemas, model, time, storage, paths
  layouts/                  Shared page head, navigation, footer, theme initialization
  components/               Global, home, sessions, schedule, and UI components
  pages/                    Three file-based routes
  scripts/                  Small browser enhancements; no page reconstruction
  styles/site.css           Formatted theme tokens, layout, and component styles
media/originals/             Source photographs and logos; not publicly copied
public/icons/               Unprocessed favicons
scripts/                    Validation, output checks, and unused-image pruning
tests/                     Unit and browser regression tests
```

All editable text lives in `content/`. Components own markup and behavior. The existing `../2025/` website remains independent; the normalized 2025 records here preserve historical content and provide useful regression fixtures.

## Announcing the 2026 event

Edit `content/events/jdc-2026.json` to set the title, edition, registration link, venue, and event dates. The `headline` segments control the emphasized heading and should read as the same text as `title`.

- Keep the event `id` stable. It identifies related content and namespaces saved agendas.
- Set both `startsAt` and `endsAt`, using ISO 8601 timestamps with an explicit offset, for example `2026-12-06T10:00:00+06:00`. This is an example, not an announced event date.
- `timezone` is the IANA zone used for display and live status: `Asia/Dhaka`.
- Keep unknown values as `null` and the corresponding status as `unannounced`.
- Change `programmeStatus` to `published` when the programme is ready.
- Store a map iframe’s URL in `mapEmbedUrl`, never the iframe markup.

The current 2026 date, venue, speakers, and sessions are intentionally unannounced. Empty collections show an announcement message; no fake speaker profiles are needed.

### Add a speaker

Create `content/collections/speakers/2026-example-speaker.md`:

```markdown
---
id: 2026-example-speaker
eventId: jdc-2026
name: Example Speaker
role: Software Engineer
company: Example Company
image: images/speakers/example.jpg
linkedin: null
twitter: null
website: null
---

Write the speaker biography in **Markdown**, with [links](https://example.com).
```

Add the image to `media/originals/speakers/example.jpg`. ID values must use lowercase letters, digits, and hyphens. IDs are permanent identifiers, not generated from names or titles. Editing a display name must not change the ID.

### Add a session

Create `content/collections/sessions/2026-example-session.md`:

```markdown
---
id: 2026-example-session
eventId: jdc-2026
order: 0
status: announced
title: An Example Java Session
track: Technical
speakerIds:
  - 2026-example-speaker
tags:
  - Java
---

Write the session abstract in Markdown.
```

Multiple speaker IDs are supported. To reserve a session before its details are known, use `status: unannounced`, `title: null`, `track: null`, and an empty `speakerIds` array. Use a stable ID that survives announcement. Do not add `time`, `duration`, nested speaker objects, or HTML to session records.

### Schedule the session

Create an agenda JSON record with a unique `id` and `order`:

```json
{
  "id": "2026-slot-example",
  "eventId": "jdc-2026",
  "order": 10,
  "kind": "session",
  "sessionId": "2026-example-session",
  "title": null,
  "presenter": null,
  "start": "10:30",
  "end": "11:10"
}
```

Use explicit 24-hour wall times in the event timezone. Use `null` for both times until confirmed. Session titles and speakers are resolved by ID. Break and plenary records use `kind: break` or `kind: plenary`, a `null` session ID, and their own title. Reorder the existing opening/panel records when adding the programme.

Validation rejects missing or cross-edition references, duplicate IDs, overlapping slots, duplicate schedule order, times outside the event, and a session scheduled twice. The present schedule supports one day and one track; expand this model deliberately before adding a multi-day or parallel-track event.

### Images and other content

- Place original media in `media/originals/` and reference it as `images/<folder>/<file>` from content.
- Build cleanup removes unreferenced source-image copies emitted by the bundler, then checks every generated page for broken local references.
- Astro creates hashed WebP variants and `srcset` attributes. Gallery images have 480/1200px variants; portraits have 160/480px variants, without upscaling.
- Supply meaningful gallery alt text in `content/pages/home.json`. Portraits next to visible names use empty alt text to avoid repetition.
- Edit organizer and sponsor JSON files under their respective collections.
- Markdown is rendered at build time. Raw HTML in frontmatter or Markdown bodies is rejected by the validator.

## Edition archives

Each record that belongs to an edition declares its `eventId`. Keep existing records and their IDs when adding another event. Point `content/site.json` at the active event.

For a local archive preview:

```sh
JDC_EVENT_ID=jdc-2025 npm run dev
```

The migration uses the old schedule as the authority for historical times, correcting disagreements with duplicated session-time strings. Shared organizer records represent the supplied team list, not a separately maintained historical team snapshot.

Saved agendas use `<eventId>:agenda:v1` and stable session IDs. The old `jdc25-agenda` format is not imported because it mixed years and title-derived or placeholder IDs. Invalid saved values are ignored. If storage is blocked or full, selections work in memory and an accessible status message explains that they last for the visit.

## Deployment

`npm run build` produces `dist/`. Deploy its contents to the intended `2026/` directory of a static host. No Node.js process is needed on the host.

The default URL configuration is the repository’s conventional GitHub Pages location, `https://jugbd.github.io/jdc24/2026/`; this does not enable GitHub Pages or claim the URL is live. Override these values for the actual host:

```sh
SITE_URL=https://conference.example.org BASE_PATH=/2026/ npm run build
```

Deploy every generated file, including `_astro/` and `icons/`. Do not copy the source files or `media/originals/` into the public output. `dist/_headers` contains suitable cache rules for static hosts that support this format: HTML revalidates immediately and hashed `_astro/` assets are immutable for a year. Configure equivalent headers on other hosts. GitHub Pages manages its own response headers.

CI verifies the site and uploads the 2026 static output as an artifact. It does not change the host configuration or deploy over the 2025 site.

The schedule supports `?now=14:10` for local-time live-marker previews. Invalid values are ignored. Actual live status and countdowns use the event timestamps and timezone, independently of a visitor’s computer timezone.
