/**
 * Light Presets
 * Adds preset buttons to the lighting scene controls, mirroring how core V14
 * implements wall type presets (see WallPalette.onClickPreset). Clicking a
 * preset stores its data in the core "ambientLightPalette" client setting, so
 * every subsequently drawn ambient light uses it. The active preset shows a
 * pip on its button, exactly like the core wall presets.
 *
 * Fourteen presets would be fourteen rows in a toolbar column that already
 * holds the core lighting tools, so they are collapsed into three groups
 * (GROUPS below). The toolbar shows one button per group; clicking one drills
 * in to its presets plus a back button. A group button carries the pip when
 * the active preset is one of its members.
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

/**
 * The preset groups, in toolbar order. Every preset names one of these keys;
 * a preset whose group is unknown is reported at init and never shown.
 * @type {Record<string, {title: string, description: string, icon: string}>}
 */
const GROUPS = {
  flame: {
    title: "Light Presets: Flame",
    description: "Fire-lit sources \u2014 candles, torches, hearths, and lava.",
    icon: "fa-solid fa-fire"
  },
  atmosphere: {
    title: "Light Presets: Atmosphere",
    description: "Mostly dim-only sources that colour a space rather than light it.",
    icon: "fa-solid fa-cloud-moon"
  },
  magic: {
    title: "Light Presets: Magic",
    description: "Arcane and divine light, plus the magical darkness source.",
    icon: "fa-solid fa-wand-magic-sparkles"
  }
};

