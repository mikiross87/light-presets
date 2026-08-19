/**
 * Light Presets
 * Adds preset buttons to the lighting scene controls, mirroring how core V14
 * implements wall type presets (see WallPalette.onClickPreset). Clicking a
 * preset stores its data in the core "ambientLightPalette" client setting, so
 * every subsequently drawn ambient light uses it. The active preset shows a
 * pip on its button, exactly like the core wall presets.
 *
 * Dim radius always comes from the drag gesture; presets control color,
 * animation, attenuation, etc. A preset with angle < 360 drags out a cone.
 * Each preset also carries a brightRatio (bright = ratio * dim, default 0.5
 * matching core): 0 for atmospheric dim-only sources, 0.25 for soft radiant
 * ones. Applied by wrapping LightingLayer#_updateDragPreview below.
 */

/** Build a complete LightData config so switching presets never inherits leftover values. */
function lightConfig(overrides) {
  return foundry.utils.mergeObject({
    negative: false,
    priority: 0,
    alpha: 0.5,
    angle: 360,
    coloration: 1,
    attenuation: 0.5,
    luminosity: 0.5,
    saturation: 0,
    contrast: 0,
    shadows: 0,
    animation: { type: null, speed: 5, intensity: 5, reverse: false },
    darkness: { min: 0, max: 1 },
    color: null
  }, overrides, { inplace: false });
}

const PRESETS = {
  presetCandle: {
    title: "Preset: Candle",
    description: "A small, warm flame with a quick low flicker that fades out close to the source. Suits bedside tables, shrines, and clusters of candles — place one light for a whole candelabra.",
    icon: "fa-solid fa-candle-holder",
    config: {
      color: "#d78b3d",
      alpha: 0.4,
      attenuation: 0.75,
      animation: { type: "torch", speed: 4, intensity: 3 }
    }
  },
  presetTorch: {
    title: "Preset: Torch",
    description: "The classic wall-sconce or handheld torch: strong warm light with a lively flicker.",
    icon: "fa-solid fa-fire-flame-curved",
    config: {
      color: "#e69a50",
      attenuation: 0.6,
      animation: { type: "torch", speed: 5, intensity: 5 }
    }
  },
  presetLantern: {
    title: "Preset: Lantern",
    description: "Warm, steady glow with only a gentle flicker — a hooded lantern by a door, or hung outside an inn.",
    icon: "fa-solid fa-lamp",
    config: {
      color: "#f0b46a",
      attenuation: 0.45,
      animation: { type: "torch", speed: 2, intensity: 2 }
    }
  },
  presetBullseye: {
    title: "Preset: Bullseye Lantern (cone)",
    description: "A shuttered lantern that throws a focused 60° beam. Dragging draws the cone; scroll while dragging to aim it.",
    icon: "fa-solid fa-flashlight",
    config: {
      color: "#f0b46a",
      angle: 60,
      attenuation: 0.4,
      animation: { type: "torch", speed: 2, intensity: 2 }
    }
  },
  presetCampfire: {
    title: "Preset: Campfire",
    description: "A larger, heavier flame animation with deep orange tones. Campfires, braziers, and fireplaces.",
    icon: "fa-solid fa-campfire",
    config: {
      color: "#e2723f",
      attenuation: 0.55,
      animation: { type: "flame", speed: 4, intensity: 6 }
    }
  },
  presetMagical: {
    brightRatio: 0.25,
    title: "Preset: Magical Glow",
    description: "A soft violet pulse for enchanted crystals, runes, and ambient arcane light.",
    icon: "fa-solid fa-sparkles",
    config: {
      color: "#8f7fe8",
      attenuation: 0.4,
      animation: { type: "pulse", speed: 3, intensity: 4 }
    }
  },
  presetMoonlight: {
    brightRatio: 0,
    title: "Preset: Moonlight",
    description: "Pale, steady blue-white light with no animation. Windows at night, moonlit clearings, and skylights.",
    icon: "fa-solid fa-moon",
    config: {
      color: "#8fb4d9",
      alpha: 0.35,
      luminosity: 0.4,
      attenuation: 0.65
    }
  },
  presetFog: {
    brightRatio: 0,
    title: "Preset: Fog Bank",
    description: "Grey swirling fog rather than a lamp — low luminosity so it reads as atmosphere. Marshes, graveyards, and sewer haze.",
    icon: "fa-solid fa-fog",
    config: {
      color: "#c0c0c0",
      alpha: 0.45,
      luminosity: 0.35,
      attenuation: 0.7,
      animation: { type: "fog", speed: 1, intensity: 2 }
    }
  },
  presetFey: {
    brightRatio: 0,
    title: "Preset: Fey Lights",
    description: "Soft pink shimmer using the fairy animation. Feywild groves, pixie swarms, and enchanted gardens.",
    icon: "fa-solid fa-butterfly",
    config: {
      color: "#d98ae8",
      alpha: 0.45,
      attenuation: 0.55,
      animation: { type: "fairy", speed: 3, intensity: 4 }
    }
  },
  presetGhostly: {
    brightRatio: 0,
    title: "Preset: Ghostly",
    description: "Sickly green ghost-light flicker. Haunted halls, spectral apparitions, and cursed shrines.",
    icon: "fa-solid fa-ghost",
    config: {
      color: "#59b389",
      alpha: 0.4,
      attenuation: 0.7,
      animation: { type: "ghost", speed: 3, intensity: 4 }
    }
  },
  presetLava: {
    title: "Preset: Lava Glow",
    description: "Deep red-orange glow with a slow, heavy flame roil. Lava pools, forge hearts, and embers.",
    icon: "fa-solid fa-volcano",
    config: {
      color: "#d9541e",
      alpha: 0.55,
      luminosity: 0.6,
      attenuation: 0.4,
      animation: { type: "flame", speed: 2, intensity: 7 }
    }
  },
  presetDivine: {
    brightRatio: 0.25,
    title: "Preset: Divine Radiance",
    description: "Warm golden sunburst pulse. Altars, holy auras, and consecrated ground.",
    icon: "fa-solid fa-sun-bright",
    config: {
      color: "#f5dea0",
      attenuation: 0.5,
      animation: { type: "sunburst", speed: 2, intensity: 4 }
    }
  },
  presetDarkness: {
    title: "Preset: Magical Darkness (darkness source)",
    description: "A darkness source, not a light: it carves an area of magical gloom out of existing illumination. Use for darkness spells and cursed zones.",
    icon: "fa-solid fa-eclipse",
    config: {
      negative: true,
      animation: { type: "magical", speed: 3, intensity: 4 }
    }
  }
};

