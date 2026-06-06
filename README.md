# ChatGPT Bulk Delete Website

Single-screen multilingual landing page for the
[ChatGPT Bulk Delete Chrome extension](https://chromewebstore.google.com/detail/chatgpt-bulk-delete/gibkdljbjknbolnjmhnahcpjecgjifde).

The site uses Eleventy, Nunjucks, TypeScript, Tailwind CSS, and JSON locale
files. It produces plain HTML with no client-side JavaScript and follows the
operating system's light or dark color preference.

## Requirements

- Node.js 24 (pinned in `.node-version`)
- npm

## Local development

```bash
npm install
npm run dev
```

Eleventy serves the site at `http://localhost:8080` by default.

Available commands:

```bash
npm run build             # Build with localhost SEO URLs by default
npm run build:production  # Require an HTTPS SITE_URL, then build
npm run typecheck         # Check TypeScript
npm test                  # Run unit tests
npm run test:build        # Build with a test origin and inspect output
npm run validate:html     # Validate generated HTML
npm run check             # Run the complete quality gate
```

## Output

The build writes:

```text
dist/
  index.html       # English alias, canonical URL is /en/
  en/index.html
  de/index.html
  assets/
  robots.txt
  sitemap.xml
```

Canonical URLs, `hreflang`, Open Graph metadata, Twitter cards, JSON-LD,
`robots.txt`, and the sitemap all derive from `SITE_URL`.

Local builds fall back to `http://localhost:8080`. Cloudflare Pages builds fail
when `SITE_URL` is missing.

## Add or edit a locale

Locale content lives in `src/content/<locale>.json` and is validated by Zod
during every build.

To add a locale:

1. Copy an existing locale file.
2. Change `locale`, `languageName`, and `path`.
3. Translate every content field without changing the object structure.
4. Run `npm run check`.

The locale file automatically creates its page, language-switcher entry,
canonical URL, alternate links, and sitemap entry. Locale codes and paths must
be unique.

Global product data and the Chrome Web Store URL live in
`src/content/site.json`.

The same file contains the author profile, PayPal donation URL, and social
links. The donation control stays non-interactive until `donateUrl` contains a
real URL. Social icons render only for configured links.

## Assets

`src/assets/logo.svg` is the extension mark. The approved dark-theme concept is
cropped into `src/assets/hero-art-source.png`, preserving the production
illustration from the concept. `scripts/build-assets.ts` generates:

- `dist/assets/icon.png`
- `dist/assets/logo.svg`
- `dist/assets/hero-art.webp`
- `dist/assets/og-image.png` (1200×630)

Generated assets and build output are not committed

## Cloudflare Pages

Create a Pages project connected to this repository with:

| Setting                | Value           |
| ---------------------- | --------------- |
| Production branch      | `main`          |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Node version           | `24.14.1`       |

Add this production environment variable:

```text
SITE_URL=https://your-project.pages.dev
```

Use the final custom domain instead when one is connected. `SITE_URL` must be
an HTTPS origin without a path or trailing configuration.

Cloudflare Pages provides `CF_PAGES` during its build. The Eleventy config uses
that flag to reject deployments without `SITE_URL`.

## Project structure

```text
eleventy.config.ts       Eleventy data, filters, transforms, and directories
scripts/                 Asset generation and production environment checks
src/content/             Site and locale JSON
src/lib/                 Validation, URL, and SEO helpers
src/_includes/           Shared Nunjucks layouts and sections
src/styles/              Tailwind entry stylesheet
tests/unit/              Content, URL, and SEO tests
tests/build/             Generated-site assertions
```
