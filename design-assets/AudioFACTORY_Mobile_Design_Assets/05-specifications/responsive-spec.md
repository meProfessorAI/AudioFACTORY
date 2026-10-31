# Responsive specification

## Breakpoints

| Range | Layout | Behavior |
|---|---|---|
| 320–430 px | Mobile | One-column canvas, no side rail, settings in bottom sheets, sticky generate bar |
| 431–767 px | Large mobile / compact tablet | One-column canvas, optional horizontal tool strip, sheets remain full-width |
| 768–1023 px | Tablet | Collapsible rail, editor-first canvas, inspector as overlay drawer |
| 1024–1439 px | Desktop | 64 px tool rail, flexible editor, 288 px inspector |
| 1440 px+ | Wide desktop | Centered content max 1440 px, inspector persistent where useful |

## Mobile viewport rules

- Header height: 56 px plus platform safe-area inset.
- Bottom action region: 76 px plus bottom safe-area inset.
- Primary touch target: minimum 44 × 44 px; prefer 48 × 48 px for primary actions.
- Content horizontal padding: 16 px.
- Main card radius: 14–16 px.
- Never place a required action behind the software keyboard.
- When the script editor receives focus, scroll the focused field into view and allow the action bar to compact or move above the keyboard.
- Do not require horizontal scrolling to access core functions.
- Keep the current project name and save/sync status visible.
- Avoid showing the entire audio timeline by default on mobile; use a compact waveform preview with an expand action.

## Desktop rules

- 64 px icon rail; collapse/expand with accessible labels.
- Editor takes remaining width.
- Inspector target width 288 px; collapsible.
- Audio transport remains available at the bottom of the studio.
- Keep editor and inspector independently scrollable where needed.
- At 1280 × 720, prioritize editor height and allow inspector collapse.

## Component behavior

| Component | Mobile | Desktop |
|---|---|---|
| StudioHeader | Brand + project title + overflow | Brand + project title + save/account |
| ToolRail | Bottom navigation / contextual menu | Vertical icon rail |
| ScriptEditor | Full-width editor | Flexible central canvas |
| VoiceInspector | Bottom sheet | Right inspector |
| MultiSpeakerEditor | Stacked dialogue cards | Dialogue lanes / structured blocks |
| AudioLayers | Compact stacked layers | Timeline / mixer panel |
| AudioTransport | Sticky bottom controls | Persistent bottom transport |
| ExportPanel | Bottom sheet | Inspector section or dialog |
