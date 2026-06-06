import { describe, expect, it } from "vitest";
import { createSitemap } from "../../src/lib/seo.ts";

describe("createSitemap", () => {
  it("creates reciprocal localized entries without the root alias", () => {
    const sitemap = createSitemap("https://example.com", [
      { locale: "en", path: "/en/" },
      { locale: "de", path: "/de/" }
    ]);

    expect(sitemap).toContain("<loc>https://example.com/en/</loc>");
    expect(sitemap).toContain("<loc>https://example.com/de/</loc>");
    expect(sitemap).toContain('hreflang="x-default"');
    expect(sitemap).not.toContain("<loc>https://example.com/</loc>");
  });
});
