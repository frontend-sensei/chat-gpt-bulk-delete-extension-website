import { join } from "node:path";
import { minify } from "html-minifier-terser";
import nunjucks from "nunjucks";
import type { UserConfig } from "@11ty/eleventy";
import {
  loadLocales,
  loadSiteConfig,
  type LocaleContent
} from "./src/lib/content.ts";
import { createRobots, createSitemap } from "./src/lib/seo.ts";
import {
  absoluteUrl,
  createAlternateLinks,
  normalizeSiteUrl
} from "./src/lib/urls.ts";

export default function configure(eleventyConfig: UserConfig) {
  const contentDirectory = join(process.cwd(), "src/content");
  const site = loadSiteConfig(join(contentDirectory, "site.json"));
  const locales = loadLocales(contentDirectory);
  const localesByCode = Object.fromEntries(
    locales.map((locale) => [locale.locale, locale])
  ) as Record<string, LocaleContent>;

  if (!localesByCode[site.defaultLocale]) {
    throw new Error(`Default locale "${site.defaultLocale}" is not configured`);
  }

  const siteUrl = normalizeSiteUrl(
    process.env.SITE_URL ?? site.localSiteUrl
  );

  if (process.env.CF_PAGES && !process.env.SITE_URL) {
    throw new Error("SITE_URL is required for Cloudflare Pages builds");
  }

  eleventyConfig.setLibrary(
    "njk",
    nunjucks.configure("src/_includes", {
      autoescape: true,
      noCache: process.env.NODE_ENV !== "production"
    })
  );

  eleventyConfig.addGlobalData("site", site);
  eleventyConfig.addGlobalData("siteUrl", siteUrl);
  eleventyConfig.addGlobalData("locales", locales);
  eleventyConfig.addGlobalData("localesByCode", localesByCode);
  eleventyConfig.addGlobalData(
    "alternateLinks",
    createAlternateLinks(siteUrl, locales, site.defaultLocale)
  );
  eleventyConfig.addGlobalData(
    "sitemap",
    createSitemap(siteUrl, locales, site.defaultLocale)
  );
  eleventyConfig.addGlobalData("robots", createRobots(siteUrl));

  eleventyConfig.addFilter("absoluteUrl", (origin: string, path: string) =>
    absoluteUrl(origin, path)
  );
  eleventyConfig.addFilter("json", (value: unknown) =>
    JSON.stringify(value)
  );
  eleventyConfig.addFilter(
    "structuredData",
    (locale: LocaleContent) => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: site.name,
      description: locale.seo.description,
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome",
      url: absoluteUrl(siteUrl, locale.path),
      installUrl: site.storeUrl
    })
  );

  eleventyConfig.addPassthroughCopy({ ".cache/assets": "assets" });
  eleventyConfig.addWatchTarget("./.cache/assets/styles.css");

  eleventyConfig.addTransform("minify-html", async function (content: string) {
    if (this.page.outputPath?.endsWith(".html")) {
      return minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true
      });
    }

    return content;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk"]
  };
}
