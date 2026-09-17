# Security policy

## Supported versions

Only the latest release gets security fixes. A fix ships as a patch release on
top of it.

## Reporting a vulnerability

Report it privately through
[GitHub's advisory form](https://github.com/mikiross87/light-presets/security/advisories/new),
not in a public issue or pull request. Include the Light Presets
and Foundry versions, and the steps that reproduce it.

## Scope

In scope:

- `scripts/`, the JavaScript that runs in the browser of every GM and player in
  a world with the module enabled. For example: anything that would let data
  reaching that code run script in another user's browser.
- `.github/workflows/`: anything that would let someone else publish a release,
  read a repository secret, or run their own commands in a workflow — including
  through the text of an issue, which the triage workflow parses.

Report problems in Foundry VTT's own lighting, or in other modules, to their
maintainers.

A preset that looks wrong is an ordinary bug. Use the bug report form for it.
