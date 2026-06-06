import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  createAlternateLinks,
  normalizeSiteUrl
} from "../../src/lib/urls.ts";

describe("normalizeSiteUrl", () => {
  it("removes a trailing slash", () => {
    expect(normalizeSiteUrl("https://example.com/")).toBe("https://example.com");
  });

  it("rejects a URL with a path", () => {
    expect(() => normalizeSiteUrl("https://example.com/site")).toThrow(
      /origin/i
    );
  });
});

describe("absoluteUrl", () => {
  it("joins an origin and absolute path", () => {
    expect(absoluteUrl("https://example.com/", "/de/")).toBe(
      "https://example.com/de/"
    );
  });
});

describe("createAlternateLinks", () => {
  it("returns every locale plus x-default", () => {
    const links = createAlternateLinks("https://example.com", [
      { locale: "en", path: "/en/" },
      { locale: "de", path: "/de/" }
    ]);

    expect(links).toEqual([
      { lang: "en", url: "https://example.com/en/" },
      { lang: "de", url: "https://example.com/de/" },
      { lang: "x-default", url: "https://example.com/en/" }
    ]);
  });
});
