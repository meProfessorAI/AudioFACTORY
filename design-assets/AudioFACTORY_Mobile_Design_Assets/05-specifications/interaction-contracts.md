# Interaction and state contracts

## Primary creation flow

1. User opens or creates a project.
2. User selects Monologue or Multi-speaker inside the workspace.
3. User edits script/dialogue.
4. User chooses a voice/persona and delivery configuration.
5. UI validates required inputs and checks current entitlement through existing application services.
6. User invokes the existing generation callback/service.
7. UI displays queued/running/progress/error/success state without losing editor content.
8. Generated audio appears in the output preview.
9. User previews, saves or exports using existing application callbacks.

## Required states

- Empty script.
- Draft edited / unsaved.
- Saving / saved / save failed.
- Voice loading / selected / unavailable.
- Generation idle / validating / queued / generating / succeeded / failed / quota blocked.
- Audio loading / ready / playing / paused / stopped.
- Exporting / exported / export failed.
- Offline / reconnecting / online.

## Mobile bottom sheet rules

- Use a visible drag handle and clear title.
- Close with close button, swipe down and Escape where keyboard is available.
- Preserve selected values when dismissed.
- Avoid nested sheets.
- Do not close while a destructive operation is in progress without confirmation.
- Provide a clear Apply/Done action when changes are staged.

## Audio transport rules

- One authoritative playback state.
- Prevent duplicate playback instances.
- Show elapsed and total duration.
- Provide accessible play/pause labels.
- Release AudioContext, event listeners and object URLs when no longer needed.
- Waveform preview is decorative unless connected to actual audio data; never present mock waveform as generated output.

## Accessibility

- All icon-only controls require accessible names and tooltips where applicable.
- Minimum 4.5:1 contrast for standard text.
- Focus-visible ring uses accent token.
- Do not communicate status by color alone.
- Support reduced-motion preference.
