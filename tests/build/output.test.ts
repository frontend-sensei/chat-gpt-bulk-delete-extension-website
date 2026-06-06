import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";

const dist = join(process.cwd(), "dist");
const storeUrl =
  "https://chromewebstore.google.com/detail/chatgpt-bulk-delete/gibkdljbjknbolnjmhnahcpjecgjifde";

async function readOutput(path: string) {
  return readFile(join(dist, path), "utf8");
}

describe("generated locale pages", () => {
  it.each([
    ["index.html", "en", "https://example.test/en/"],
    ["en/index.html", "en", "https://example.test/en/"],
    ["de/index.html", "de", "https://example.test/de/"]
  ])("renders %s with complete SEO metadata", async (file, lang, canonical) => {
    const html = await readOutput(file);
    const $ = load(html);
    const alternates = $('link[rel="alternate"]')
      .map((_, element) => $(element).attr("hreflang"))
      .get();

    expect($("html").attr("lang")).toBe(lang);
    expect($('link[rel="canonical"]').attr("href")).toBe(canonical);
    expect(alternates).toEqual(expect.arrayContaining(["en", "de", "x-default"]));
    expect($(`a[href="${storeUrl}"]`)).toHaveLength(3);
    expect($('link[rel="stylesheet"]').attr("href")).toBe(
      "/assets/styles.css"
    );
    expect($('script[type="application/ld+json"]')).toHaveLength(1);
    expect($('meta[property="og:title"]')).toHaveLength(1);
    expect($('meta[name="twitter:card"]').attr("content")).toBe(
      "summary_large_image"
    );
  });

  it("copies generated assets", async () => {
    await expect(readOutput("assets/styles.css")).resolves.toContain(
      "font-family"
    );
    await expect(readFile(join(dist, "assets/icon.png"))).resolves.toBeTruthy();
    await expect(
      readFile(join(dist, "assets/og-image.png"))
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
      "Sitemap: https://example.test/sitemap.xml"
    );
  });
});
