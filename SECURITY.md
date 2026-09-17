# Security policy

## Supported versions

Only the latest release gets security fixes. A fix ships as a patch release on
top of it.

## Reporting a vulnerability

Report it privately through
[GitHub's advisory form](https://github.com/mikiross87/light-presets/security/advisories/new),
not in a public issue, discussion or pull request. Include the Light Presets
and Foundry versions, and the steps that reproduce it.

## Scope

In scope:

- `scripts/`, the JavaScript that runs in the browser of every GM and player in
  a world with the module enabled. For example: preset data or a setting that
  lets one user run script in another user's browser.
- The release workflow: anything that would let someone else publish a release
  or read the Foundry package registry token.

Report problems in Foundry VTT's own lighting, or in other modules, to their
maintainers.

A preset that looks wrong is an ordinary bug. Use the bug report form for it.
