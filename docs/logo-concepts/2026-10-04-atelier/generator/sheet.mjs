// Review sheet: each variant rendered at several heights on its ground, composited with sharp.
import { sharp, C, HERE } from './lib.mjs';
import { join } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

async function raster(svg, h) {
  return sharp(Buffer.from(svg), { density: 600 })
    .resize({ height: h })
    .png()
    .toBuffer({ resolveWithObject: true });
}

// items: [{name, svg, dark}], heights: e.g. [360, 120, 56, 28]
export async function sheet(file, items, heights = [360, 120, 56, 28]) {
  const pad = 40;
  const rows = [];
  let H = 0;
  let maxW = 0;
  for (const it of items) {
    const imgs = [];
    let x = pad;
    let rowH = 0;
    for (const h of heights) {
      const { data, info } = await raster(it.svg, h);
      imgs.push({ input: data, left: x, top: 0, w: info.width, h: info.height });
      x += info.width + pad;
      rowH = Math.max(rowH, info.height);
    }
    rows.push({ it, imgs, rowH: rowH + pad * 2, w: x });
    H += rowH + pad * 2;
    maxW = Math.max(maxW, x);
  }
  const comps = [];
  let y = 0;
  for (const row of rows) {
    const bg = row.it.dark ? C.midnight : C.linen;
    comps.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${maxW}" height="${row.rowH}"><rect width="100%" height="100%" fill="${bg}"/></svg>`,
      ),
      left: 0,
      top: y,
    });
    for (const im of row.imgs)
      comps.push({
        input: im.input,
        left: im.left,
        top: y + pad + Math.round((row.rowH - pad * 2 - im.h) / 2),
      });
    y += row.rowH;
  }
  mkdirSync(join(HERE, 'out'), { recursive: true });
  await sharp({ create: { width: maxW, height: H, channels: 4, background: C.paper } })
    .composite(comps)
    .png()
    .toFile(file);
}

export function save(name, svg) {
  mkdirSync(join(HERE, 'svg'), { recursive: true });
  writeFileSync(join(HERE, 'svg', name), svg);
}
