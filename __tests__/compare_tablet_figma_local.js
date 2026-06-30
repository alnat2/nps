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

const figma = readPng('__tests__/figma_tablet_800x610.png');
const local = readPng('__tests__/tablet_800x610_local.png');

if (figma.width !== local.width || figma.height !== local.height) {
  throw new Error(`Size mismatch ${figma.width}x${figma.height} vs ${local.width}x${local.height}`);
}

writePng('__tests__/overlay_tablet_800x610.png', overlay(figma, local));
writePng('__tests__/channel_overlay_tablet_800x610.png', channelOverlay(figma, local));

const full = diffStats(figma, local);
writePng('__tests__/diff_tablet_800x610.png', full.diff);

console.log(JSON.stringify({
  figma: { width: figma.width, height: figma.height },
  local: { width: local.width, height: local.height },
  full: {
    changed: full.changed,
    pixels: full.pixels,
    changedRatio: full.changedRatio,
    averageChannelDelta: full.averageChannelDelta,
    maxDelta: full.maxDelta,
  },
}, null, 2));
