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

function overlay(a, b) {
  const out = new PNG({ width: a.width, height: a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    out.data[i] = Math.round(a.data[i] * 0.5 + b.data[i] * 0.5);
    out.data[i + 1] = Math.round(a.data[i + 1] * 0.5 + b.data[i + 1] * 0.5);
    out.data[i + 2] = Math.round(a.data[i + 2] * 0.5 + b.data[i + 2] * 0.5);
    out.data[i + 3] = 255;
  }
  return out;
}

function channelOverlay(figma, local) {
  const out = new PNG({ width: figma.width, height: figma.height });
  for (let i = 0; i < figma.data.length; i += 4) {
    const f = Math.round(figma.data[i] * 0.299 + figma.data[i + 1] * 0.587 + figma.data[i + 2] * 0.114);
    const l = Math.round(local.data[i] * 0.299 + local.data[i + 1] * 0.587 + local.data[i + 2] * 0.114);
    out.data[i] = f;
    out.data[i + 1] = Math.min(f, l);
    out.data[i + 2] = l;
    out.data[i + 3] = 255;
  }
  return out;
}

function diffStats(a, b, threshold = 32) {
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

const figma = readPng('__tests__/figma_mobile_full_360.png');
const local = readPng('__tests__/mobile_360_localhost_converted.png');

const figmaTop = crop(figma, 0, 0, 360, 726);
const localTop = crop(local, 0, 0, 360, 726);
const figmaTopnav = crop(figma, 0, 0, 360, 72);
const localTopnav = crop(local, 0, 0, 360, 72);
const figmaHero = crop(figma, 0, 72, 360, 654);
const localHero = crop(local, 0, 72, 360, 654);

writePng('__tests__/figma_mobile_top_360x726.png', figmaTop);
writePng('__tests__/local_mobile_top_360x726.png', localTop);
writePng('__tests__/figma_mobile_topnav_360.png', figmaTopnav);
writePng('__tests__/local_mobile_topnav_360.png', localTopnav);
writePng('__tests__/figma_mobile_hero_360x654.png', figmaHero);
writePng('__tests__/local_mobile_hero_360x654.png', localHero);
writePng('__tests__/overlay_mobile_top_360x726.png', overlay(figmaTop, localTop));
writePng('__tests__/overlay_mobile_topnav_360.png', overlay(figmaTopnav, localTopnav));
writePng('__tests__/overlay_mobile_hero_360x654.png', overlay(figmaHero, localHero));
writePng('__tests__/channel_overlay_mobile_top_360x726.png', channelOverlay(figmaTop, localTop));
writePng('__tests__/channel_overlay_mobile_topnav_360.png', channelOverlay(figmaTopnav, localTopnav));
writePng('__tests__/channel_overlay_mobile_hero_360x654.png', channelOverlay(figmaHero, localHero));

const top = diffStats(figmaTop, localTop);
const topnav = diffStats(figmaTopnav, localTopnav);
const hero = diffStats(figmaHero, localHero);

writePng('__tests__/diff_mobile_top_360x726.png', top.diff);
writePng('__tests__/diff_mobile_topnav_360.png', topnav.diff);
writePng('__tests__/diff_mobile_hero_360x654.png', hero.diff);

console.log(JSON.stringify({
  figma: { width: figma.width, height: figma.height },
  local: { width: local.width, height: local.height },
  top: {
    changed: top.changed,
    pixels: top.pixels,
    changedRatio: top.changedRatio,
    averageChannelDelta: top.averageChannelDelta,
    maxDelta: top.maxDelta,
  },
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
}, null, 2));
