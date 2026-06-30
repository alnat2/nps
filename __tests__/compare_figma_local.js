const fs = require('fs');
const path = require('path');
const { PNG } = require('/Users/cross/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');

const root = path.resolve(__dirname, '..');

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(path.join(root, file)));
}

function writePng(file, png) {
  fs.writeFileSync(path.join(root, file), PNG.sync.write(png));
}

function crop(src, x, y, width, height) {
  const out = new PNG({ width, height });
  PNG.bitblt(src, out, x, y, width, height, 0, 0);
  return out;
}

function diffStats(a, b, threshold = 32) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`Size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }

  let changed = 0;
  let totalDelta = 0;
  let maxDelta = 0;
  const diff = new PNG({ width: a.width, height: a.height });

  for (let i = 0; i < a.data.length; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    const da = Math.abs(a.data[i + 3] - b.data[i + 3]);
    const delta = dr + dg + db + da;
    totalDelta += delta;
    maxDelta = Math.max(maxDelta, delta);

    if (delta > threshold) {
      changed += 1;
      diff.data[i] = 255;
      diff.data[i + 1] = 0;
      diff.data[i + 2] = 80;
      diff.data[i + 3] = 255;
    } else {
      diff.data[i] = Math.round(a.data[i] * 0.25);
      diff.data[i + 1] = Math.round(a.data[i + 1] * 0.25);
      diff.data[i + 2] = Math.round(a.data[i + 2] * 0.25);
      diff.data[i + 3] = 255;
    }
  }

  return {
    changed,
    pixels: a.width * a.height,
    changedRatio: changed / (a.width * a.height),
    averageChannelDelta: totalDelta / a.data.length,
    maxDelta,
    diff,
  };
}

function overlay(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`Size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }

  const out = new PNG({ width: a.width, height: a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    out.data[i] = Math.round(a.data[i] * 0.5 + b.data[i] * 0.5);
    out.data[i + 1] = Math.round(a.data[i + 1] * 0.5 + b.data[i + 1] * 0.5);
    out.data[i + 2] = Math.round(a.data[i + 2] * 0.5 + b.data[i + 2] * 0.5);
    out.data[i + 3] = 255;
  }
  return out;
}

function channelOverlay(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`Size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }

  const out = new PNG({ width: a.width, height: a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    const figmaLuma = Math.round(a.data[i] * 0.299 + a.data[i + 1] * 0.587 + a.data[i + 2] * 0.114);
    const localLuma = Math.round(b.data[i] * 0.299 + b.data[i + 1] * 0.587 + b.data[i + 2] * 0.114);
    out.data[i] = figmaLuma;
    out.data[i + 1] = Math.min(figmaLuma, localLuma);
    out.data[i + 2] = localLuma;
    out.data[i + 3] = 255;
  }
  return out;
}

const local = readPng('__tests__/desktop_1440_localhost_converted.png');
const figmaFull = readPng('__tests__/figma_desktop_full_1440.png');
const figmaTopnav = readPng('__tests__/figma_topnav_1440.png');
const figmaHero = readPng('__tests__/figma_hero_wrap_1440.png');

const localTopnav = crop(local, 0, 0, 1440, 72);
const localHero = crop(local, 0, 72, 1440, 618);
const localTop = crop(local, 0, 0, 1440, 690);
const figmaTop = crop(figmaFull, 0, 0, 1440, 690);

writePng('__tests__/local_topnav_1440.png', localTopnav);
writePng('__tests__/local_hero_wrap_1440.png', localHero);
writePng('__tests__/figma_top_1440x690.png', figmaTop);
writePng('__tests__/local_top_1440x690.png', localTop);
writePng('__tests__/overlay_topnav_1440.png', overlay(figmaTopnav, localTopnav));
writePng('__tests__/overlay_hero_wrap_1440.png', overlay(figmaHero, localHero));
writePng('__tests__/channel_overlay_topnav_1440.png', channelOverlay(figmaTopnav, localTopnav));
writePng('__tests__/channel_overlay_hero_wrap_1440.png', channelOverlay(figmaHero, localHero));
writePng('__tests__/overlay_top_1440x690.png', overlay(figmaTop, localTop));
writePng('__tests__/channel_overlay_top_1440x690.png', channelOverlay(figmaTop, localTop));

const topnav = diffStats(figmaTopnav, localTopnav);
const hero = diffStats(figmaHero, localHero);
const top = diffStats(figmaTop, localTop);

writePng('__tests__/diff_topnav_1440.png', topnav.diff);
writePng('__tests__/diff_hero_wrap_1440.png', hero.diff);

console.log(JSON.stringify({
  local: { width: local.width, height: local.height },
  figmaTopnav: { width: figmaTopnav.width, height: figmaTopnav.height },
  figmaHero: { width: figmaHero.width, height: figmaHero.height },
  figmaTop: { width: figmaTop.width, height: figmaTop.height },
  topnav: {
    changed: topnav.changed,
    pixels: topnav.pixels,
    changedRatio: topnav.changedRatio,
    averageChannelDelta: topnav.averageChannelDelta,
    maxDelta: topnav.maxDelta,
  },
  hero: {
    changed: hero.changed,
    pixels: hero.pixels,
    changedRatio: hero.changedRatio,
    averageChannelDelta: hero.averageChannelDelta,
    maxDelta: hero.maxDelta,
  },
  top: {
    changed: top.changed,
    pixels: top.pixels,
    changedRatio: top.changedRatio,
    averageChannelDelta: top.averageChannelDelta,
    maxDelta: top.maxDelta,
  },
}, null, 2));
