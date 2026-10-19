// Safe to edit by hand
// The icon names a guide may use, and what each one MEANS in the Studio's icon
// registry (src/lib/studio-icons.ts, starter PORTS.md cards 119 and 128). The
// Site Guide draws a guide's meaning as an art tile, using her own art where
// she has some (the hoop for photos, the needle for words, the spool for
// colours, the hang tag for prices, the tote for categories: brandIconArt.tsx).
// Plain data (no React) so the guide content and the unit tests can import it.
// GUIDE_MEANINGS is a Record over the names, so a name added here without a
// meaning is a compile error.
import type { BrandIconKey } from '../../lib/studio-icons.ts';

export const GUIDE_ICON_NAMES = [
  'wave',
  'publish',
  'undo',
  'edit',
  'page',
  'phone',
  'tag',
  'question',
  'sparkle',
  'image',
  'circle',
  'basket',
  'card',
  'text',
  'color',
  'folder',
  'clock',
  'warning',
  'search',
  'trash',
  'help',
  'list',
  'heart',
  'star',
  'pin',
  'globe',
  'users',
  'chart',
  'qr',
  'download',
  'brush',
  'envelope',
  'calendar',
  'camera',
  'megaphone',
  'map',
] as const;
export type GuideIconName = (typeof GUIDE_ICON_NAMES)[number];

/** Each guide icon name as a meaning in the icon registry. */
export const GUIDE_MEANINGS: Record<GuideIconName, BrandIconKey> = {
  wave: 'home',
  publish: 'publishing',
  undo: 'trash',
  edit: 'text',
  page: 'page',
  phone: 'contact',
  tag: 'give',
  question: 'question',
  sparkle: 'help',
  image: 'image',
  circle: 'image',
  basket: 'category',
  card: 'give',
  text: 'text',
  color: 'brandKit',
  folder: 'category',
  clock: 'times',
  warning: 'checkup',
  search: 'search',
  trash: 'trash',
  help: 'help',
  list: 'table',
  heart: 'testimonial',
  star: 'value',
  pin: 'place',
  globe: 'link',
  users: 'people',
  chart: 'overview',
  qr: 'link',
  download: 'download',
  brush: 'brandKit',
  envelope: 'message',
  calendar: 'event',
  camera: 'image',
  megaphone: 'notice',
  map: 'place',
};
