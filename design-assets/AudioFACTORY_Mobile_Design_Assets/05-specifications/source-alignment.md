# Source alignment and project-specific implementation notes

Based on the supplied `audio-factory (2).zip` source archive.

## Existing implementation landmarks

- `App.tsx` routes `/app`, `/app/studio`, `/app/projects`, `/app/account` and `/app/billing` into `StudioApp`.
- `src/studio/StudioApp.tsx` is the studio application shell.
- `components/MonologueBentoStudio.tsx` contains script editing, persona/voice selection, generation/playback, save and WAV download callbacks.
- `components/MultiSpeakerStudio.tsx` contains the multi-speaker workflow.
- `components/BgmGenerator.tsx` and `components/AudioProductionSuite.tsx` cover music and audio tools.
- `components/VoiceCloningModal.tsx` covers voice cloning UI.
- `components/terminal/` contains a separate terminal-style presentation layer.
- `services/geminiService.ts`, `services/elevenLabsService.ts`, `services/firebaseService.ts`, `services/entitlementService.ts` and Liveblocks context files support existing service behavior.
- `index.css` currently defines a warm light theme and utility styles. The token pack adds a dark-first palette and light theme companion; it does not require deleting existing skin logic.

## Migration constraints

1. Preserve existing props and callback contracts while moving components into the new shell.
2. Do not duplicate generation logic in new UI components.
3. Treat existing provider controls as provider-specific. Only expose settings supported by the selected provider/model.
4. Keep the existing quota/entitlement services authoritative; do not implement client-only quota enforcement.
5. Keep project save state and collaboration presence visible but visually quiet.
6. Retain error details in an expandable technical detail view; show users a concise recovery action first.
7. Convert existing modal workflows into bottom sheets on mobile only when the current workflow can be safely preserved.
8. Keep the terminal diagnostics view accessible for troubleshooting, but do not make it the primary studio experience.

## Current visual mismatch to resolve

The current `MonologueBentoStudio` uses a light warm canvas (`#F7F7F4`) and bordered bento cards; global CSS includes theme variables based on Tuscan ochre. This pack proposes a graphite-first studio with amber accent. Migrate theme tokens deliberately and preserve a light mode rather than mixing old and new color variables.
