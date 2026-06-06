import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";

const dist = join(process.cwd(), "dist");
const storeUrl =
  "https://chromewebstore.google.com/detail/chatgpt-bulk-delete/gibkdljbjknbolnjmhnahcpjecgjifde";
const expectedCopy = {
  en: {
    title: "Delete ChatGPT conversations in bulk.",
    subtitle:
      "Select, review, and delete multiple ChatGPT conversations in one go.",
    highlights: ["Free forever", "Delete in seconds", "Privacy first"],
  },
  de: {
    title: "Mehrere ChatGPT-Unterhaltungen auf einmal löschen.",
    subtitle:
      "Wähle mehrere ChatGPT-Unterhaltungen aus, prüfe deine Auswahl und lösche sie in einem Schritt.",
    highlights: [
      "Für immer kostenlos",
      "In Sekunden löschen",
      "Datenschutz zuerst",
    ],
  },
} as const;

async function readOutput(path: string) {
  return readFile(join(dist, path), "utf8");
}

describe("generated locale pages", () => {
  it.each([
    ["index.html", "en", "https://example.test/en/"],
    ["en/index.html", "en", "https://example.test/en/"],
    ["de/index.html", "de", "https://example.test/de/"],
  ])("renders %s with complete SEO metadata", async (file, lang, canonical) => {
    const html = await readOutput(file);
    const $ = load(html);
    const copy = expectedCopy[lang as keyof typeof expectedCopy];
    const alternates = $('link[rel="alternate"]')
      .map((_, element) => $(element).attr("hreflang"))
      .get();

    expect($("html").attr("lang")).toBe(lang);
    expect($('link[rel="canonical"]').attr("href")).toBe(canonical);
    expect(alternates).toEqual(
      expect.arrayContaining(["en", "de", "x-default"]),
    );
    expect($(`a[href="${storeUrl}"]`)).toHaveLength(1);
    expect($('link[rel="stylesheet"]').attr("href")).toBe("/assets/styles.css");
    expect($('script[type="application/ld+json"]')).toHaveLength(1);
    expect($('meta[property="og:title"]')).toHaveLength(1);
    expect($('meta[name="twitter:card"]').attr("content")).toBe(
      "summary_large_image",
    );
    expect($('meta[name="color-scheme"]').attr("content")).toBe("light dark");
    expect($("main.hero-shell")).toHaveLength(1);
    expect($("main > section")).toHaveLength(2);
    expect($('picture.hero-art img[src="/assets/hero-art.webp"]')).toHaveLength(
      1,
    );
    expect($('img[src="/assets/logo.svg"]')).toHaveLength(1);
    expect($('[data-action="install"]').text()).toContain(
      lang === "de" ? "Zu Chrome hinzufügen" : "Add to Chrome",
    );
    expect($('[data-action="donate"]').text()).toContain(
      lang === "de" ? "Über PayPal spenden" : "Donate via PayPal",
    );
    expect($(".hero-copy h1").text().trim()).toBe(copy.title);
    expect($(".hero-subtitle").text().trim()).toBe(copy.subtitle);
    expect($(".hero-note")).toHaveLength(0);
    expect(
      $(".feature-strip li")
        .map((_, element) => $(element).text().trim())
        .get(),
    ).toEqual(copy.highlights);
    expect($(".author-row").text()).toContain("Yaroslav Gulnazarian");
    expect(html).not.toContain("Your conversations");
    expect(html).not.toContain('id="features"');
  });

  it("copies generated assets", async () => {
    await expect(readOutput("assets/styles.css")).resolves.toContain(
      "font-family",
    );
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
  it("contains both canonical locale URLs in the sitemap", async () => {
    const sitemap = await readOutput("sitemap.xml");

    expect(sitemap).toContain("https://example.test/en/");
    expect(sitemap).toContain("https://example.test/de/");
    expect(sitemap).not.toContain("<loc>https://example.test/</loc>");
  });

  it("points robots.txt to the sitemap", async () => {
    await expect(readOutput("robots.txt")).resolves.toContain(
      "Sitemap: https://example.test/sitemap.xml",
    );
  });
});
