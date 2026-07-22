#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_TOKEN_FILE = 'utils/content/token.json';
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '__tests__',
]);

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    tokenFile: DEFAULT_TOKEN_FILE,
    check: false,
    help: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--check') {
      args.check = true;
    } else if (arg === '--root') {
      if (!argv[index + 1]) {
        throw new Error('--root requires a value');
      }
      args.root = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === '--token-file') {
      if (!argv[index + 1]) {
        throw new Error('--token-file requires a value');
      }
      args.tokenFile = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printUsage() {
  console.log(`Usage: node scripts/sync-html.js [options]

Options:
  --check                 Report changes without writing files.
  --root <path>           Project root. Defaults to current working directory.
  --token-file <path>     Token JSON path relative to root.
                           Defaults to ${DEFAULT_TOKEN_FILE}.
  -h, --help              Show this help.
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isStringToken(value) {
  return (
    value &&
    typeof value === 'object' &&
    value.$type === 'string' &&
    typeof value.$value === 'string'
  );
}

function flattenTokens(value, prefix = []) {
  if (isStringToken(value)) {
    return [[prefix.join('/'), value.$value]];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => flattenTokens(child, [...prefix, key]));
}

function buildTokenMap(tokenJson) {
  const syncConfig = tokenJson['nps-content-sync'];
  const syncedCollections = Array.isArray(syncConfig && syncConfig.syncedCollections)
    ? syncConfig.syncedCollections
    : [];

  const tokenMap = new Map();

  for (const collection of syncedCollections) {
    const collectionValue = tokenJson[collection];
    if (!collectionValue) {
      continue;
    }

    for (const [tokenPath, tokenValue] of flattenTokens(collectionValue, [collection])) {
      tokenMap.set(tokenPath, tokenValue);
    }
  }

  return { tokenMap, syncedCollections };
}

function findHtmlFiles(rootDir) {
  const files = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          walk(path.join(currentDir, entry.name));
        }
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(path.join(currentDir, entry.name));
      }
    }
  }

  walk(rootDir);
  return files.sort();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getAttr(openTag, attrName) {
  const pattern = new RegExp(
    `\\s${escapeRegExp(attrName)}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`,
    'i',
  );
  const match = openTag.match(pattern);
  if (!match) {
    return null;
  }

  if (match[1] !== undefined) return match[1];
  if (match[2] !== undefined) return match[2];
  if (match[3] !== undefined) return match[3];
  return '';
}

function hasAttr(openTag, attrName) {
  return getAttr(openTag, attrName) !== null;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findClosingTag(html, tagName, fromIndex) {
  const tagPattern = new RegExp(`<\\/?${escapeRegExp(tagName)}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = fromIndex;

  let depth = 1;
  let match;

  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    if (/^<\//.test(tag)) {
      depth -= 1;
      if (depth === 0) {
        return {
          start: match.index,
          end: tagPattern.lastIndex,
          closeTag: tag,
        };
      }
    } else if (!/\/>$/.test(tag) && !VOID_TAGS.has(tagName.toLowerCase())) {
      depth += 1;
    }
  }

  return null;
}

function splitByBr(innerHtml) {
  const brPattern = /<br\b[^>]*>/gi;
  const segments = [];
  const brTags = [];
  let lastIndex = 0;
  let match;

  while ((match = brPattern.exec(innerHtml))) {
    segments.push(innerHtml.slice(lastIndex, match.index));
    brTags.push(match[0]);
    lastIndex = brPattern.lastIndex;
  }

  segments.push(innerHtml.slice(lastIndex));
  return { segments, brTags };
}

function renderWithPreservedBreaks({
  filePath,
  innerHtml,
  tokenPath,
  tokenValue,
  report,
}) {
  const { segments, brTags } = splitByBr(innerHtml);
  const textSegments = tokenValue.split(/\r?\n/);

  if (textSegments.length !== segments.length) {
    report.structuralWarnings.push({
      filePath,
      tokenPath,
      message: `data-token-preserve-br needs ${segments.length} JSON lines, found ${textSegments.length}`,
    });
    return innerHtml;
  }

  let output = '';

  for (let index = 0; index < textSegments.length; index += 1) {
    output += escapeHtml(textSegments[index]);
    if (brTags[index]) {
      output += brTags[index];
    }
  }

  return output;
}

function parseBulletItems(tokenValue) {
  return tokenValue
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^•\s*/, '').trim())
    .filter(Boolean);
}

