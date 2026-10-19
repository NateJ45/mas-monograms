// Foundation, edit with care
// =============================================================================
// The Studio theme for MAS Monograms: the kit's colours with Mary Ann's
// larger type
// =============================================================================
// The colours, paper, radius and heading weight are the shared kit's
// (src/sanity/studioTheme.ts, starter PORTS.md cards 110 and 116, PORTABLE).
// The one difference from buildStudioTheme() there is the font config, which
// goes through readableFontConfig() (./theme.ts) so list rows read at about
// 16px and the boxes she types in at 18px. @sanity/ui 4 bakes its CSS from
// the config inside buildTheme, so the scale has to go in here, not on the
// built theme. Starter proposal: a `scale` option on buildStudioTheme.
// =============================================================================

import { buildTheme, type RootTheme, type ThemeConfig } from '@sanity/ui/theme';
import brand from '../../brand/brand.config.json';
import { studioRadius } from '../lib/studio-theme';
import { HEADING_WEIGHT, studioThemeColors, type StudioFonts } from './studioTheme';
import { readableFontConfig } from './theme';

const DEFAULTS = buildTheme();

type FontInput = Parameters<typeof readableFontConfig>[0];

/** Light and dark, so Sanity's Appearance menu still works; the kit seeds light. */
export function buildReadableStudioTheme(fonts: StudioFonts): RootTheme {
  const font = readableFontConfig(
    DEFAULTS.v2!.font as unknown as FontInput,
    fonts,
    HEADING_WEIGHT,
  ) as unknown as NonNullable<ThemeConfig['font']>;
  const radius = studioRadius((brand as { radius?: unknown }).radius, DEFAULTS.v2!.radius);
  return buildTheme({ font, radius, ...studioThemeColors });
}
