# Light Presets

![Foundry Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2Fmikiross87%2Flight-presets%2Freleases%2Flatest%2Fdownload%2Fmodule.json&query=%24.compatibility.verified&prefix=v&label=foundry&color=informational)
![Latest Release](https://img.shields.io/github/v/release/mikiross87/light-presets?label=version)
![Downloads](https://img.shields.io/github/downloads/mikiross87/light-presets/total?label=downloads)
[![CI](https://github.com/mikiross87/light-presets/actions/workflows/ci.yml/badge.svg)](https://github.com/mikiross87/light-presets/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/mikiross87/light-presets?label=license)

One-click light presets for the Foundry VTT lighting toolbar — the same workflow the core wall tools give you (solid, terrain, door, …), but for ambient lights.

Click a preset, then drag on the canvas: every light you draw uses that preset until you pick another. The active preset shows an indicator pip, exactly like the wall type buttons, and your choice persists across reloads.

Requires **Foundry VTT V14** (built on the V14 placeable palette system). System-agnostic.

## Presets

| Preset | Character | Bright core |
|---|---|---|
| Candle | Small warm flame, quick low flicker, fades fast | half of dim |
| Torch | Classic strong warm flicker | half of dim |
| Lantern | Warm, steady, gentle flicker | half of dim |
| Bullseye Lantern | Focused 60° cone — dragging draws the cone | half of dim |
| Campfire | Heavy flame animation, deep orange | half of dim |
| Magical Glow | Soft violet pulse | 25% of dim |
| Moonlight | Pale steady blue-white, no animation | dim only |
| Fog Bank | Grey swirling fog, reads as atmosphere | dim only |
| Fey Lights | Soft pink fairy shimmer | dim only |
| Ghostly | Sickly green ghost-light flicker | dim only |
| Lava Glow | Deep red-orange, slow heavy flame | half of dim |
| Divine Radiance | Warm golden sunburst pulse | 25% of dim |
| Magical Darkness | A *darkness source* — carves gloom out of light | half of dim |

Hover any preset for a tooltip card describing the light and its exact settings (color, animation, intensity, attenuation), using Foundry's own localized animation names.

## How it works

- Clicking a preset stores its data in Foundry's core light palette setting (`core.ambientLightPalette`), the V14 mechanism that supplies defaults for newly drawn lights. This is the same pattern core uses for its wall type presets.
- The dim radius always comes from your drag. Core hardcodes bright = ½ × dim during the drag; this module wraps `LightingLayer#_updateDragPreview` so each preset's bright ratio (0, 0.25, or 0.5) applies live in the preview and in the created light. If your palette no longer matches any preset, core behavior is untouched.
- Presets fully specify their light config, so switching presets never inherits leftover values from a previous one.

## Customizing

All presets live in a single table (`PRESETS`) at the top of `scripts/main.js` — color, animation, alpha, attenuation, `brightRatio`, tooltip text. Add or edit entries and reload.

## License

[MIT](LICENSE). This module contains no Foundry VTT source code; it uses the Foundry API under the [Limited License Agreement for Package Development](https://foundryvtt.com/article/license/). Icons are Font Awesome classes bundled with Foundry itself; no icon assets are distributed with this module.
