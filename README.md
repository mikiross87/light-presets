# Light Presets

![Foundry Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmikiross87%2Flight-presets%2FHEAD%2Fmodule.json&query=%24.compatibility.verified&prefix=v&label=foundry&color=informational)
![Latest Release](https://img.shields.io/github/v/release/mikiross87/light-presets?label=version)
![Downloads](https://img.shields.io/github/downloads/mikiross87/light-presets/module.zip?label=downloads)
[![CI](https://github.com/mikiross87/light-presets/actions/workflows/ci.yml/badge.svg)](https://github.com/mikiross87/light-presets/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/mikiross87/light-presets?label=license)

Light presets for the Foundry VTT lighting toolbar — the same workflow the core wall tools give you (solid, terrain, door, …), but for ambient lights.

Pick a preset, then drag on the canvas: every light you draw uses that preset until you pick another. The active preset shows an indicator pip, exactly like the wall type buttons, and your choice persists across reloads.

Fourteen presets would crowd a toolbar column that already holds the core lighting tools, so they sit behind three group buttons — **Flame**, **Atmosphere**, and **Magic**. Click a group to drill in to its presets; the back arrow at the top collapses it again. A closed group carries the pip when your active preset is one of its members, so you can always see where you are without opening anything.

Requires **Foundry VTT V14** (built on the V14 placeable palette system). System-agnostic.

## Presets

| Preset | Group | Character | Bright core |
|---|---|---|---|
| Candle | Flame | Small warm flame, quick low flicker, fades fast | half of dim |
| Torch | Flame | Classic strong warm flicker | half of dim |
| Lantern | Flame | Warm, steady, gentle flicker | half of dim |
| Bullseye Lantern | Flame | Focused 60° cone — dragging draws the cone | half of dim |
| Campfire | Flame | Heavy flame animation, deep orange | half of dim |
| Chimney | Flame | Hearth set into a wall — 180° spill; dragging draws the cone | 25% of dim |
| Lava Glow | Flame | Deep red-orange, slow heavy flame | half of dim |
| Moonlight | Atmosphere | Pale steady blue-white, no animation | dim only |
| Fog Bank | Atmosphere | Grey swirling fog, reads as atmosphere | dim only |
| Fey Lights | Atmosphere | Soft pink fairy shimmer | dim only |
| Ghostly | Atmosphere | Sickly green ghost-light flicker | dim only |
| Magical Glow | Magic | Soft violet pulse | 25% of dim |
| Divine Radiance | Magic | Warm golden sunburst pulse | 25% of dim |
| Magical Darkness | Magic | A *darkness source* — carves gloom out of light | half of dim |

Hover a group for a tooltip listing its presets, or any preset for a tooltip card describing the light and its exact settings (color, animation, intensity, attenuation), using Foundry's own localized animation names.

## How it works

- Clicking a preset stores its data in Foundry's core light palette setting (`core.ambientLightPalette`), the V14 mechanism that supplies defaults for newly drawn lights. This is the same pattern core uses for its wall type presets.
- The dim radius always comes from your drag. Core hardcodes bright = ½ × dim during the drag; this module wraps `LightingLayer#_updateDragPreview` so each preset's bright ratio (0, 0.25, or 0.5) applies live in the preview and in the created light. If your palette no longer matches any preset, core behavior is untouched.
- Presets fully specify their light config, so switching presets never inherits leftover values from a previous one.
- Opening or closing a group rebuilds only the lighting control's own tools and re-renders the toolbar; the other scene controls are never re-prepared. Group buttons resolve their `createData` on read, so core's own pip logic keeps working even when you change the palette from the light config sheet rather than from a preset button.

## Customizing

All presets live in a single table (`PRESETS`) at the top of `scripts/main.js` — color, animation, alpha, attenuation, `brightRatio`, tooltip text, and the `group` the preset belongs to. Add or edit entries and reload.

The groups themselves are the `GROUPS` table just above it: a key, a title, a tooltip description, and a Font Awesome icon. Add a group there and presets can name it; a preset naming a group that doesn't exist is reported in the console and never shown.

## License

[MIT](LICENSE). This module contains no Foundry VTT source code; it uses the Foundry API under the [Limited License Agreement for Package Development](https://foundryvtt.com/article/license/). Icons are Font Awesome classes bundled with Foundry itself; no icon assets are distributed with this module.
