// Safe to edit by hand
// =============================================================================
// QR codes: the "Print this" page
// =============================================================================
// A plain page holding the code at its exact print size (the SVG carries its
// width in inches), a short note that is hidden when printed, and a tiny script
// that opens the print box once the page has loaded. The Studio opens it from a
// blob: address in a new tab, so nothing is fetched from anywhere.
// =============================================================================

import { escapeXml } from './svg.ts';

export interface PrintPageOptions {
  /** The SVG with its size in inches set (MadeQr.printSvg). */
  svg: string;
  title: string;
  /** Shown on screen only. */
  note: string;
  /** Text colour for the note. */
  ink?: string;
}

export function printPageHtml(o: PrintPageOptions): string {
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<title>${escapeXml(o.title)}</title><style>` +
    `@page{margin:0.5in}html,body{margin:0;background:#fff;color:${o.ink ?? '#26312E'}}` +
    'body{font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;padding:0.25in}' +
    '.note{font-size:18px;line-height:1.5;max-width:36em;margin:0 0 24px}' +
    'svg{display:block}@media print{.note{display:none}body{padding:0}}' +
    `</style></head><body><p class="note">${escapeXml(o.note)}</p>${o.svg}` +
    '<script>addEventListener("load",function(){setTimeout(function(){print()},300)})</script>' +
    '</body></html>'
  );
}
