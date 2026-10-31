# Figma import guide

1. Create a Figma file named `AudioFACTORY — Mobile Studio UI Kit`.
2. Create pages: `01 Foundations`, `02 Mobile Screens`, `03 Desktop`, `04 Components`, `05 Handoff`.
3. Import SVGs from `01-figma-ready/screens/` into `02 Mobile Screens` and `03 Desktop`.
4. Import `component-library-board.svg` into `04 Components`.
5. Recreate token styles from `02-design-tokens/design-tokens.json` as Figma Color, Text, Effect and Variable styles.
6. Use the SVG screen artboards as reference frames; they are editable vectors but are not a fully auto-layout Figma component library.
7. Build responsive variants using the measurements in `responsive-spec.md`.

Suggested frame sizes:
- Android compact: 360 × 800
- Android standard: 390 × 844
- Android large: 430 × 932
- Desktop: 1440 × 900
