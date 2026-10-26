import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// Animation keys of CONFIG.Canvas.lightAnimations and CONFIG.Canvas.darknessAnimations
// in Foundry V14 (build 14.369). Core resolves a source's animation with
// `ANIMATIONS[type] || {}`, so a key missing here places a light that silently never animates.
const LIGHT_ANIMATIONS = [
  "flame", "torch", "revolving", "siren", "pulse", "reactivepulse", "chroma", "wave", "fog",
  "sunburst", "dome", "emanation", "hexa", "ghost", "energy", "vortex", "witchwave",
  "rainbowswirl", "radialrainbow", "fairy", "grid", "starlight", "smokepatch"
];
const DARKNESS_ANIMATIONS = ["magicalGloom", "roiling", "hole", "denseSmoke"];

function mergeObject(base, overrides) {
  const out = structuredClone(base);
  for ( const [key, value] of Object.entries(overrides) ) {
    const isObject = value && (typeof value === "object") && !Array.isArray(value);
    out[key] = isObject && out[key] && (typeof out[key] === "object") ? mergeObject(out[key], value) : value;
  }
  return out;
}

function diffObject(original, other) {
  const diff = {};
  for ( const [key, value] of Object.entries(other) ) {
    const isObject = value && (typeof value === "object") && !Array.isArray(value);
    if ( isObject && original[key] && (typeof original[key] === "object") ) {
      const inner = diffObject(original[key], value);
      if ( Object.keys(inner).length ) diff[key] = inner;
    }
    else if ( original[key] !== value ) diff[key] = value;
  }
  return diff;
}

const EN_PATH = new URL("../lang/en.json", import.meta.url);

/** Flatten nested translation JSON to dotted keys, as Foundry does. */
function flatten(obj, prefix = "") {
  return Object.entries(obj).reduce((out, [k, v]) => (v && typeof v === "object")
    ? Object.assign(out, flatten(v, `${prefix}${k}.`)) : Object.assign(out, { [`${prefix}${k}`]: v }), {});
}

const requestedKeys = new Set();

function i18nStub() {
  const table = existsSync(EN_PATH) ? flatten(JSON.parse(readFileSync(EN_PATH, "utf8"))) : {};
  const localize = key => { requestedKeys.add(key); return table[key] ?? key; };
  // Same substitution rule as Foundry's Localization#format: {name} → data.name.
  const format = (key, data = {}) => localize(key).replace(/{(\w+)}/g, (m, k) => (k in data ? String(data[k]) : m));
  // Foundry's Localization#getListFormatter, in English.
  const getListFormatter = ({ style = "long", type = "conjunction" } = {}) => new Intl.ListFormat("en", { style, type });
  return { localize, format, getListFormatter };
}

// Shared across calls: main.js is imported once per process, so its Hooks.on registrations
// land here on the first call only.
const hooks = {};

/** Load scripts/main.js against minimal Foundry stubs and return every preset tool, group by group. */
async function loadPresetTools() {
  globalThis.Hooks = { on: (name, fn) => hooks[name] = fn, once: (name, fn) => hooks[name] = fn };
  globalThis.foundry = {
    utils: { mergeObject, deepClone: structuredClone, diffObject, isEmpty: obj => !Object.keys(obj).length },
    canvas: { layers: { LightingLayer: class { _updateDragPreview() {} } } },
    applications: { sheets: { palette: { AmbientLightPalette: { isActivePreset: () => false } } } }
  };
  const labelled = keys => Object.fromEntries(keys.map(key => [key, { label: key }]));
  globalThis.CONFIG = {
    Canvas: { lightAnimations: labelled(LIGHT_ANIMATIONS), darknessAnimations: labelled(DARKNESS_ANIMATIONS) }
  };
  globalThis.game = { i18n: i18nStub() };
  const lighting = { tools: {} };
  globalThis.ui = { controls: { controls: { lighting }, render() {} } };
  await import("../scripts/main.js");

  hooks.init();
  hooks.getSceneControlButtons({ lighting });
  const groups = Object.values(lighting.tools);
  const presets = [];
  for ( const group of groups ) {
    group.onChange();
    presets.push(...Object.values(lighting.tools).filter(t => t.createData && !groups.includes(t)));
  }
  // Collapse back to the group buttons: main.js keeps the open group in module state, and
  // the next call should start from the top level as a fresh toolbar does.
  lighting.tools.lightPresetBack.onChange();
  return { presets, hooks };
}

