// Safe to edit by hand
// =============================================================================
// Table panes for MAS Monograms (starter PORTS.md card 117)
// =============================================================================
// Each entry is one extra desk item that shows a list as a sortable table
// (click a heading to sort; blanks sink), with a status pill and an Open
// button. It sits BESIDE the normal list in src/sanity/structure.ts, never
// instead of it: the drag-to-reorder lists stay how she puts things in order.
// src/lib/studio-table.test.ts fails if a column's key is not in its projection.
// =============================================================================

import type { TableConfig } from '../lib/studio-table';

export const TABLES: TableConfig[] = [
  {
    id: 'clearance-table',
    title: 'Clearance items as a table',
    type: 'clearanceItem',
    projection:
      'name, salePrice, originalPrice, quantityAvailable, sold, "hasLink": defined(stripePaymentLink) && stripePaymentLink != ""',
    columns: [
      { key: 'name', label: 'Item' },
      { key: 'salePrice', label: 'Sale price' },
      { key: 'originalPrice', label: 'Was' },
      { key: 'quantityAvailable', label: 'How many left' },
      { key: 'sold', label: 'Sold', kind: 'bool' },
      { key: 'hasLink', label: 'Buy link', kind: 'bool' },
    ],
    defaultSort: { key: 'name', dir: 'asc' },
  },
  {
    id: 'price-tags-table',
    title: 'Price tags as a table',
    type: 'pricingTier',
    projection: 'label, pricePerPiece, minQuantity, maxQuantity, highlighted',
    columns: [
      { key: 'label', label: 'Price tag' },
      { key: 'pricePerPiece', label: 'Price per piece' },
      { key: 'minQuantity', label: 'From' },
      { key: 'maxQuantity', label: 'Up to' },
      { key: 'highlighted', label: 'Highlighted', kind: 'bool' },
    ],
    defaultSort: { key: 'label', dir: 'asc' },
  },
];
