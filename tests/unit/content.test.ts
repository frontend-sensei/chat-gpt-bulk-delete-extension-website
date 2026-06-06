import { describe, expect, it } from "vitest";
import { parseLocales, parseSiteConfig } from "../../src/lib/content.ts";

const validLocale = {
  locale: "en",
  languageName: "English",
  path: "/en/",
  dir: "ltr",
  seo: {
    title: "ChatGPT Bulk Delete",
    description: "Delete multiple ChatGPT conversations at once."
  },
  nav: {
    features: "Features",
    privacy: "Privacy",
    install: "Add to Chrome",
    language: "Language"
  },
  hero: {
    title: "Clean up ChatGPT in a few clicks",
    subtitle: "Select conversations and delete them together.",
    cta: "Add to Chrome",
    note: "Free Chrome extension"
  },
  demo: {
    title: "Your conversations",
    selected: "3 selected",
    selectAll: "Select all",
    deleteSelected: "Delete selected",
    conversations: ["Trip ideas", "Weekly planning", "Draft notes"]
  },
  featuresHeading: "A faster way to tidy your history",
  features: [
    {
      title: "Multi-select",
      text: "Choose the conversations you want to remove.",
      icon: "checks"
    }
  ],
  privacy: {
    title: "Your data stays private",
    text: "The extension does not collect or use your data.",
    linkLabel: "View privacy details"
  },
  footer: {
    tagline: "Take control of your ChatGPT history.",
    disclaimer: "Not affiliated with OpenAI."
  }
};

describe("parseLocales", () => {
  it("accepts a complete locale", () => {
    expect(parseLocales([validLocale])).toHaveLength(1);
  });

  it("rejects missing localized content", () => {
    expect(() =>
      parseLocales([{ ...validLocale, hero: { ...validLocale.hero, title: "" } }])
    ).toThrow(/hero\.title/i);
  });

  it("rejects duplicate locale paths", () => {
    expect(() =>
      parseLocales([
        validLocale,
        { ...validLocale, locale: "de", languageName: "Deutsch" }
      ])
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
      localSiteUrl: "http://localhost:8080"
    });

    expect(result.extensionId).toBe("gibkdljbjknbolnjmhnahcpjecgjifde");
  });
});