test("every preset's animation is one V14 defines for its kind of source", async () => {
  const { presets } = await loadPresetTools();
  assert.equal(presets.length, 21);
  for ( const { title, createData: { config } } of presets ) {
    const { type } = config.animation;
    if ( type === null ) continue;
    const known = config.negative ? DARKNESS_ANIMATIONS : LIGHT_ANIMATIONS;
    assert.ok(known.includes(type), `${title}: "${type}" is not a V14 ${config.negative ? "darkness" : "light"} animation`);
  }
});

test("every placed light matching a preset records it in its flags", async () => {
  const { presets, hooks } = await loadPresetTools();
  const createLight = source => {
    const updates = [];
    hooks.preCreateAmbientLight({ _source: source, updateSource: u => updates.push(u) });
    return updates;
  };

  // Each preset must be recognised as itself, which also fails if two presets share createData.
  for ( const { name, createData } of presets ) {
    assert.deepEqual(createLight(structuredClone(createData)), [{ "flags.light-presets.preset": name }], name);
  }

  const torch = presets.find(p => p.name === "presetTorch");
  const placed = structuredClone(torch.createData);
  placed.config = { ...placed.config, dim: 40, bright: 20 };
  assert.deepEqual(createLight({ x: 100, y: 100, ...placed }), [{ "flags.light-presets.preset": "presetTorch" }]);

  placed.config = { ...placed.config, color: "#123456" };
  assert.deepEqual(createLight(placed), []);
});

/** Title and toolclip of every tool the module builds, top level first, then each group opened. */
async function toolbarText() {
  const { hooks } = await loadPresetTools();
  const lighting = { tools: {} };
  globalThis.ui.controls.controls.lighting = lighting;
  hooks.getSceneControlButtons({ lighting });
  const text = tools => Object.values(tools).map(({ name, title, toolclip }) => ({ name, title, toolclip }));
  const out = { top: text(lighting.tools) };
  for ( const group of Object.values(lighting.tools) ) {
    group.onChange();
    out[group.name] = text(lighting.tools);
    lighting.tools.lightPresetBack.onChange();
  }
  return out;
}

test("toolbar text matches the English snapshot", async () => {
  const expected = JSON.parse(readFileSync(new URL("./toolbar-en.snapshot.json", import.meta.url), "utf8"));
  assert.deepEqual(await toolbarText(), expected);
});

test("every module string comes from lang/en.json, and every entry there is used", async () => {
  requestedKeys.clear();
  await toolbarText();
  const own = [...requestedKeys].filter(k => k.startsWith("LIGHTPRESETS."));
  assert.ok(own.length, "the module requests no LIGHTPRESETS.* keys");
  const table = existsSync(EN_PATH) ? flatten(JSON.parse(readFileSync(EN_PATH, "utf8"))) : {};
  for ( const key of own ) assert.ok(key in table, `${key} is missing from lang/en.json`);
  for ( const key of Object.keys(table) ) assert.ok(requestedKeys.has(key), `${key} in lang/en.json is never used`);
});

test("cone presets say they aim by drag direction, never by scrolling during the drag", async () => {
  const toolbar = await toolbarText();
  const cones = Object.values(toolbar).flat().filter(t => t.toolclip?.items.some(i => i.heading === "Emission angle"));
  assert.equal(cones.length, 2);
  for ( const { title, toolclip } of cones ) {
    const text = JSON.stringify(toolclip);
    assert.ok(!/scroll while dragging/i.test(text), `${title} still says to scroll while dragging`);
    assert.ok(toolclip.items.some(i => i.heading === "Aim"), `${title} has no Aim line`);
  }
});

test("the presets added for #51 exist with their animations", async () => {
  const { presets } = await loadPresetTools();
  const expected = {
    presetStarlight: "starlight", presetBioluminescence: "pulse", presetUnderwater: "wave",
    presetArcaneWard: "hexa", presetPortal: "vortex", presetStorm: "energy", presetSmoke: "denseSmoke"
  };
  for ( const [name, type] of Object.entries(expected) ) {
    const preset = presets.find(p => p.name === name);
    assert.ok(preset, `${name} is missing`);
    assert.equal(preset.createData.config.animation.type, type, name);
  }
  assert.equal(presets.find(p => p.name === "presetSmoke").createData.config.negative, true);
});
