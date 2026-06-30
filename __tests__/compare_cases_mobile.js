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

const figma = readPng('__tests__/figma_cases_mobile_360x968.png');
const full = readPng('__tests__/cases_mobile_fullpage.png');
const local = crop(full, 0, 726, 360, 968);
const stats = diffStats(figma, local);

writePng('__tests__/cases_mobile_local_crop.png', local);
writePng('__tests__/cases_mobile_overlay.png', overlay(figma, local));
writePng('__tests__/cases_mobile_diff.png', stats.diff);

const report = [
  `average_channel_delta=${stats.averageChannelDelta.toFixed(2)}`,
  `changed_pixels=${stats.changed}`,
  `total_pixels=${stats.pixels}`,
  `changed_percent=${(stats.changedRatio * 100).toFixed(2)}`,
  `max_delta=${stats.maxDelta}`,
].join('\n');

fs.writeFileSync(path.join(root, '__tests__/cases_mobile_diff_metrics.txt'), `${report}\n`);
console.log(report);
