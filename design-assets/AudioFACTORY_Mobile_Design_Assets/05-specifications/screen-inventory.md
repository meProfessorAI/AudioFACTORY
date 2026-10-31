# Screen and component inventory

This package intentionally defines a unified workspace, not a separate navigation destination for every capability.

| Screen / surface | Purpose | Primary content | Mobile treatment |
|---|---|---|---|
| Unified Studio | Main creation surface | Script, voice, generation, output | Single screen |
| Multi-speaker mode | Dialogue production | Speakers, dialogue blocks, sequencing | Stacked cards |
| Audio mixer | Composition | Narration, BGM, SFX layers and levels | Compact layer cards |
| Voice library | Discover/select voices | Search, filters, preview, saved voices | Full-height sheet or tab surface |
| Projects drawer | Open/create/manage projects | Recent projects, search, actions | Full-screen drawer |
| Export sheet | Export settings | Format, quality, filename | Bottom sheet |
| Account/settings | Identity, plan, preferences | Profile, plan, theme, settings | Full-screen sheet |
| Diagnostics | Troubleshooting | Provider status, request IDs, errors | Secondary drawer |

## Core reusable components

- `StudioShell`
- `StudioHeader`
- `ToolRail`
- `CreativeCanvas`
- `ScriptEditor`
- `ModeSwitcher`
- `VoiceSummary`
- `VoiceInspector`
- `SpeakerBlock`
- `AudioLayerCard`
- `WaveformPreview`
- `AudioTransport`
- `GenerateActionBar`
- `BottomSheet`
- `ProjectDrawer`
- `ExportSheet`
- `StatusToast`
