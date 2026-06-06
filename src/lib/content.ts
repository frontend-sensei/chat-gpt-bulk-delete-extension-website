import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const siteConfigSchema = z.object({
  name: nonEmptyString,
  defaultLocale: nonEmptyString,
  extensionId: z.string().regex(/^[a-z]{32}$/),
  storeUrl: z.url().refine((url) => url.startsWith("https://"), {
    message: "Store URL must use HTTPS"
  }),
  localSiteUrl: z.url(),
  author: z.object({
    name: nonEmptyString,
    donateUrl: z.url().nullable(),
    socialLinks: z.array(
      z.object({
        label: nonEmptyString,
        url: z.url(),
        icon: z.enum(["github", "linkedin", "x"])
      })
    )
  })
});

export const localeContentSchema = z.object({
  locale: z.string().regex(/^[a-z]{2}(?:-[a-z]{2})?$/),
  languageName: nonEmptyString,
  path: z.string().regex(/^\/[a-z]{2}(?:-[a-z]{2})?\/$/),
  dir: z.enum(["ltr", "rtl"]),
  seo: z.object({
    title: nonEmptyString,
    description: nonEmptyString
  }),
  nav: z.object({
    install: nonEmptyString,
    language: nonEmptyString
  }),
  hero: z.object({
    title: nonEmptyString,
    subtitle: nonEmptyString,
    cta: nonEmptyString,
    donate: nonEmptyString,
    note: nonEmptyString,
    artworkCaption: nonEmptyString
  }),
  highlights: z.array(nonEmptyString).length(3),
  authorPrefix: nonEmptyString
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type LocaleContent = z.infer<typeof localeContentSchema>;

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
    .join("; ");
}

export function parseSiteConfig(input: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid site configuration: ${formatZodError(result.error)}`);
  }

  return result.data;
}

export function parseLocales(input: unknown): LocaleContent[] {
  const result = z.array(localeContentSchema).min(1).safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid locale content: ${formatZodError(result.error)}`);
  }

  const seenLocales = new Set<string>();
  const seenPaths = new Set<string>();

  for (const locale of result.data) {
    if (seenLocales.has(locale.locale)) {
      throw new Error(`Duplicate locale code: ${locale.locale}`);
    }

    if (seenPaths.has(locale.path)) {
      throw new Error(`Duplicate locale path: ${locale.path}`);
    }

    seenLocales.add(locale.locale);
    seenPaths.add(locale.path);
  }

  return result.data;
}

export function loadSiteConfig(filePath: string): SiteConfig {
  return parseSiteConfig(JSON.parse(readFileSync(filePath, "utf8")));
}

export function loadLocales(directory: string): LocaleContent[] {
  const entries = readdirSync(directory)
    .filter((file) => file.endsWith(".json") && file !== "site.json")
    .sort()
    .map((file) => JSON.parse(readFileSync(join(directory, file), "utf8")));

  return parseLocales(entries);
}
