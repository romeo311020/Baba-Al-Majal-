// يحوّل ملفات SVG في public/assets/brand إلى PNG بخلفية شفافة (عدا og-image).
// يتطلب حزمة sharp:  npm i -D sharp  ثم  node scripts/export-brand-png.mjs
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'brand');

const jobs = [
  ['logo-mark.svg', 'logo-mark-512.png', 512],
  ['logo-mark.svg', 'icon-192.png', 192],
  ['logo-mark.svg', 'apple-touch-icon.png', 180],
  ['logo-horizontal-dark.svg', 'logo-horizontal-dark.png', 1320],
  ['logo-horizontal-light.svg', 'logo-horizontal-light.png', 1320],
  ['logo-square.svg', 'logo-square-1024.png', 1024],
  ['og-image.svg', 'og-image.png', 1200],
];

for (const [src, out, width] of jobs) {
  const svg = await readFile(join(dir, src));
  await sharp(svg, { density: 300 }).resize({ width }).png().toFile(join(dir, out));
  console.log('✔', out);
}
