# Changelog

All notable changes to Light Presets are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/). Each release's section is also the
body of its GitHub release.

Add an entry under **Unreleased** in the same pull request as the change, under
_Added_, _Changed_, _Fixed_ or _Removed_, written for the GM placing lights
rather than for the code. Reference the issue or PR it closes. Maintenance that
a GM would never notice (CI, tooling, docs) needs no entry.

## [Unreleased]

### Added

- Seven new presets. Atmosphere gets Starlight, Bioluminescence and Underwater,
  and Magic gets Arcane Ward, Portal and Storm. Magic also gets Smoke Cloud, a
  second darkness source that fills an area with grey smoke. (#51)
- Configure Presets, under Configure Settings, lets you hide presets you never
  use. A group with nothing left disappears, and if only one group is left its
  presets sit directly in the toolbar. (#61)

## [1.3.0] - 2026-10-20

### Added

- Lights placed with a preset now remember which one, in
  `flags["light-presets"].preset` (for example `presetTorch`), so macros and
  tools like Mass Edit can find and update every light of a preset (#58).

### Changed

- **Fog Bank** swirls visibly from moderate scene darkness instead of barely
  registering; its tooltip now says it needs some darkness to read (#57).

### Fixed

- **Bullseye Lantern** and **Chimney** tooltips no longer tell you to scroll
  while dragging to aim, which Foundry V14 doesn't do. The cone points the way
  you drag; a new **Aim** line says so, and that a placed light turns with
  Shift + scroll (#59).

## [1.2.1] - 2026-10-14

### Fixed

- **Magical Darkness** now animates with core's Magical Gloom effect; it had
  been placing a static darkness source since 1.0.0, and its tooltip said
  "None (steady light)" (#49)

## [1.2.0] - 2026-08-21

### Changed

- The fourteen presets sit behind three toolbar groups — **Flame**,
  **Atmosphere** and **Magic** — so the lighting controls take nine rows
  instead of twenty. A collapsed group carries the indicator pip when the
  active preset is one of its members (#7)
- Each `PRESETS` entry names a `group`; groups are defined in the `GROUPS`
  table above it (#7)

## [1.1.0] - 2026-08-21

### Added

- **Chimney** preset for hearths set into walls: a 180° cone aimed with
  scroll-while-drag, calmer and deeper than Campfire (#6)

### Fixed

- The manifest description now lists all fourteen presets; it had been
  advertising six since launch (#5)

## [1.0.0] - 2026-08-19

### Added

- Thirteen one-click light presets for the V14 lighting toolbar: Candle, Torch,
  Lantern, Bullseye Lantern, Campfire, Magical Glow, Moonlight, Fog Bank, Fey
  Lights, Ghostly, Lava Glow, Divine Radiance and Magical Darkness
- Per-preset bright/dim ratios applied live in the drag preview
- Hover tooltips describing each preset using Foundry's localized animation
  names

[Unreleased]: https://github.com/mikiross87/light-presets/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/mikiross87/light-presets/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/mikiross87/light-presets/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/mikiross87/light-presets/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mikiross87/light-presets/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mikiross87/light-presets/releases/tag/v1.0.0
