/**
 * Applies gender overrides from scripts/.cache/gender-overrides.json to all template files.
 *
 * Workflow:
 *   1. Edit scripts/.cache/gender-review.json — change "unknown" to "male" or "female"
 *   2. Run: npx tsx scripts/apply-genders.ts
 *      This reads gender-review.json, extracts overrides, saves them to gender-overrides.json,
 *      and updates all template JSON files in-place.
 *
 * You can also directly edit gender-overrides.json (format: { "charId": "male"|"female" })
 * and run this script.
 */

import * as fs from "fs";
import * as path from "path";

interface ReviewEntry {
  id: number;
  name: string;
  anime: string;
  gender: string;
}

interface TemplateCharacter {
  id: number;
  name: string;
  image: string;
  anime: string;
  gender: string;
  tags: string[];
}

interface TemplateFile {
  name: string;
  characters: TemplateCharacter[];
}

const CACHE_DIR = path.resolve(__dirname, ".cache");
const TEMPLATES_DIR = path.resolve(__dirname, "../frontend/src/data/templates");

function main() {
  // Build gender map from review file
  const reviewPath = path.join(CACHE_DIR, "gender-review.json");
  const overridesPath = path.join(CACHE_DIR, "gender-overrides.json");

  const genderMap = new Map<number, string>();

  // Load from review file (takes priority since it's what the user edits)
  if (fs.existsSync(reviewPath)) {
    const review: ReviewEntry[] = JSON.parse(fs.readFileSync(reviewPath, "utf-8"));
    for (const entry of review) {
      if (entry.gender !== "unknown") {
        genderMap.set(entry.id, entry.gender);
      }
    }
    console.log(`Loaded ${genderMap.size} gender assignments from gender-review.json`);
  }

  // Also load from overrides file (merged in, review takes priority)
  if (fs.existsSync(overridesPath)) {
    const overrides: Record<string, string> = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
    let added = 0;
    for (const [k, v] of Object.entries(overrides)) {
      if (!genderMap.has(Number(k))) {
        genderMap.set(Number(k), v);
        added++;
      }
    }
    if (added > 0) console.log(`Added ${added} from gender-overrides.json`);
  }

  // Save consolidated overrides
  const consolidated: Record<string, string> = {};
  for (const [k, v] of genderMap) consolidated[String(k)] = v;
  fs.writeFileSync(overridesPath, JSON.stringify(consolidated, null, 2));

  // Apply to all template files
  const templateFiles = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".json"));
  let updated = 0;
  let totalChars = 0;
  let assigned = 0;

  for (const file of templateFiles) {
    const filepath = path.join(TEMPLATES_DIR, file);
    const template: TemplateFile = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    let changed = false;

    for (const char of template.characters) {
      totalChars++;
      const gender = genderMap.get(char.id);
      if (gender && gender !== char.gender) {
        char.gender = gender as "male" | "female" | "unknown";
        // Update tags
        char.tags = char.tags.filter((t) => t !== "male" && t !== "female" && t !== "unknown");
        char.tags.unshift(gender);
        changed = true;
      }
      if (char.gender !== "unknown") assigned++;
    }

    if (changed) {
      fs.writeFileSync(filepath, JSON.stringify(template, null, 2));
      updated++;
    }
  }

  console.log(`\nUpdated ${updated}/${templateFiles.length} template files`);
  console.log(`${assigned}/${totalChars} characters have gender assigned`);
  console.log(`${totalChars - assigned} still unknown`);
}

main();
