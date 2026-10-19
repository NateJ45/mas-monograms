// Safe to edit by hand
// =============================================================================
// MAS Monograms' own icon art for the Studio (starter PORTS.md card 119)
// =============================================================================
// NOT PORTABLE. The registry in src/sanity/brandIcons.tsx draws every meaning
// with @sanity/icons; each meaning listed here is drawn with one of the
// Atelier's own small pictures instead (src/assets/brand/icon-*.svg): the
// embroidery hoop, a spool of thread, a needle and thread, a hang tag, a tote
// and the Hoop Seal. They are drawn in the site's own colours (wood, claret,
// gold, indigo, linen, kraft), shown exactly as drawn: artIcon() only places
// them in Sanity's 1em icon box. The tile behind them in list rows is kraft,
// her hang-tag card stock, in both appearances (brand.config.json
// studio.icons.tile), so the ink and wood keep their contrast. The hoop holds
// a claret monogram M (it used to hold a cross, which read as "close").
//
// Which document type, field group or tool means what: brand/brand.config.json
// `studio.icons`. Meanings with no picture here keep the starter's @sanity/icons.
// =============================================================================

import type { BrandIconKey } from '../lib/studio-icons';
import { artIcon, type BrandIcon } from './artIcon';
import hoopUrl from '../assets/brand/icon-hoop.svg?url';
import needleUrl from '../assets/brand/icon-needle.svg?url';
import sealUrl from '../assets/brand/icon-seal.svg?url';
import spoolUrl from '../assets/brand/icon-spool.svg?url';
import tagUrl from '../assets/brand/icon-tag.svg?url';
import toteUrl from '../assets/brand/icon-tote.svg?url';

const Hoop = artIcon(hoopUrl, 'Embroidery hoop');
const Needle = artIcon(needleUrl, 'Needle and thread');
const Seal = artIcon(sealUrl, 'The Hoop Seal');
const Spool = artIcon(spoolUrl, 'Spool of thread');
const Tag = artIcon(tagUrl, 'Hang tag');
const Tote = artIcon(toteUrl, 'Tote bag');

export const BRAND_ICON_ART: Partial<Record<BrandIconKey, BrandIcon>> = {
  // Home: her own Hoop Seal.
  home: Seal,
  // Photos of her work, the Style Gallery, the photo library: work in the hoop.
  image: Hoop,
  // Embroidery fonts, the Font and Lettering Guide, words: the needle that stitches them.
  text: Needle,
  // Thread colors and the Thread Color Chart.
  brandKit: Spool,
  // Price tags, the Pricing page and the clearance rack.
  give: Tag,
  // Shop categories (Hats, Totes...) and the Shop by Item page.
  category: Tote,
};
