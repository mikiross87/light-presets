import { test } from "node:test";
import assert from "node:assert/strict";

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
  globalThis.game = { i18n: { localize: key => key } };
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
  assert.equal(presets.length, 14);
  for ( const { title, createData: { config } } of presets ) {
    const { type } = config.animation;
    if ( type === null ) continue;
    const known = config.negative ? DARKNESS_ANIMATIONS : LIGHT_ANIMATIONS;
    assert.ok(known.includes(type), `${title}: "${type}" is not a V14 ${config.negative ? "darkness" : "light"} animation`);
  }
});

test("every placed light matching a preset records it in its flags", async () => {
  const { presets, hooks } = await loadPresetTools();
  const torch = presets.find(p => p.name === "presetTorch");
  const createLight = source => {
    const updates = [];
    hooks.preCreateAmbientLight({ _source: source, updateSource: u => updates.push(u) });
    return updates;
  };

  const placed = structuredClone(torch.createData);
  placed.config = { ...placed.config, dim: 40, bright: 20 };
  assert.deepEqual(createLight({ x: 100, y: 100, ...placed }), [{ "flags.light-presets.preset": "presetTorch" }]);

  placed.config = { ...placed.config, color: "#123456" };
  assert.deepEqual(createLight(placed), []);
});
