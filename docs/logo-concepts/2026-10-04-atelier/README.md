# Logo concepts, 2026-10-04 (Atelier)

Four concepts drawn for the logo rework (outlined SVGs, no web fonts):

1. **The Hoop Seal** (`c1-*`): a threaded MAS cypher in a pair of embroidery hoops. **Chosen** as the
   primary brand mark, recoloured blue and gold (the Claret S shown in these files was dropped).
2. **The Signature Thread** (`c2-*`): "MAS" roman caps, "Monograms" in the soft italic, one thread from
   a running stitch through a loop into the underline. **Chosen** as the horizontal wordmark, also in
   blue and gold.
3. The Woven Label (`c3-*`): an end-folded garment label with the name woven in. Not chosen.
4. The Stitched Laurel (`c4-*`): a satin-stitched laurel round a soft italic M. Not chosen.

Nathan's decision (2026-10-04): concept 1 as the brand mark, concept 2 for the condensed header pill,
the footer lockup, email and documents. The production system and how to regenerate it are in
`../README.md`. `generator/` holds the scripts that drew these files and the production geometry
(`brand.mjs` writes `src/lib/brand/brandPaths.js`; needs Python with fontTools).
