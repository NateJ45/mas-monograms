// Safe to edit by hand
// The icon names a guide may use. Plain data (no React) so the guide content
// and the unit tests can import it; ./icons.ts maps each name to an
// @sanity/icons component with a Record, so a name added here without an icon
// is a compile error. Add a name here, then its icon in icons.ts.
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
