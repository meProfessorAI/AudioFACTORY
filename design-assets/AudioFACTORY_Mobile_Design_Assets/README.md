# AudioFACTORY Mobile Design Assets Package

Version: 1.0.0  
Prepared: 2026-10-31  
Target: React + TypeScript + Tailwind CSS + Capacitor Android

## Package map

- `01-figma-ready/` — importable SVG artboards. In Figma, use **File → Place image** or drag each SVG onto a page. SVG layers are vector objects after import; some text may be grouped depending on the importer.
- `02-design-tokens/` — canonical JSON tokens, CSS variables and TypeScript layout constants.
- `03-svg-assets/` — reusable monochrome interface icons and app mark.
- `04-developer-handoff/` — implementation starter snippets and CSS.
- `05-specifications/` — responsive behavior, interaction contracts, screen inventory and acceptance checklist.
- `06-brand-assets/` — application mark and app icon source.

## Design direction

Premium graphite studio with warm amber creative accent. Dark theme is the primary direction. A light companion theme is included. The package is designed around an editor-first, single-workspace experience with contextual settings and persistent generation/playback actions.

## Source-code alignment

The supplied repository is a React/TypeScript application with Capacitor Android. The current project includes a monologue editor, voice profile selection, persona controls, multi-speaker studio, BGM generator, audio production suite, Firebase-related services, ElevenLabs/Gemini services, Liveblocks presence and Google Play billing components.

The assets are intentionally technology-compatible with that stack. They are design handoff materials, not a claim that the redesigned UI has already been integrated into the application.

## Suggested integration

1. Review `05-specifications/source-alignment.md`.
2. Add `02-design-tokens/tailwind-theme.css` to the application stylesheet or merge the variables into `index.css`.
3. Keep existing generation, quota, billing and persistence logic; replace presentation incrementally.
4. Implement the shared shell and mobile layout before migrating feature panels.
5. Use the component contracts in `04-developer-handoff/react/`.
6. Test on physical Android devices and browser widths listed in `responsive-spec.md`.

## Important

Do not expose provider API keys in the client. Do not treat UI quota state as authoritative. Do not claim a purchase is valid until the backend verifies it. Voice cloning and user-uploaded audio need explicit consent, clear retention behavior and secure storage.
