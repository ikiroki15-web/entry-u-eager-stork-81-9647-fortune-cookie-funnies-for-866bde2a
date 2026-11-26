// Fortune Cookie Funnies for Engineers — entry program.
//
// The competition asks for one fortune cookie message for a software
// engineer, at most 120 characters, as a single line. This program is
// the entry: it reads the fortune shipped beside it in fortune.txt,
// checks it against the gate (one line, 1-120 characters, not only
// whitespace) and writes it verbatim to /output/entry.txt, where the
// sealed scorer reads it.
//
// The fortune itself lives in fortune.txt so the message stays plain
// text and the program stays the thing that delivers it. Nothing here
// touches the network, the environment or any file outside this repo.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The gate counts characters, so count Unicode code points rather
// than UTF-16 code units: an emoji or accented letter is one char.
function charCount(text) {
  return [...text].length;
}

// The fortune file ships with the repo. It holds exactly one line.
// Split it into lines, drop the empty lines that only come from the
// file's trailing newline, and refuse a file that holds more than
// one line: the entry is one fortune, not a list of them.
function readFortune() {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, "fortune.txt"), "utf8");
  // Strip a leading byte-order mark so an editor-saved file still
  // yields exactly the fortune line, with no invisible first char.
  const cleaned = raw.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new Error("fortune.txt holds no line");
  }
  if (lines.length > 1) {
    throw new Error(`fortune.txt holds ${lines.length} lines, expected one`);
  }
  return lines[0];
}

// The gate, restated: 1 to 120 characters, a single line, and more
// than whitespace. Fail loudly instead of writing a bad entry.
function validateFortune(fortune) {
  if (fortune.length === 0) {
    throw new Error("fortune is empty");
  }
  if (/\r|\n/.test(fortune)) {
    throw new Error("fortune must be a single line");
  }
  if (fortune.trim().length === 0) {
    throw new Error("fortune must not be only whitespace");
  }
  const count = charCount(fortune);
  if (count > 120) {
    throw new Error(`fortune is ${count} characters, over the 120 limit`);
  }
  return count;
}

function writeEntry(fortune) {
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fortune, "utf8");
}

function printUsage() {
  console.log(
    "Usage: node main.ts [--help]\n" +
      "\n" +
      "Reads the one-line fortune from fortune.txt (1-120 characters),\n" +
      "validates it against the competition gate and writes it verbatim\n" +
      "to /output/entry.txt.",
  );
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }
  const fortune = readFortune();
  const count = validateFortune(fortune);
  writeEntry(fortune);
  console.log(`wrote ${count}-character fortune to /output/entry.txt`);
}

main();