function indentForList(innerHtml) {
  const match = innerHtml.match(/\n([ \t]*)<li\b/i);
  return match ? match[1] : '  ';
}

function renderBulletList(innerHtml, tokenValue) {
  const itemIndent = indentForList(innerHtml);
  const closingIndent = itemIndent.length >= 2 ? itemIndent.slice(0, -2) : '';
  const items = parseBulletItems(tokenValue);

  if (items.length === 0) {
    return '';
  }

  return `\n${items
    .map((item) => `${itemIndent}<li>${escapeHtml(item)}</li>`)
    .join('\n')}\n${closingIndent}`;
}

function hasNestedMarkup(innerHtml) {
  return /<(?!br\b)[a-z][\s\S]*?>/i.test(innerHtml);
}

function replaceElementInner({
  filePath,
  tagName,
  openTag,
  innerHtml,
  tokenPath,
  tokenValue,
  report,
}) {
  const listMode = getAttr(openTag, 'data-token-list');
  const preserveBr = hasAttr(openTag, 'data-token-preserve-br');
  const hasBr = /<br\b/i.test(innerHtml);

  if (listMode) {
    if (listMode !== 'bullet') {
      report.structuralWarnings.push({
        filePath,
        tokenPath,
        message: `Unsupported data-token-list value: ${listMode}`,
      });
      return innerHtml;
    }

    if (!['ul', 'ol'].includes(tagName.toLowerCase())) {
      report.structuralWarnings.push({
        filePath,
        tokenPath,
        message: 'data-token-list="bullet" should be used on <ul> or <ol>',
      });
      return innerHtml;
    }

    return renderBulletList(innerHtml, tokenValue);
  }

  if (preserveBr) {
    return renderWithPreservedBreaks({
      filePath,
      innerHtml,
      tokenPath,
      tokenValue,
      report,
    });
  }

  if (hasBr) {
    report.structuralWarnings.push({
      filePath,
      tokenPath,
      message: 'Element contains <br>; add data-token-preserve-br to update it',
    });
    return innerHtml;
  }

  if (hasNestedMarkup(innerHtml)) {
    report.structuralWarnings.push({
      filePath,
      tokenPath,
      message: 'Element contains nested markup; move data-token to a text-only child',
    });
    return innerHtml;
  }

  return escapeHtml(tokenValue);
}

function processHtml(html, filePath, tokenMap, report) {
  const tokenOpenTagPattern = /<([a-z][\w:-]*)(?=[^>]*\sdata-token(?:\s|=|>))[^>]*>/gi;
  let output = '';
  let position = 0;
  let match;

  while ((match = tokenOpenTagPattern.exec(html))) {
    const [openTag, tagName] = match;
    const openStart = match.index;
    const openEnd = tokenOpenTagPattern.lastIndex;
    const tokenPath = getAttr(openTag, 'data-token');

    output += html.slice(position, openStart);

    if (!tokenPath) {
      report.structuralWarnings.push({
        filePath,
        tokenPath: '',
        message: 'data-token attribute is empty',
      });
      output += openTag;
      position = openEnd;
      continue;
    }

    report.tokenReferences += 1;
    report.usedTokenPaths.add(tokenPath);

    if (VOID_TAGS.has(tagName.toLowerCase())) {
      report.structuralWarnings.push({
        filePath,
        tokenPath,
        message: `data-token cannot be applied to void element <${tagName}>`,
      });
      output += openTag;
      position = openEnd;
      continue;
    }

    const closing = findClosingTag(html, tagName, openEnd);
    if (!closing) {
      report.structuralWarnings.push({
        filePath,
        tokenPath,
        message: `Missing closing tag for <${tagName}>`,
      });
      output += openTag;
      position = openEnd;
      continue;
    }

    if (!tokenMap.has(tokenPath)) {
      report.missingInJson.push({ filePath, tokenPath });
      output += html.slice(openStart, closing.end);
      position = closing.end;
      tokenOpenTagPattern.lastIndex = closing.end;
      continue;
    }

    const tokenValue = tokenMap.get(tokenPath);
    const innerHtml = html.slice(openEnd, closing.start);
    const nextInnerHtml = replaceElementInner({
      filePath,
      tagName,
      openTag,
      innerHtml,
      tokenPath,
      tokenValue,
      report,
    });

    if (nextInnerHtml === innerHtml) {
      report.unchanged += 1;
    } else {
      report.updated += 1;
    }

    output += openTag + nextInnerHtml + closing.closeTag;
    position = closing.end;
    tokenOpenTagPattern.lastIndex = closing.end;
  }

  output += html.slice(position);
  return output;
}

