# Vicenthresh's Sensible MC - V2

## Modpack Identity

A fork of "Sensible MC official" (Modrinth: tVX2TBKb), rebuilt and curated independently.

- **Minecraft:** 1.21.1
- **Loader:** Fabric (Loader 0.18.4)
- **Target audience:** Friends group, publicly available on Modrinth

## Core Philosophy

**Vanilla Enhanced** — the game should still feel like Minecraft, but better in every way.

### Primary Objectives

1. **Performance first.** The pack must run well on modest hardware. Every mod earns its place — if it tanks FPS or adds startup time without clear value, it goes. Optimization mods (Sodium, Lithium, C2ME, etc.) are non-negotiable.

2. **Vanilla feel preserved.** No tech trees, no magic systems that overpower vanilla progression, no GUIs that feel alien. Mods should extend vanilla mechanics, not replace them.

3. **Exploration is the reward.** The world should feel alive, varied, and worth exploring — better structures, more biome variety, ambient atmosphere, interesting loot. Discovery should feel exciting.

4. **Challenge exists for those who seek it.** Combat improvements, smarter mobs, survival tension — but the game never forces hardcore difficulty on someone who just wants to build.

5. **Building and relaxation.** Construction should feel satisfying. Quality-of-life mods, better placement, more decorative options. Someone who only wants to build a cozy house should have a great time.

## Decision Framework

When evaluating whether a mod belongs:

| Question | Must answer YES |
|----------|----------------|
| Does it run well? (no lag spikes, no long load times) | Always |
| Does it feel like it could be vanilla? | Almost always |
| Does it add value without complexity? | Yes |
| Can a new player understand it without a wiki? | Ideally |
| Does it conflict with existing mods? | Must not |

When in doubt: **less is more.** A smaller, polished pack beats a bloated one.

## Mod Categories

### Non-negotiable (Performance & Core)
Sodium, Lithium, C2ME, Noisium, Entity Culling, Dynamic FPS, Indium, FerriteCore-equivalent, etc.

### Atmosphere & Visuals
Falling leaves, particle effects, ambient sounds, better animations, shader support (Iris). Must not cost significant FPS.

### Exploration & World
YUNG's Better Structures, better loot, biome enhancements, Distant Horizons. The world should surprise you.

### Quality of Life
Better tooltips, inventory management, minimap, recipe tweaks, easy anvils. Remove vanilla annoyances without changing the game's identity.

### Combat & Survival
Better Combat, Simply Swords-style weapons, smarter mobs — but always optional engagement. You can still avoid fights.

### Building & Decoration
Supplementaries, furniture, slabs/stairs enhancements, visual workbench. Expand the builder's palette.

### Social & Multiplayer
Voice chat, player locator, shared maps. The pack is meant to be played together.

## Assistant Role

The AI assistant for this project should:

- Help evaluate mods for compatibility and performance impact
- Review crash logs and debug mod conflicts
- Check if new mods align with the pack's philosophy
- Suggest alternatives when a mod doesn't fit
- Help maintain the mod list and changelogs
- Understand Fabric mod internals, mixin conflicts, and load order
- Know which mods are known to conflict on 1.21.1
- Advise on resource pack layering and compatibility
- Help optimize configs for performance vs. quality tradeoffs

## Technical Notes

- Instance location: `%APPDATA%/PrismLauncher/instances/Vicenthresh's Sensible MC - V2/`
- This repo tracks: mod list, custom configs, changelogs, exports
- Actual mod jars are NOT in this repo (downloaded via Modrinth references)
- Export format: `.mrpack` (Modrinth modpack format)
