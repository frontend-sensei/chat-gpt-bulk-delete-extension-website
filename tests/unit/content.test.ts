import { describe, expect, it } from "vitest";
import { parseLocales, parseSiteConfig } from "../../src/lib/content.ts";

const validLocale = {
  locale: "en",
  languageName: "English",
  path: "/en/",
  dir: "ltr",
  seo: {
    title: "ChatGPT Bulk Delete",
    description: "Delete multiple ChatGPT conversations at once.",
  },
  nav: {
    install: "Add to Chrome",
    language: "Language",
  },
  hero: {
    title: "Clear the clutter. Keep what matters.",
    subtitle:
      "Select multiple ChatGPT conversations and remove them in one go.",
    cta: "Add to Chrome",
    donate: "Donate via PayPal",
    note: "Free · Confirmation before deletion · Zero tracking",
    artworkCaption: "Selected. Confirmed. Gone.",
  },
  highlights: ["Bulk select", "Confirm first", "No trackers"],
  authorPrefix: "Built by",
};

describe("parseLocales", () => {
  it("accepts a complete locale", () => {
    expect(parseLocales([validLocale])).toHaveLength(1);
  });

  it("rejects missing localized content", () => {
    expect(() =>
      parseLocales([
        { ...validLocale, hero: { ...validLocale.hero, title: "" } },
      ]),
    ).toThrow(/hero\.title/i);
  });

  it("rejects duplicate locale paths", () => {
    expect(() =>
      parseLocales([
        validLocale,
        { ...validLocale, locale: "de", languageName: "Deutsch" },
      ]),
    ).toThrow(/duplicate locale path/i);
  });
});

describe("parseSiteConfig", () => {
  it("accepts an HTTPS Chrome Web Store URL", () => {
    const result = parseSiteConfig({
      name: "ChatGPT Bulk Delete",
      defaultLocale: "en",
      extensionId: "gibkdljbjknbolnjmhnahcpjecgjifde",
      storeUrl:
        "https://chromewebstore.google.com/detail/chatgpt-bulk-delete/gibkdljbjknbolnjmhnahcpjecgjifde",
      localSiteUrl: "http://localhost:8080",
      author: {
        name: "Yaroslav Gulnazarian",
        donateUrl: null,
        socialLinks: [],
      },
    });

    expect(result.extensionId).toBe("gibkdljbjknbolnjmhnahcpjecgjifde");
    expect(result.author.donateUrl).toBeNull();
  });
});
