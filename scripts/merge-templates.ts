import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.resolve(
  __dirname,
  "../frontend/src/data/templates"
);

interface Character {
  id: number;
  name: string;
  image: string;
  anime: string;
}

interface Template {
  name: string;
  characters: Character[];
}

// --- Franchise merge definitions ---
// Each entry: [outputFileName, displayName, matchFn]
const FRANCHISE_GROUPS: [string, string, (filename: string) => boolean][] = [
  [
    "jojo.json",
    "JoJo's Bizarre Adventure",
    (f) => f.startsWith("jojo-s-bizarre-adventure"),
  ],
  ["fate.json", "Fate Series", (f) => f.startsWith("fate-")],
  [
    "evangelion.json",
    "Evangelion",
    (f) => f.startsWith("evangelion-") || f.startsWith("neon-genesis-evangelion"),
  ],
  [
    "rascal.json",
    "Rascal Does Not Dream",
    (f) => f.startsWith("rascal-does-not-dream"),
  ],
  ["kaguya.json", "Kaguya-sama", (f) => f.startsWith("kaguya-sama")],
  ["k-on.json", "K-ON!", (f) => f.startsWith("k-on")],
  ["umamusume.json", "Umamusume", (f) => f.startsWith("umamusume")],
];

// Files to never touch
const PROTECTED_FILES = new Set(["re-zero.json"]);

function readTemplate(filePath: string): Template {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function dedupeCharacters(characters: Character[]): Character[] {
  const seen = new Map<number, Character>();
  for (const c of characters) {
    if (!seen.has(c.id)) {
      seen.set(c.id, c);
    }
  }
  return Array.from(seen.values());
}

function main() {
  const allFiles = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json"));

  // Track which files get consumed by a merge
  const mergedFiles = new Set<string>();

  // --- Step 1: Merge franchise groups ---
  for (const [outputFile, displayName, matchFn] of FRANCHISE_GROUPS) {
    const matchingFiles = allFiles.filter((f) => {
      const base = f.replace(/\.json$/, "");
      return matchFn(base) && !PROTECTED_FILES.has(f);
    });

    if (matchingFiles.length === 0) continue;

    let allChars: Character[] = [];
    for (const file of matchingFiles) {
      const tpl = readTemplate(path.join(TEMPLATES_DIR, file));
      allChars.push(...tpl.characters);
      mergedFiles.add(file);
    }

    const deduped = dedupeCharacters(allChars);
    const merged: Template = { name: displayName, characters: deduped };

    const outputPath = path.join(TEMPLATES_DIR, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2) + "\n");
    console.log(
      `Created ${outputFile}: ${deduped.length} characters (from ${matchingFiles.length} files: ${matchingFiles.join(", ")})`
    );
  }

  // --- Step 2: Delete merged source files (that differ from the output) ---
  for (const file of mergedFiles) {
    // Don't delete if the file is also an output file (e.g. k-on.json is both source and output)
    const isOutput = FRANCHISE_GROUPS.some(([out]) => out === file);
    if (isOutput) {
      // It was already overwritten in step 1, so nothing to delete
      continue;
    }
    const filePath = path.join(TEMPLATES_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted merged source: ${file}`);
    }
  }

  // --- Step 3: Delete small standalone files (<5 characters, not protected, not a merge output) ---
  const mergeOutputFiles = new Set(FRANCHISE_GROUPS.map(([out]) => out));
  const remainingFiles = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json"));

  for (const file of remainingFiles) {
    if (PROTECTED_FILES.has(file)) continue;
    if (mergeOutputFiles.has(file)) continue;

    const tpl = readTemplate(path.join(TEMPLATES_DIR, file));
    if (tpl.characters.length < 5) {
      fs.unlinkSync(path.join(TEMPLATES_DIR, file));
      console.log(
        `Deleted small standalone: ${file} (${tpl.characters.length} characters)`
      );
    }
  }

  // --- Step 4: Create mix.json from ALL remaining templates ---
  const finalFiles = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json") && f !== "mix.json");

  let mixChars: Character[] = [];
  for (const file of finalFiles) {
    const tpl = readTemplate(path.join(TEMPLATES_DIR, file));
    mixChars.push(...tpl.characters);
  }

  const dedupedMix = dedupeCharacters(mixChars);
  const mixTemplate: Template = { name: "Mix", characters: dedupedMix };
  const mixPath = path.join(TEMPLATES_DIR, "mix.json");
  fs.writeFileSync(mixPath, JSON.stringify(mixTemplate, null, 2) + "\n");
  console.log(
    `\nCreated mix.json: ${dedupedMix.length} characters (from ${finalFiles.length} templates)`
  );

  // --- Summary ---
  console.log("\n--- Final templates ---");
  const allFinal = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  for (const file of allFinal) {
    const tpl = readTemplate(path.join(TEMPLATES_DIR, file));
    console.log(`  ${file}: ${tpl.characters.length} characters`);
  }
}

main();
