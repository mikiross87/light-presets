# Contributing

Thanks for your interest! This is a small, no-build module — the entire
runtime is `scripts/main.js`, loaded directly by Foundry as an ES module.

## Local development

1. Clone the repo somewhere convenient.
2. Symlink it into your Foundry user data so the live world loads your copy:
   ```
   ln -s /path/to/light-presets "<userdata>/Data/modules/light-presets"
   ```
   (Remove any store-installed copy first, and remove the symlink before
   reinstalling through Foundry later.)
3. Enable the module in a world and reload the browser after each change
   (`hotReload` is off by default in Foundry).

## Adding or changing presets

All presets live in the `PRESETS` table at the top of `scripts/main.js` —
title, description, icon, light config, and `brightRatio`. Adding an entry
there is the whole job; buttons, tooltips, and behavior are generated from it.

Notes:
- Icons must be Font Awesome classes that ship inside Foundry (check
  against the bundled FA CSS — several Pro icons are available, but not all).
- Animation `type` values must exist in `CONFIG.Canvas.lightAnimations`
  (or `darknessAnimations` for negative sources).
- Specify the config fully enough that switching presets never inherits
  leftovers — `lightConfig()` fills neutral defaults for anything omitted.

## Pull requests

- Target `main`. CI must pass (ES module syntax check + manifest validation).
- One logical change per PR, with a subject line that would read well in
  release notes — commit subjects become release-note bullets.
- Don't bump `version` in `module.json`. Between releases it carries the *next*
  version with a `-dev` suffix (e.g. `1.3.0-dev`); the maintainer sets the real
  version when tagging.

## Releases (maintainer)

`main` is the only long-lived branch, and it carries unreleased work. There is
no separate development branch, because what has been published is recorded by
tags rather than by a branch: releases are cut from `vX.Y.Z` tags, and installs
resolve a release asset, never a branch. `git log vX.Y.Z..main` is the
unreleased set, and several merged pull requests routinely go out in one
release.

To cut one:

1. Set `version` in `module.json` to the plain release version (drop the `-dev`
   suffix), commit, tag `vX.Y.Z`, push the tag.
2. Bump `version` to the next `-dev` (e.g. `1.4.0-dev`) and commit, so a clone
   of `main` never reports itself as the released version — issue triage labels
   a report `outdated` by comparing the version it names against the latest
   release.

Pushing the tag runs the CI validation against the tagged tree first; a release
is only built if that passes. The release job then builds the zip, publishes the
GitHub release with notes drawn from the commit subjects since the previous tag,
and registers the version with the Foundry package registry.

### Prereleases

To let a change bake before it's official, use a semver prerelease version —
e.g. `1.1.0-beta.1` in `module.json`, tagged `v1.1.0-beta.1`. CI detects the
hyphen and treats it differently:

- Marked as a GitHub **prerelease** (won't show as the repo's "Latest release").
- **Not** registered with the Foundry package registry.
- **Not** picked up by the stable `releases/latest/download/module.json`
  manifest, so existing installs never auto-update to it.

To test one, install or update using that tag's own pinned manifest URL:
`https://github.com/mikiross87/light-presets/releases/download/vX.Y.Z-beta.N/module.json`.
Once it's confirmed good, cut the real release: bump to the plain version
(`1.1.0`), commit, tag `v1.1.0`, push — that one *does* register normally.
