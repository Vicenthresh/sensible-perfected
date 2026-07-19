const fs = require('fs');
const path = require('path');
const https = require('https');

const MODRINTH_API = 'https://api.modrinth.com/v2';

const TARGET_VERSIONS = [
  '1.21.1',
  '1.21.2',
  '1.21.3',
  '1.21.4',
  '1.21.5',
  '1.21.6',
  '1.21.7',
  '1.21.8',
  '1.21.9',
  '1.21.10',
  '1.21.11',
  '26.1',
  '26.1.1',
  '26.1.2',
  '26.2',
];

const DELAY_MS = 300;
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function modrinthFetch(urlPath) {
  return new Promise((resolve, reject) => {
    const url = MODRINTH_API + urlPath;
    const headers = {
      'User-Agent': 'sensible-perfected/1.0 (github.com/Vicenthresh/sensible-perfected)',
    };

    https.get(url, { headers }, (res) => {
      if (res.statusCode === 429) {
        const retryAfter = parseInt(res.headers['retry-after'] || '5', 10);
        reject({ retryAfter, status: 429 });
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${urlPath}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(urlPath) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await modrinthFetch(urlPath);
    } catch (err) {
      if (err.retryAfter) {
        console.error(`  Rate limited, waiting ${err.retryAfter}s...`);
        await sleep(err.retryAfter * 1000);
        continue;
      }
      if (attempt < MAX_RETRIES - 1) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
}

function extractProjectId(url) {
  const match = url.match(/modrinth\.com\/mod\/([^/\s]+)/);
  return match ? match[1] : null;
}

async function getSupportedVersions(projectId) {
  const versions = await fetchWithRetry(`/project/${projectId}/version`);

  const gameVersions = new Set();
  for (const v of versions) {
    for (const gv of v.game_versions) {
      gameVersions.add(gv);
    }
    // Also check latest on loaders
    for (const loader of v.loaders) {
      for (const gv of v.game_versions) {
        gameVersions.add(gv);
      }
    }
  }
  return gameVersions;
}

async function main() {
  const modlistPath = path.resolve(__dirname, '..', 'modlist.json');
  const mods = JSON.parse(fs.readFileSync(modlistPath, 'utf-8'));

  const targetSet = new Set(TARGET_VERSIONS);
  const results = [];
  const errors = [];

  console.log(`Checking ${mods.length} mods against ${TARGET_VERSIONS.length} target versions...\n`);

  for (let i = 0; i < mods.length; i++) {
    const mod = mods[i];
    const projectId = extractProjectId(mod.url);

    if (!projectId) {
      console.error(`[${i + 1}/${mods.length}] ${mod.name}: could not extract project ID from ${mod.url}`);
      errors.push({ name: mod.name, error: 'Invalid URL' });
      results.push({
        name: mod.name,
        url: mod.url,
        currentVersion: mod.version,
        supported: [],
        unsupported: TARGET_VERSIONS.slice(),
        error: 'Invalid URL',
      });
      continue;
    }

    process.stdout.write(`[${i + 1}/${mods.length}] ${mod.name}... `);

    try {
      const supportedSet = await getSupportedVersions(projectId);

      const supported = TARGET_VERSIONS.filter((v) => supportedSet.has(v));
      const unsupported = TARGET_VERSIONS.filter((v) => !supportedSet.has(v));

      const status = supported.length === 0 ? 'NONE'
        : unsupported.length === 0 ? 'ALL'
        : 'PARTIAL';

      console.log(status);
      results.push({
        name: mod.name,
        url: mod.url,
        currentVersion: mod.version,
        supported,
        unsupported,
        status,
      });
    } catch (err) {
      console.log('ERROR');
      errors.push({ name: mod.name, error: err.message });
      results.push({
        name: mod.name,
        url: mod.url,
        currentVersion: mod.version,
        supported: [],
        unsupported: TARGET_VERSIONS.slice(),
        error: err.message,
        status: 'ERROR',
      });
    }

    await sleep(DELAY_MS);
  }

  const outDir = path.resolve(__dirname, '..', 'reports');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = path.join(outDir, `version-check-${timestamp}.json`);
  const csvPath = path.join(outDir, 'version-check-latest.csv');

  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\nJSON report saved: ${jsonPath}`);

  // --- Summary ---
  const allSupported = results.filter((r) => r.status === 'ALL').length;
  const partial = results.filter((r) => r.status === 'PARTIAL').length;
  const none = results.filter((r) => r.status === 'NONE').length;
  const errored = errors.length;
  const hasAny26 = results.filter((r) => r.supported.some((v) => v.startsWith('26'))).length;
  const no26 = results.length - hasAny26;

  console.log('\n--- Summary ---');
  console.log(`Total mods:      ${mods.length}`);
  console.log(`All supported:   ${allSupported}`);
  console.log(`Partial:         ${partial}`);
  console.log(`None supported:  ${none}`);
  console.log(`Errors:          ${errored}`);
  console.log(`Has 26.x:        ${hasAny26}`);
  console.log(`No 26.x:         ${no26}`);

  if (errors.length > 0) {
    console.log('\n--- Errors ---');
    for (const e of errors) {
      console.log(`  ${e.name}: ${e.error}`);
    }
  }

  // --- Markdown generation ---
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const mdLines = [];

  mdLines.push('# Mod Version Compatibility Report');
  mdLines.push('');
  mdLines.push(`**Generated:** ${now} UTC`);
  mdLines.push(`**Target Minecraft versions:** ${TARGET_VERSIONS.join(', ')}`);
  mdLines.push('');

  mdLines.push('## Summary');
  mdLines.push('');
  mdLines.push('| | Count |');
  mdLines.push('|---|---|');
  mdLines.push(`| Total mods | ${mods.length} |`);
  mdLines.push(`| ✅ All versions supported | ${allSupported} |`);
  mdLines.push(`| ⚠️ Partial support | ${partial} |`);
  mdLines.push(`| ❌ No target support | ${none} |`);
  mdLines.push(`| 🔴 Errors | ${errored} |`);
  mdLines.push(`| 🔷 Has 26.x support | ${hasAny26} |`);
  mdLines.push(`| 🔶 No 26.x support | ${no26} |`);
  mdLines.push('');

  mdLines.push('## Legend');
  mdLines.push('');
  mdLines.push('| Symbol | Meaning |');
  mdLines.push('|---|---|');
  mdLines.push('| ✅ | Mod supports this MC version |');
  mdLines.push('| ❌ | Mod does **not** support this MC version |');
  mdLines.push('| ⚠️ PARTIAL | Some target versions missing |');
  mdLines.push('| 🟢 ALL | All target versions supported |');
  mdLines.push('| 🔴 NONE | No target versions supported |');
  mdLines.push('');

  // --- Version ranking ---
  const versionCounts = TARGET_VERSIONS.map((v) => {
    const count = results.filter((r) => r.supported.includes(v)).length;
    const pct = ((count / results.length) * 100).toFixed(1);
    return { version: v, count, pct };
  });
  versionCounts.sort((a, b) => b.count - a.count);

  mdLines.push('## Version Adoption Ranking');
  mdLines.push('');
  mdLines.push('| Rank | MC Version | Mods Supported | Coverage |');
  mdLines.push('|---|---|---|---|');
  versionCounts.forEach((vc, i) => {
    mdLines.push(`| ${i + 1} | ${vc.version} | ${vc.count} / ${results.length} | ${vc.pct}% |`);
  });
  mdLines.push('');

  mdLines.push('## Mod Compatibility Matrix');
  mdLines.push('');

  const headerCells = ['Mod', 'Status', ...TARGET_VERSIONS.map((v) => v)];
  const sepCells = headerCells.map(() => '---');
  mdLines.push('| ' + headerCells.join(' | ') + ' |');
  mdLines.push('|' + sepCells.join('|') + '|');

  for (const r of results) {
    const modLink = `[${escapeMd(r.name)}](${r.url})`;
    const statusEmoji = r.error ? '🔴 ERROR'
      : r.status === 'ALL' ? '🟢 ALL'
      : r.status === 'NONE' ? '🔴 NONE'
      : '⚠️ PARTIAL';
    const cells = [modLink, statusEmoji];
    for (const v of TARGET_VERSIONS) {
      cells.push(r.supported.includes(v) ? '✅' : '❌');
    }
    mdLines.push('| ' + cells.join(' | ') + ' |');
  }

  const mdPath = path.join(outDir, 'version-check-latest.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'));
  console.log(`MD report saved:  ${mdPath}`);

  // --- CSV generation ---
  const csvLines = [];
  csvLines.push(['Mod Name', 'Modrinth URL', 'Current Version', 'Status', ...TARGET_VERSIONS.map((v) => `MC ${v}`)].join(','));

  for (const r of results) {
    const row = [
      `"${r.name.replace(/"/g, '""')}"`,
      r.url,
      `"${r.currentVersion}"`,
      r.error ? 'ERROR' : r.status,
      ...TARGET_VERSIONS.map((v) => (r.supported.includes(v) ? '✓' : '✗')),
    ];
    csvLines.push(row.join(','));
  }

  fs.writeFileSync(csvPath, '\ufeff' + csvLines.join('\n'));
  console.log(`CSV report saved: ${csvPath}`);

  // Also save latest as non-timestamped
  const latestJsonPath = path.join(outDir, 'version-check-latest.json');
  fs.writeFileSync(latestJsonPath, JSON.stringify(results, null, 2));
}

function escapeMd(text) {
  return text.replace(/[|\\`*_{}[\]()#+\-.!<>]/g, '\\$&');
}

main().catch(console.error);
