import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { loadLocales, type LocaleContent } from "../../src/lib/content.ts";

const dist = join(process.cwd(), "dist");
const locales = loadLocales(join(process.cwd(), "src/content"));
const expectedLocaleCodes = [
  "ar",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fi",
  "fr",
  "he",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "no",
  "pl",
  "pt-br",
  "ro",
  "ru",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-cn",
  "zh-tw",
] as const;
const storeUrl =
  "https://chromewebstore.google.com/detail/chatgpt-bulk-delete/gibkdljbjknbolnjmhnahcpjecgjifde";
const localePages: ReadonlyArray<readonly [string, LocaleContent]> = [
  ["index.html", locales.find(({ locale }) => locale === "en")!],
  ...locales.map((locale) => [`${locale.locale}/index.html`, locale] as const),
];

async function readOutput(path: string) {
  return readFile(join(dist, path), "utf8");
}

describe("generated locale pages", () => {
  it("configures the complete locale set", () => {
    expect(locales.map(({ locale }) => locale)).toEqual(expectedLocaleCodes);
  });

  it.each(localePages)(
    "renders %s with complete localized content",
    async (file, locale) => {
      const html = await readOutput(file);
      const $ = load(html);
      const alternates = $('link[rel="alternate"]')
        .map((_, element) => $(element).attr("hreflang"))
        .get();
      const languageLinks = $(".language-switcher nav a");

      expect($("html").attr("lang")).toBe(locale.locale);
      expect($("html").attr("dir")).toBe(locale.dir);
      expect($('link[rel="canonical"]').attr("href")).toBe(
        `https://example.test${locale.path}`,
      );
      expect(alternates).toEqual([...expectedLocaleCodes, "x-default"]);
      expect(languageLinks).toHaveLength(expectedLocaleCodes.length);
      expect(
        languageLinks.map((_, element) => $(element).attr("hreflang")).get(),
      ).toEqual(expectedLocaleCodes);
      expect(
        languageLinks.map((_, element) => $(element).attr("dir")).get(),
      ).toEqual(locales.map(({ dir }) => dir));
      expect(
        languageLinks.filter(`[aria-current="page"]`).attr("hreflang"),
      ).toBe(locale.locale);
      expect($(`a[href="${storeUrl}"]`)).toHaveLength(1);
      expect($('link[rel="stylesheet"]').attr("href")).toBe(
        "/assets/styles.css",
      );
      expect($('script[type="application/ld+json"]')).toHaveLength(1);
      expect($('script[src="https://cloud.umami.is/script.js"]')).toHaveLength(
        1,
      );
      expect(
        $('script[src="https://cloud.umami.is/script.js"]').attr(
          "data-website-id",
        ),
      ).toBe("3b19e0ec-450a-4614-acbb-a1c0913341e0");
      expect($('meta[property="og:title"]')).toHaveLength(1);
      expect($('meta[name="twitter:card"]').attr("content")).toBe(
        "summary_large_image",
      );
      expect($('meta[name="color-scheme"]').attr("content")).toBe("light dark");
      expect($("main.hero-shell")).toHaveLength(1);
      expect($("main > section")).toHaveLength(2);
      expect(
        $('picture.hero-art img[src="/assets/hero-art.webp"]'),
      ).toHaveLength(1);
      expect($('img[src="/assets/logo.svg"]')).toHaveLength(1);
      expect($('[data-action="install"]').text()).toContain(locale.hero.cta);
      expect(
        $('[data-action="install"] svg[data-icon="chrome"] path')
          .map((_, element) => $(element).attr("fill"))
          .get(),
      ).toEqual(["#EA4335", "#FBBC04", "#34A853", "#4285F4"]);
      expect($('[data-action="donate"]').text()).toContain(locale.hero.donate);
      expect($(".hero-copy h1").text().trim()).toBe(locale.hero.title);
      expect($(".hero-subtitle").text().trim()).toBe(locale.hero.subtitle);
      expect($(".hero-note")).toHaveLength(0);
      expect(
        $(".feature-strip li")
          .map((_, element) => $(element).text().trim())
          .get(),
      ).toEqual(locale.highlights);
      expect($(".author-row").text()).toContain(locale.authorPrefix);
      expect($(".author-row").text()).toContain("Yaroslav Gulnazarian");
      expect(html).not.toContain("Your conversations");
      expect(html).not.toContain('id="features"');
    },
  );

  it("copies generated assets", async () => {
    const styles = await readOutput("assets/styles.css");

    expect(styles).toContain("font-family");
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*980px\).*?\.art-panel\s*\{\s*display:\s*none/s,
    );
    expect(styles).toMatch(/\.language-switcher nav\{[^}]*inset-inline-end:0/);
    expect(styles).toMatch(
      /\.language-switcher nav\{[^}]*max-height:[^;}]*100dvh/,
    );
    expect(styles).toMatch(/\.language-switcher nav\{[^}]*overflow-y:auto/);
    await expect(readFile(join(dist, "assets/icon.png"))).resolves.toBeTruthy();
    await expect(readFile(join(dist, "assets/logo.svg"))).resolves.toBeTruthy();
    await expect(
      readFile(join(dist, "assets/hero-art.webp")),
    ).resolves.toBeTruthy();
    await expect(
      readFile(join(dist, "assets/og-image.png")),
    ).resolves.toBeTruthy();
  });
});

describe("generated crawler files", () => {
  it("contains every canonical locale URL in the sitemap", async () => {
    const sitemap = await readOutput("sitemap.xml");

    for (const locale of locales) {
      expect(sitemap).toContain(`https://example.test${locale.path}`);
    }
    expect(sitemap).not.toContain("<loc>https://example.test/</loc>");
  });

  it("points robots.txt to the sitemap", async () => {
    await expect(readOutput("robots.txt")).resolves.toContain(
      "Sitemap: https://example.test/sitemap.xml",
    );
  });
});
