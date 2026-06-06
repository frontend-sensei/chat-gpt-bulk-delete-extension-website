import { normalizeSiteUrl } from "../src/lib/urls.ts";

const siteUrl = process.env.SITE_URL;

if (!siteUrl) {
  throw new Error("SITE_URL is required for a production build");
}

const normalized = normalizeSiteUrl(siteUrl);

if (!normalized.startsWith("https://")) {
  throw new Error("Production SITE_URL must use HTTPS");
}
