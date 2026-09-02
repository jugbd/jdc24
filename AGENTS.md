# Repository Guidelines & Architecture

---

## Architectural Principles

The website is modernized as a **Static Site Generation (SSG)** architecture powered by **Astro**, focusing on performance, accessibility, SEO, and maintainability.

### 1. Decoupled Content Layer
- **Content vs. Code Separation**: All editable copy, event details, speaker profiles, session abstracts, schedules, and site configuration reside exclusively in the `content/` directory.
- **No Hardcoded Copy**: UI components (`src/components/`, `src/layouts/`, `src/pages/`) must never hardcode conference details or text copy. They strictly consume data from `content/`.
- **Markdown over Inlined HTML**: All long-form text (speaker biographies, session abstracts) is written in standard Markdown, eliminating escaped HTML strings in data files.
- **Compile-Time Validation**: Content collections are bound to strict schemas (using Zod in Astro). Missing fields, broken relationships, or invalid data types will fail the build immediately.

### 2. Static Site Generation & Zero-JS Default
- The entire site is pre-rendered into static HTML at build time.
- By default, pages ship **zero client-side JavaScript**.
- Client-side interactivity (such as the event countdown timer or modal dialogs) is restricted to minimal, isolated Astro islands (`client:idle` or native HTML `<dialog>` elements).
- Eliminates client-side data fetching (`fetch('/assets/data/payload.json')`) and runtime DOM construction.

### 3. Asset Management & Cache Invalidation
- **No Custom Service Workers**: Do not use custom service workers or manifest generation scripts to manage caching.
- **Content Hashing**: Astro automatically hashes bundled assets (`_astro/[name].[hash].[ext]`). Asset changes naturally invalidate caches across deploys.
- **No Manual Cache-Busting**: Do not introduce query-string cache-busters (e.g. `?v=Date.now()`).
- Static HTML is served with immediate revalidation (`max-age=0, must-revalidate`), while hashed assets in `_astro/*` are served with long-term immutable caching.

---

## Project Structure Conventions

```text
├── content/                     # All editable content files (CMS)
│   ├── site.yml                 # Global site metadata (brand, edition, nav, footer, social links, venue)
│   ├── pages/                   # Block-based page configurations
│   │   ├── home.yml             # Homepage section order, hero content, why-jdc items
│   │   ├── sessions.yml         # Sessions catalog headers, track definitions
│   │   └── schedule.yml         # Schedule page metadata
│   └── collections/             # Repeatable, schema-validated entities
│       ├── speakers/            # Individual speaker files (Markdown with frontmatter)
│       ├── sessions/            # Individual session files (Markdown with frontmatter)
│       ├── team/                # Organizing team member records (YAML/JSON)
│       ├── sponsors/            # Sponsor records grouped by tiers
│       └── agenda/              # Chronological event timeline items
├── src/                         # Presentation layer (Astro & UI components)
│   ├── components/              # Reusable UI blocks mapped to content types
│   │   ├── global/              # Navigation, Footer, Theme/Background elements
│   │   ├── home/                # Homepage section components (Hero, About, SpeakersGrid, etc.)
│   │   ├── sessions/            # Sessions catalog components & filter controls
│   │   ├── schedule/            # Timetable and schedule components
│   │   └── ui/                  # Reusable primitives (Buttons, Cards, Dialogs)
│   ├── layouts/                 # Base layout wrappers (BaseLayout.astro with SEO, OpenGraph)
│   ├── pages/                   # File-based routes (index.astro, sessions.astro, schedule/index.astro)
│   └── styles/                  # Global design tokens, animations, and CSS variables
├── public/                      # Static unbundled media (favicons, static images, icons)
├── package.json
└── astro.config.mjs
```

---

## Instructions for Agents & Contributors

1. **Adding or Editing Content**:
   - Always modify files in `content/`.
   - Never embed raw HTML tags (`<p>`, `<br>`, `<strong>`) into data files; use standard Markdown.
   - Reference entities by their identifier (e.g., session files link to speakers via `speaker: speaker-id`).
2. **Developing UI Components**:
   - Keep Astro components modular and single-purpose.
   - Separate layout from data fetching; pass data through Astro component props.
   - Preserve existing design aesthetics (dark theme, glow orbs, responsive layouts).
3. **Build & Quality Verification**:
   - Always run `npm run build` to verify schema validation and static generation before claiming work is complete.
   - Check that no broken links or missing assets are generated.