function formatRelative(rootDir, filePath) {
  return path.relative(rootDir, filePath) || '.';
}

function printReport(report, rootDir, tokenMap) {
  const unusedInHtml = [...tokenMap.keys()]
    .filter((tokenPath) => !report.usedTokenPaths.has(tokenPath))
    .sort();

  console.log(`Files processed: ${report.filesProcessed}`);
  console.log(`Files changed: ${report.filesChanged}`);
  console.log(`Token references: ${report.tokenReferences}`);
  console.log(`Updated: ${report.updated}`);
  console.log(`Unchanged: ${report.unchanged}`);
  console.log(`Missing in JSON: ${report.missingInJson.length}`);
  console.log(`Unused in HTML: ${unusedInHtml.length}`);
  console.log(`Structural warnings: ${report.structuralWarnings.length}`);

  if (report.missingInJson.length > 0) {
    console.log('\nMissing in JSON:');
    for (const item of report.missingInJson) {
      console.log(`- ${formatRelative(rootDir, item.filePath)}: ${item.tokenPath}`);
    }
  }

  if (report.structuralWarnings.length > 0) {
    console.log('\nStructural warnings:');
    for (const item of report.structuralWarnings) {
      const label = item.tokenPath ? `${item.tokenPath}: ` : '';
      console.log(`- ${formatRelative(rootDir, item.filePath)}: ${label}${item.message}`);
    }
  }

  if (unusedInHtml.length > 0) {
    console.log('\nUnused in HTML:');
    for (const tokenPath of unusedInHtml) {
      console.log(`- ${tokenPath}`);
    }
  }
}

function createReport() {
  return {
    filesProcessed: 0,
    filesChanged: 0,
    tokenReferences: 0,
    updated: 0,
    unchanged: 0,
    missingInJson: [],
    structuralWarnings: [],
    usedTokenPaths: new Set(),
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printUsage();
    return;
  }

  const rootDir = args.root;
  const tokenFile = path.resolve(rootDir, args.tokenFile);
  const tokenJson = readJson(tokenFile);
  const { tokenMap } = buildTokenMap(tokenJson);
  const htmlFiles = findHtmlFiles(rootDir);
  const report = createReport();
  const changedFiles = [];

  for (const filePath of htmlFiles) {
    report.filesProcessed += 1;
    const currentHtml = fs.readFileSync(filePath, 'utf8');
    const nextHtml = processHtml(currentHtml, filePath, tokenMap, report);

    if (nextHtml !== currentHtml) {
      report.filesChanged += 1;
      changedFiles.push(filePath);
      if (!args.check) {
        fs.writeFileSync(filePath, nextHtml);
      }
    }
  }

  printReport(report, rootDir, tokenMap);

  if (args.check) {
    const hasErrors =
      changedFiles.length > 0 ||
      report.missingInJson.length > 0 ||
      report.structuralWarnings.length > 0;
    process.exitCode = hasErrors ? 1 : 0;
  } else if (report.missingInJson.length > 0 || report.structuralWarnings.length > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('');
  printUsage();
  process.exitCode = 1;
}
