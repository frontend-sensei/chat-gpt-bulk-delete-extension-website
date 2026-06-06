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
  localSiteUrl: z.url()
});

const featureIconSchema = z.enum([
  "checks",
  "select-all",
  "confirm",
  "lightweight"
]);

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
    features: nonEmptyString,
    privacy: nonEmptyString,
    install: nonEmptyString,
    language: nonEmptyString
  }),
  hero: z.object({
    title: nonEmptyString,
    subtitle: nonEmptyString,
    cta: nonEmptyString,
    note: nonEmptyString
  }),
  demo: z.object({
    title: nonEmptyString,
    selected: nonEmptyString,
    selectAll: nonEmptyString,
    deleteSelected: nonEmptyString,
    conversations: z.array(nonEmptyString).min(3)
  }),
  featuresHeading: nonEmptyString,
  features: z
    .array(
      z.object({
        title: nonEmptyString,
        text: nonEmptyString,
        icon: featureIconSchema
      })
    )
    .min(1),
  privacy: z.object({
    title: nonEmptyString,
    text: nonEmptyString,
    linkLabel: nonEmptyString
  }),
  footer: z.object({
    tagline: nonEmptyString,
    disclaimer: nonEmptyString
  })
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