/** Mirror of core WallPalette.onClickPreset, targeting the ambient light palette. */
function onClickPreset(event) {
  const { tool } = event.target.closest("[data-tool]")?.dataset ?? {};
  if ( !tool ) return;
  const preset = foundry.utils.deepClone(ui.controls.tools[tool].createData);
  const Palette = foundry.applications.sheets.palette.AmbientLightPalette;
  game.settings.set("core", Palette.SETTING_KEY, preset);
  ui.controls.render({ parts: ["tools"] });
  ui.placeablesPalette?.render({ preset, preservePlacement: true });
}

/** Describe how the bright core relates to the dragged dim radius. */
function describeBrightRatio(ratio) {
  if ( ratio === 0 ) return "dim only — no bright core; your drag sets the dim radius";
  if ( ratio === 0.5 ) return "set by your drag distance; bright is half the dim radius";
  return `set by your drag distance; bright is ${Math.round(ratio * 100)}% of the dim radius`;
}

/** Build toolclip spec lines from the preset's full light config. */
function describeConfig(config, brightRatio) {
  const items = [];
  const anim = config.animation;
  if ( config.negative ) items.push({ heading: "Type", content: "Darkness source (removes light)" });
  if ( config.color ) items.push({ heading: "Color", content: config.color });
  const animConfig = CONFIG.Canvas.lightAnimations[anim.type] ?? CONFIG.Canvas.darknessAnimations[anim.type];
  items.push({
    heading: "Animation",
    content: animConfig
      ? `${game.i18n.localize(animConfig.label)} — speed ${anim.speed}, intensity ${anim.intensity}`
      : "None (steady light)"
  });
  if ( config.angle < 360 ) items.push({ heading: "Emission angle", content: `${config.angle}° cone` });
  items.push({ heading: "Intensity", content: `alpha ${config.alpha}, luminosity ${config.luminosity}` });
  items.push({ heading: "Attenuation", content: `${config.attenuation} (higher = softer edge)` });
  items.push({ heading: "Dim/bright radius", content: describeBrightRatio(brightRatio) });
  return items;
}

/**
 * Registered preset tools and their bright ratios, keyed by tool name.
 * Populated by the getSceneControlButtons hook; read by the drag-preview patch.
 * @type {Map<string, {createData: object, brightRatio: number}>}
 */
const REGISTERED = new Map();

/** The bright ratio of the currently active preset, or null if the palette doesn't match any preset. */
function activeBrightRatio() {
  const Palette = foundry.applications.sheets.palette.AmbientLightPalette;
  for ( const { createData, brightRatio } of REGISTERED.values() ) {
    if ( Palette.isActivePreset(createData) ) return brightRatio;
  }
  return null;
}

Hooks.on("getSceneControlButtons", controls => {
  const lighting = controls.lighting;
  if ( !lighting ) return;
  // Slot the presets between the draw tool (order 2) and the day toggle (order 3).
  let order = 2;
  for ( const [name, { title, description, icon, config, brightRatio = 0.5 }] of Object.entries(PRESETS) ) {
    order += 0.05;
    const fullConfig = lightConfig(config);
    const createData = { walls: true, vision: false, hidden: false, config: fullConfig };
    REGISTERED.set(name, { createData, brightRatio });
    lighting.tools[name] = {
      name,
      order,
      title,
      icon,
      button: true,
      createData,
      onChange: onClickPreset,
      toolclip: {
        heading: title,
        items: [
          { paragraph: description },
          ...describeConfig(fullConfig, brightRatio),
          { paragraph: "Click to make this the default for new lights, then drag on the canvas to place one." }
        ]
      }
    };
  }
});

/**
 * Core hardcodes bright = 0.5 * dim when dragging out a new light
 * (LightingLayer#_updateDragPreview). Wrap it so the active preset's
 * brightRatio applies instead — the drag preview stays honest, and if the
 * palette no longer matches any preset the core behavior is untouched.
 */
Hooks.once("init", () => {
  const proto = foundry.canvas.layers.LightingLayer.prototype;
  const original = proto._updateDragPreview;
  proto._updateDragPreview = function(event) {
    original.call(this, event);
    const ratio = activeBrightRatio();
    if ( (ratio === null) || (ratio === 0.5) ) return;
    const { preview } = event.interactionData;
    const bright = preview.document.config.dim * ratio;
    preview.document.updateSource({ config: { bright } });
    preview.renderFlags.set({ refreshField: true });
    preview.initializeLightSource();
  };
});
