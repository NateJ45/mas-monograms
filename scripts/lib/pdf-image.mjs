// A one-page PDF holding one full-page picture, on Node's own zlib (2026-10-05, brand kit).
//
// The kit's printables (table signs, brand sheet) are drawn as SVG and rasterised at 300 dpi
// like every other kit file; this wraps the pixels in a PDF of the exact paper size so that
// "Print" prints them at the right size (a PNG opened in a photo viewer tends to be scaled to
// fit, or cropped). The pixels go in losslessly (raw RGB, Flate with the PNG "Up" predictor,
// which suits flat artwork), so text stays crisp. No dependency needed: a PDF with one image
// is a handful of objects.
//
// Deterministic: no creation date, no random id, so the same pixels give the same bytes.
import { deflateSync } from 'node:zlib';

/**
 * @param {object} o
 * @param {Buffer} o.rgb        raw 8-bit RGB pixels, row by row (width * height * 3 bytes)
 * @param {number} o.width      pixels
 * @param {number} o.height     pixels
 * @param {number} o.pageW      page width in points (1/72 inch), e.g. 612 for US Letter
 * @param {number} o.pageH      page height in points, e.g. 792
 * @param {string} [o.title]
 * @returns {Buffer}
 */
export function imagePdf({ rgb, width, height, pageW, pageH, title = '' }) {
  if (rgb.length !== width * height * 3) throw new Error('rgb buffer is not width*height*3');
  // PNG "Up" filter on every row: one filter byte, then the difference from the row above.
  const stride = width * 3;
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const o = y * (stride + 1);
    filtered[o] = 2;
    for (let x = 0; x < stride; x++) {
      const cur = rgb[y * stride + x];
      const up = y ? rgb[(y - 1) * stride + x] : 0;
      filtered[o + 1 + x] = (cur - up) & 0xff;
    }
  }
  const stream = deflateSync(filtered, { level: 9 });
  const content = Buffer.from(`q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q\n`, 'latin1');
  const esc = (s) => s.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, '');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    [
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 12 /Colors 3 /BitsPerComponent 8 /Columns ${width} >> /Length ${stream.length} >>\nstream\n`,
      stream,
      '\nendstream',
    ],
    [`<< /Length ${content.length} >>\nstream\n`, content, 'endstream'],
    `<< /Title (${esc(title)}) /Producer (MAS Monograms brand kit) >>`,
  ];

  const parts = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let size = parts[0].length;
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(size);
    const chunks = [Buffer.from(`${i + 1} 0 obj\n`, 'latin1')];
    for (const c of Array.isArray(obj) ? obj : [obj]) {
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c, 'latin1'));
    }
    chunks.push(Buffer.from('\nendobj\n', 'latin1'));
    for (const c of chunks) {
      parts.push(c);
      size += c.length;
    }
  });
  const xref =
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('') +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${size}\n%%EOF\n`;
  parts.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(parts);
}
