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

[Unreleased]: https://github.com/mikiross87/light-presets/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/mikiross87/light-presets/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mikiross87/light-presets/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mikiross87/light-presets/releases/tag/v1.0.0