const PRESETS = {
  presetCandle: {
    group: "flame",
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
    group: "flame",
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
    group: "flame",
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
    group: "flame",
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
    group: "flame",
    title: "Preset: Campfire",
    description: "A larger, heavier flame animation with deep orange tones. Campfires, braziers, and open cooking fires.",
    icon: "fa-solid fa-campfire",
    config: {
      color: "#e2723f",
      attenuation: 0.55,
      animation: { type: "flame", speed: 4, intensity: 6 }
    }
  },
  presetChimney: {
    group: "flame",
    brightRatio: 0.25,
    title: "Preset: Chimney (cone)",
    description: "A fire set into a wall: a 180° spill that lights the room and nothing behind it, deeper and calmer than an open flame. The cone is built in rather than left to wall occlusion, because the light sits inside the wall footprint where walls would clip it. Dragging draws the cone; scroll while dragging to aim it into the room.",
    icon: "fa-solid fa-fireplace",
    config: {
      color: "#d8663a",
      angle: 180,
      attenuation: 0.65,
      animation: { type: "flame", speed: 3, intensity: 4 }
    }
  },
  presetMagical: {
    group: "magic",
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
    group: "atmosphere",
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
    group: "atmosphere",
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
    group: "atmosphere",
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
    group: "atmosphere",
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
    group: "flame",
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
    group: "magic",
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
    group: "magic",
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
 * Every preset, resolved into the form the toolbar and the drag preview need.
 * Populated at init from PRESETS, and holds all fourteen regardless of which
 * group is open: the drag-preview patch has to find the active preset's bright
 * ratio even when that preset's group is collapsed and it has no button.
 * @type {Map<string, {name: string, title: string, description: string, icon: string,
 *                     group: string, config: object, createData: object, brightRatio: number}>}
 */
const REGISTERED = new Map();

/** The group currently drilled into, or null when the group buttons are shown. */
let openGroup = null;

/** Tool-name markers, used to strip our own entries before rebuilding them. */
const GROUP_TOOL_PREFIX = "lightPresetGroup_";
const BACK_TOOL = "lightPresetBack";

/** The presets belonging to a group, in declaration order. */
function groupMembers(group) {
  return [...REGISTERED.values()].filter(p => p.group === group);
}

/** A preset's display name, without the "Preset: " prefix its tool title carries. */
function presetLabel(preset) {
  return preset.title.replace(/^Preset: /, "");
}

/** The bright ratio of the currently active preset, or null if the palette doesn't match any preset. */
function activeBrightRatio() {
  const Palette = foundry.applications.sheets.palette.AmbientLightPalette;
  for ( const { createData, brightRatio } of REGISTERED.values() ) {
    if ( Palette.isActivePreset(createData) ) return brightRatio;
  }
  return null;
}

/** A toolbar entry for one preset: click it, then drag on the canvas. */
function presetTool(preset, order) {
  return {
    name: preset.name,
    order,
    title: preset.title,
    icon: preset.icon,
    button: true,
    createData: preset.createData,
    onChange: onClickPreset,
    toolclip: {
      heading: preset.title,
      items: [
        { paragraph: preset.description },
        ...describeConfig(preset.config, preset.brightRatio),
        { paragraph: "Click to make this the default for new lights, then drag on the canvas to place one." }
      ]
    }
  };
}

/** A toolbar entry that drills in to one group's presets. */
function groupTool(key, order) {
  const { title, description, icon } = GROUPS[key];
  const members = groupMembers(key);
  return {
    name: `${GROUP_TOOL_PREFIX}${key}`,
    order,
    title,
    icon,
    button: true,
    // A getter rather than a fixed value: core reads createData to decide whether to
    // draw the active-preset pip, both when rendering tools and from the palette
    // setting's onChange (SceneControls#_updatePresetPips). Resolving the active
    // member on every read keeps the pip honest even when the palette is changed
    // from the config sheet rather than from one of our buttons.
    get createData() {
      const Palette = foundry.applications.sheets.palette.AmbientLightPalette;
      const active = members.find(p => Palette.isActivePreset(p.createData));
      return (active ?? members[0])?.createData;
    },
    onChange: () => showGroup(key),
    toolclip: {
      heading: title,
      items: [
        { paragraph: description },
        { heading: "Presets", content: members.map(presetLabel).join(", ") },
        { paragraph: "Click to open this group. The pip marks the group holding your active preset." }
      ]
    }
  };
}

/** A toolbar entry that collapses the open group back to the group buttons. */
function backTool(order) {
  return {
    name: BACK_TOOL,
    order,
    title: "Back to Preset Groups",
    icon: "fa-solid fa-chevron-left",
    button: true,
    onChange: () => showGroup(null),
    toolclip: {
      heading: "Back to Preset Groups",
      items: [{ paragraph: "Collapse this group and return to the Flame, Atmosphere, and Magic buttons." }]
    }
  };
}

/**
 * Rebuild this module's entries in a lighting control to match the open group,
 * slotting them between the draw tool (order 2) and the day toggle (order 3).
 * Clears our previous entries first, so it is safe to call repeatedly.
 */
function buildPresetTools(lighting) {
  for ( const name of Object.keys(lighting.tools) ) {
    if ( REGISTERED.has(name) || name.startsWith(GROUP_TOOL_PREFIX) || (name === BACK_TOOL) ) {
      delete lighting.tools[name];
    }
  }
  let order = 2;
  const add = tool => lighting.tools[tool.name] = tool;
  if ( openGroup ) {
    add(backTool(order += 0.05));
    for ( const preset of groupMembers(openGroup) ) add(presetTool(preset, order += 0.05));
  }
  else for ( const key of Object.keys(GROUPS) ) {
    if ( groupMembers(key).length ) add(groupTool(key, order += 0.05));
  }
}

/** Open a group, or collapse to the group buttons when passed null, and redraw the toolbar. */
function showGroup(key) {
  openGroup = key;
  const lighting = ui.controls.controls.lighting;
  if ( !lighting ) return;
  buildPresetTools(lighting);
  // Deliberately not { reset: true }, which would re-prepare every layer's controls.
  // Rebuilding this one control in place is enough, and core resizes the column
  // itself when the tool count changes (SceneControls#_prepareContext).
  ui.controls.render({ parts: ["tools"] });
}

Hooks.on("getSceneControlButtons", controls => {
  if ( controls.lighting ) buildPresetTools(controls.lighting);
});

/**
 * Resolve the preset table once, and patch the drag preview.
 *
 * Core hardcodes bright = 0.5 * dim when dragging out a new light
 * (LightingLayer#_updateDragPreview). Wrap it so the active preset's
 * brightRatio applies instead — the drag preview stays honest, and if the
 * palette no longer matches any preset the core behavior is untouched.
 */
Hooks.once("init", () => {
  for ( const [name, { title, description, icon, group, config, brightRatio = 0.5 }] of Object.entries(PRESETS) ) {
    if ( !(group in GROUPS) ) {
      console.warn(`Light Presets | preset "${name}" names unknown group "${group}" and will not be shown.`);
    }
    const fullConfig = lightConfig(config);
    REGISTERED.set(name, {
      name, title, description, icon, group,
      config: fullConfig,
      createData: { walls: true, vision: false, hidden: false, config: fullConfig },
      brightRatio
    });
  }

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
