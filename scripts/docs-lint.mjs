#!/usr/bin/env node
// Documentation check for Zelva.
//
// Verifies three things across every Markdown document in the repository:
//   1. Every identifier is defined exactly once.
//   2. Every identifier cited anywhere has a definition.
//   3. Every relative link between documents resolves to a file.
//
// Usage: node scripts/docs-lint.mjs

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDocuments = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
];

// Where identifiers may be defined.
const isDefinitionFile = (path) =>
  path.startsWith("docs/decisions/") || path.startsWith("docs/prd/");

// Research notes are snapshots written before any identifier existed, so
// they are not held to the security and privacy identifiers they mention.
// Decision identifiers are checked everywhere, including there.
const kindsCheckedIn = (path) =>
  path.startsWith("docs/research/") ? ["DEC"] : ["DEC", "SEC", "PRIV", "FR", "NFR", "EV"];

const IDENTIFIER = /\b(DEC|SEC|PRIV|FR|NFR|EV)-(?:[A-Z]{1,6}-)?(\d{1,3})\b/g;
const LINK = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith(".md")) {
      out.push(relative(root, full));
    }
  }
  return out;
}

function markdownFiles() {
  const files = rootDocuments.filter((f) => existsSync(join(root, f)));
  return [...files, ...walk(join(root, "docs"))].sort();
}

function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function lineNumber(starts, index) {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= index) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

// An identifier is defined where it is the first cell of a table row, or the
// first thing in a heading or a list item.
function definitionsIn(text) {
  const found = [];
  for (const line of text.split("\n")) {
    const match = line.match(
      /^\s*(?:\|\s*|#{1,6}\s+|[-*]\s+(?:\*\*)?|\d+\.\s+)((?:DEC|SEC|PRIV|FR|NFR|EV)-(?:[A-Z]{1,6}-)?\d{1,3})\b/,
    );
    if (match) found.push(match[1]);
  }
  return found;
}

function citationsIn(text, kinds) {
  const found = [];
  for (const match of text.matchAll(IDENTIFIER)) {
    if (kinds.includes(match[1])) found.push({ id: match[0], index: match.index });
  }
  return found;
}

const errors = [];
const documents = markdownFiles();
const defined = new Map();
const content = new Map();

for (const path of documents) {
  const text = readFileSync(join(root, path), "utf8");
  content.set(path, text);

  if (!isDefinitionFile(path)) continue;
  const starts = lineStarts(text);
  for (const id of definitionsIn(text)) {
    const at = text.indexOf(id);
    if (defined.has(id)) {
      errors.push(`${path}:${lineNumber(starts, at)}: ${id} is defined again. It was first defined in ${defined.get(id).path}`);
    } else {
      defined.set(id, { path, line: lineNumber(starts, at) });
    }
  }
}

for (const [path, text] of content) {
  const starts = lineStarts(text);
  for (const { id, index } of citationsIn(text, kindsCheckedIn(path))) {
    if (!defined.has(id)) {
      errors.push(`${path}:${lineNumber(starts, index)}: ${id} is cited but never defined`);
    }
  }

  for (const match of text.matchAll(LINK)) {
    const target = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue;
    const filePart = decodeURIComponent(target.split("#")[0]);
    if (filePart === "") continue;
    const resolved = relative(root, resolve(dirname(join(root, path)), filePart));
    if (resolved.startsWith("..")) {
      errors.push(`${path}:${lineNumber(starts, match.index)}: link to '${target}' leaves the repository`);
    } else if (!existsSync(join(root, resolved))) {
      errors.push(`${path}:${lineNumber(starts, match.index)}: link to '${target}' does not resolve`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Documentation check failed with ${errors.length} problem${errors.length === 1 ? "" : "s"}:\n`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `Documentation check passed: ${documents.length} documents, ${defined.size} identifiers defined.`,
);
