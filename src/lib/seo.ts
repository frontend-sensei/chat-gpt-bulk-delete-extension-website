import { absoluteUrl, createAlternateLinks } from "./urls.ts";
import type { LocaleRoute } from "./urls.ts";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function createSitemap(
  siteUrl: string,
  locales: LocaleRoute[],
  defaultLocale = locales[0]?.locale
): string {
  const alternates = createAlternateLinks(siteUrl, locales, defaultLocale);
  const entries = locales
    .map((locale) => {
      const links = alternates
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(
              alternate.lang
            )}" href="${escapeXml(alternate.url)}" />`
        )
        .join("\n");

      return `  <url>
    <loc>${escapeXml(absoluteUrl(siteUrl, locale.path))}</loc>
${links}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

export function createRobots(siteUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(siteUrl, "/sitemap.xml")}
`;
}
