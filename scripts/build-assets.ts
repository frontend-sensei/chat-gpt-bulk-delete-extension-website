import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceIcon = join(root, "src/assets/icon-source.jpg");
const outputDirectory = join(root, ".cache/assets");
const iconOutput = join(outputDirectory, "icon.png");
const socialOutput = join(outputDirectory, "og-image.png");

await mkdir(outputDirectory, { recursive: true });

const icon = await sharp(sourceIcon)
  .resize(256, 256, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(icon).toFile(iconOutput);

const iconData = (await readFile(sourceIcon)).toString("base64");
const socialCard = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="background" x1="80" y1="30" x2="1120" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f1ecff"/>
      <stop offset="0.5" stop-color="#fbfaff"/>
      <stop offset="1" stop-color="#dffaf3"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#3f3075" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <circle cx="1070" cy="80" r="210" fill="#6d4aff" opacity="0.10"/>
  <circle cx="90" cy="620" r="230" fill="#3dd6b0" opacity="0.14"/>
  <rect x="76" y="74" width="152" height="152" rx="36" fill="#ffffff" filter="url(#shadow)"/>
  <image href="data:image/jpeg;base64,${iconData}" x="92" y="90" width="120" height="120" preserveAspectRatio="xMidYMid slice"/>
  <text x="76" y="342" fill="#161629" font-family="Inter, Arial, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">
    ChatGPT Bulk Delete
  </text>
  <text x="80" y="417" fill="#62627a" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="500">
    Clean up your conversation history in a few clicks.
  </text>
  <rect x="80" y="474" width="258" height="68" rx="22" fill="#6d4aff"/>
  <text x="209" y="518" fill="#ffffff" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="700">
    Add to Chrome
  </text>
</svg>`;

await sharp(Buffer.from(socialCard))
  .png({ compressionLevel: 9 })
  .toFile(socialOutput);
