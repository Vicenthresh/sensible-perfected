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

## Version Compatibility Checking (Skill)

Use `scripts/check-mod-versions.js` to scan every mod in `modlist.json` against a set of target Minecraft versions via the Modrinth API. This produces a CSV spreadsheet and JSON report showing which mods support which versions.

### How to invoke

```bash
node scripts/check-mod-versions.js
```

### What it does

1. Reads `modlist.json` to get all 213+ mods with their Modrinth URLs
2. Extracts the project ID from each URL (slug or raw ID)
3. Calls `GET https://api.modrinth.com/v2/project/{id}/version` for each mod
4. Compares the `game_versions` in the response against a configurable list of target Minecraft versions
5. Rates each mod: `ALL` (all targets supported), `PARTIAL` (some supported), `NONE` (none), or `ERROR` (API failure)
6. Outputs three files in `reports/`:
   - `version-check-latest.md` — **primary readable report** with summary stats, legend, and full compatibility matrix using ✅/❌ emoji (renders beautifully on GitHub)
   - `version-check-latest.csv` — spreadsheet backup with columns: Mod Name, URL, Current Version, Status, and one column per target MC version (✓/✗)
   - `version-check-latest.json` — full structured data for machine consumption
   - Timestamped JSON backup

### Configuring target versions

Edit `TARGET_VERSIONS` at the top of `scripts/check-mod-versions.js`:

```js
const TARGET_VERSIONS = [
  '1.21',
  '1.21.1',
  '1.21.2',
  '1.21.3',
  '1.21.4',
  '1.21.5',
  '1.22',
];
```

### Rate limiting

The script adds a 300ms delay between requests to respect Modrinth's API. If rate-limited (HTTP 429), it respects the `Retry-After` header and retries up to 3 times.

### Agent guidance

When asked to check version compatibility:
- Run the script to generate fresh reports
- Use the CSV to identify mods that need updates or replacements for a target version
- If a mod shows `NONE` or `PARTIAL` for a desired target, check the Modrinth project page for beta/snapshot builds
- The `reports/` directory is gitignored — reports are for local reference
