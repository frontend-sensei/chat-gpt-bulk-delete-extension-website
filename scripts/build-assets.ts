import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceIcon = join(root, "src/assets/logo.svg");
const sourceArtwork = join(root, "src/assets/hero-art-source.png");
const outputDirectory = join(root, ".cache/assets");
const iconOutput = join(outputDirectory, "icon.png");
const logoOutput = join(outputDirectory, "logo.svg");
const artworkOutput = join(outputDirectory, "hero-art.webp");
const socialOutput = join(outputDirectory, "og-image.png");

await mkdir(outputDirectory, { recursive: true });

const icon = await sharp(sourceIcon)
  .resize(256, 256, { fit: "contain" })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(icon).toFile(iconOutput);
await copyFile(sourceIcon, logoOutput);
await sharp(sourceArtwork)
  .composite([
    {
      input: Buffer.from(`
        <svg width="1100" height="231" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="patch" x1="0" y1="0" x2="0" y2="231" gradientUnits="userSpaceOnUse">
              <stop stop-color="#071419" stop-opacity="0"/>
              <stop offset="0.16" stop-color="#071419" stop-opacity="0.92"/>
              <stop offset="0.24" stop-color="#071419"/>
              <stop offset="1" stop-color="#061115"/>
            </linearGradient>
          </defs>
          <rect width="1100" height="231" fill="url(#patch)"/>
        </svg>
      `),
      left: 0,
      top: 1095
    }
  ])
  .resize(1100, 1326, { fit: "fill" })
  .webp({ quality: 88, effort: 6 })
  .toFile(artworkOutput);

const iconData = (await readFile(sourceIcon)).toString("base64");
const socialCard = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="80" y1="30" x2="1120" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="#effdff"/>
      <stop offset="0.5" stop-color="#b8e1e8"/>
      <stop offset="1" stop-color="#70aeba"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#3f3075" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <circle cx="1070" cy="80" r="210" fill="#48ccdf" opacity="0.14"/>
  <circle cx="90" cy="620" r="230" fill="#ffffff" opacity="0.24"/>
  <image href="data:image/svg+xml;base64,${iconData}" x="76" y="74" width="152" height="152"/>
  <text x="76" y="342" fill="#161629" font-family="Inter, Arial, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">
    ChatGPT Bulk Delete
  </text>
  <text x="80" y="417" fill="#62627a" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="500">
    Clear the clutter. Keep what matters.
  </text>
  <rect x="80" y="474" width="258" height="68" rx="18" fill="#67d9e8"/>
  <text x="209" y="518" fill="#071113" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="700">
    Add to Chrome
  </text>
</svg>`;

await sharp(Buffer.from(socialCard))
  .png({ compressionLevel: 9 })
  .toFile(socialOutput);
