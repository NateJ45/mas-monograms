// Safe to edit by hand (the numbers); the words live in src/sanity/qrCopy.ts
// =============================================================================
// QR codes: where the code will be printed, and how big
// =============================================================================
// The sizes follow the usual rule of thumb for QR codes: the code should be at
// least about one tenth of the distance it is scanned from, and never smaller
// than about 2 cm (0.8 inch) for something held in the hand. A hang tag or a
// business card is scanned from a hand's length away; a table sign at a craft
// fair from a step or two back (about 3 feet, so 2.5 to 3 inches: the table sign printed by the brand kit has a 3 inch square for it).
//
// `printInches` is the size the "Print this" page uses: the top of the range,
// because bigger always scans more easily. Sizes are for the square code
// itself; the blank border (the quiet zone, 4 module widths, the minimum the
// QR standard asks for) is added around it.
//
// `medium` goes into the link as utm_medium. Keep it short: a longer link
// makes a denser code.
// =============================================================================

export const PLACEMENT_IDS = ['tag', 'card', 'flyer', 'insert', 'sign', 'box'] as const;
export type PlacementId = (typeof PLACEMENT_IDS)[number];

export interface Placement {
  id: PlacementId;
  /** utm_medium. */
  medium: string;
  /** Recommended width of the code, smallest and largest, in inches. */
  minInches: number;
  maxInches: number;
  /** The size the print page uses. */
  printInches: number;
  /** Blank border around the code, in module widths (4 is the standard minimum). */
  quietZone: number;
}

export const PLACEMENTS: Record<PlacementId, Placement> = {
  tag: { id: 'tag', medium: 'tag', minInches: 0.8, maxInches: 1, printInches: 1, quietZone: 4 },
  card: { id: 'card', medium: 'card', minInches: 0.8, maxInches: 1, printInches: 1, quietZone: 4 },
  flyer: {
    id: 'flyer',
    medium: 'flyer',
    minInches: 1.5,
    maxInches: 2,
    printInches: 2,
    quietZone: 4,
  },
  insert: {
    id: 'insert',
    medium: 'insert',
    minInches: 1,
    maxInches: 1.5,
    printInches: 1.5,
    quietZone: 4,
  },
  sign: { id: 'sign', medium: 'sign', minInches: 2.5, maxInches: 3, printInches: 3, quietZone: 4 },
  box: { id: 'box', medium: 'box', minInches: 1.5, maxInches: 2, printInches: 2, quietZone: 4 },
};

/** 2.54 cm to the inch, rounded to the half centimetre a ruler shows. */
export function toCm(inches: number): number {
  return Math.round(inches * 2.54 * 2) / 2;
}

const num = (n: number) => String(Number(n.toFixed(2)));

/**
 * "inch" or "inches" for a number, the way a ruler reads aloud: 1 inch and
 * anything smaller ("0.8 inch") is singular, anything bigger is plural
 * ("1.5 inches", "2 inches"). Every size the tool shows goes through here.
 */
export function inchUnit(n: number): 'inch' | 'inches' {
  return Number(n.toFixed(2)) > 1 ? 'inches' : 'inch';
}

/** "1 inch (2.5 cm)", "4 inches (10 cm)": one size, both units. */
export function inchesText(inches: number): string {
  return `${num(inches)} ${inchUnit(inches)} (${num(toCm(inches))} cm)`;
}

/** "About 0.8 to 1 inch (2 to 2.5 cm)". The unit follows the larger number. */
export function sizeText(p: Pick<Placement, 'minInches' | 'maxInches'>): string {
  return `About ${num(p.minInches)} to ${num(p.maxInches)} ${inchUnit(p.maxInches)} (${num(
    toCm(p.minInches),
  )} to ${num(toCm(p.maxInches))} cm)`;
}

/**
 * The smallest a single square of the code (a module) should print. Phone
 * cameras read about 0.4 mm squares from close up; below that, a dense link
 * needs a bigger print.
 */
export const MIN_MODULE_MM = 0.4;

/**
 * The width to print the code at, in inches: the placement's print size, made
 * bigger only if the code is so dense that its squares would be too small.
 */
export function printInchesFor(p: Placement, moduleCount: number): number {
  const needed = (moduleCount * MIN_MODULE_MM) / 25.4;
  return Math.max(p.printInches, Math.ceil(needed * 10) / 10);
}

/** The width of one square of the code at a print size, in millimetres. */
export function moduleMm(inches: number, moduleCount: number): number {
  return (inches * 25.4) / moduleCount;
}
