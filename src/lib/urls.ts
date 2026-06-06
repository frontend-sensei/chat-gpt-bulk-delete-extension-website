export interface LocaleRoute {
  locale: string;
  path: string;
}

export interface AlternateLink {
  lang: string;
  url: string;
}

export function normalizeSiteUrl(input: string): string {
  const url = new URL(input);

  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an origin without a path, query, or hash");
  }

  return url.origin;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  const origin = normalizeSiteUrl(siteUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, `${origin}/`).toString();
}

export function createAlternateLinks(
  siteUrl: string,
  locales: LocaleRoute[],
  defaultLocale = locales[0]?.locale
): AlternateLink[] {
  if (!defaultLocale) {
    throw new Error("At least one locale is required");
  }

  const defaultRoute = locales.find(
    (locale) => locale.locale === defaultLocale
  );

  if (!defaultRoute) {
    throw new Error(`Default locale "${defaultLocale}" is not configured`);
  }

  return [
    ...locales.map((locale) => ({
      lang: locale.locale,
      url: absoluteUrl(siteUrl, locale.path)
    })),
    {
      lang: "x-default",
      url: absoluteUrl(siteUrl, defaultRoute.path)
    }
  ];
}
