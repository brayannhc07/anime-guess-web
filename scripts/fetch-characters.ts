/**
 * Seed script: fetches characters from Jikan API for animes in animes-clean.json,
 * determines gender from character details, and outputs template JSON files.
 *
 * Usage: npx tsx scripts/fetch-characters.ts
 *
 * Two phases:
 *   Phase 1: Fetch character lists per anime (~121 requests)
 *   Phase 2: Fetch gender per unique character (~N requests)
 *
 * Saves progress to scripts/.cache/ to resume on failure.
 */

import * as fs from "fs";
import * as path from "path";

interface AnimeEntry {
  id: number;
  name: string;
}

interface JikanCharacterEntry {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
}

interface TemplateCharacter {
  id: number;
  name: string;
  image: string;
  anime: string;
  gender: "male" | "female" | "unknown";
  tags: string[];
}

interface TemplateFile {
  name: string;
  characters: TemplateCharacter[];
}

// Intermediate cache types
interface RawCharacter {
  id: number;
  name: string;
  image: string;
  anime: string;
  animeName: string;
  role: string;
}

const DELAY_MS = 500;
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 5;
const CACHE_DIR = path.resolve(__dirname, ".cache");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchWithRetry(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status === 429) {
      console.warn(`    Rate limited, waiting ${RETRY_DELAY_MS * (attempt + 1)}ms...`);
      await sleep(RETRY_DELAY_MS * (attempt + 1));
      continue;
    }
    console.error(`    Failed ${url}: ${res.status}`);
    return null;
  }
  console.error(`    Gave up after ${MAX_RETRIES} retries: ${url}`);
  return null;
}

// Phase 1: Fetch character lists per anime
async function fetchAnimeCharacters(animeId: number): Promise<JikanCharacterEntry[]> {
  const res = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
  if (!res) return [];
  const data = await res.json();
  return data.data ?? [];
}

// Phase 2: Fetch character details for gender
async function fetchCharacterGender(charId: number): Promise<"male" | "female" | "unknown"> {
  const res = await fetchWithRetry(`https://api.jikan.moe/v4/characters/${charId}`);
  if (!res) return "unknown";
  const data = await res.json();
  const about: string = data.data?.about ?? "";

  // Parse gender from the "about" text
  const genderMatch = about.match(/Gender:\s*(Male|Female)/i);
  if (genderMatch) {
    return genderMatch[1].toLowerCase() as "male" | "female";
  }

  // Some entries use different formats
  const sexMatch = about.match(/Sex:\s*(Male|Female)/i);
  if (sexMatch) {
    return sexMatch[1].toLowerCase() as "male" | "female";
  }

  return "unknown";
}

// Group anime by series (merge seasons)
function groupAnimeBySeries(animes: AnimeEntry[]): Map<string, { ids: number[]; title: string }> {
  const groups = new Map<string, { ids: number[]; title: string }>();

  // Sort by name length ascending so base titles come first
  const sorted = [...animes].sort((a, b) => a.name.length - b.name.length);

  for (const entry of sorted) {
    let matched = false;
    for (const [key, group] of groups) {
      // Check if this entry is a sequel/variant of an existing group
      if (entry.name.startsWith(key)) {
        group.ids.push(entry.id);
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.set(entry.name, { ids: [entry.id], title: entry.name });
    }
  }

  return groups;
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const animesPath = path.resolve(__dirname, "../frontend/src/data/animes-clean.json");
  const animes: AnimeEntry[] = JSON.parse(fs.readFileSync(animesPath, "utf-8"));
  console.log(`Loaded ${animes.length} anime entries`);

  const groups = groupAnimeBySeries(animes);
  console.log(`Grouped into ${groups.size} series\n`);

  // ── Phase 1: Fetch character lists per anime ──
  const phase1Cache = path.join(CACHE_DIR, "phase1-characters.json");
  let allRawCharacters: Map<number, RawCharacter>;

  if (fs.existsSync(phase1Cache)) {
    console.log("Phase 1: Loading from cache...");
    const cached: RawCharacter[] = JSON.parse(fs.readFileSync(phase1Cache, "utf-8"));
    allRawCharacters = new Map(cached.map((c) => [c.id, c]));
    console.log(`  ${allRawCharacters.size} unique characters cached\n`);
  } else {
    console.log("Phase 1: Fetching character lists per anime...");
    allRawCharacters = new Map();

    for (const [, group] of groups) {
      console.log(`  ${group.title} (${group.ids.length} entries)`);

      for (const animeId of group.ids) {
        const entries = await fetchAnimeCharacters(animeId);
        await sleep(DELAY_MS);

        // Take Main + Supporting
        const relevant = entries.filter((e) => e.role === "Main" || e.role === "Supporting");
        for (const entry of relevant) {
          if (allRawCharacters.has(entry.character.mal_id)) continue;
          allRawCharacters.set(entry.character.mal_id, {
            id: entry.character.mal_id,
            name: entry.character.name,
            image: entry.character.images.jpg.image_url,
            anime: group.title,
            animeName: group.title,
            role: entry.role,
          });
        }
      }
    }

    // Save cache
    fs.writeFileSync(phase1Cache, JSON.stringify([...allRawCharacters.values()], null, 2));
    console.log(`\nPhase 1 complete: ${allRawCharacters.size} unique characters cached\n`);
  }

  // ── Phase 2: Gender assignment ──
  // Jikan API doesn't have a reliable gender field — the "about" text rarely
  // contains "Gender: Male/Female". Instead, we load a manually curated gender
  // map from scripts/.cache/gender-overrides.json (id -> "male"|"female").
  // Any character not in the overrides file gets "unknown".
  const genderOverridesPath = path.join(CACHE_DIR, "gender-overrides.json");
  const genderMap = new Map<number, "male" | "female" | "unknown">();

  if (fs.existsSync(genderOverridesPath)) {
    const overrides: Record<string, string> = JSON.parse(fs.readFileSync(genderOverridesPath, "utf-8"));
    for (const [k, v] of Object.entries(overrides)) {
      genderMap.set(Number(k), v as "male" | "female");
    }
    console.log(`Phase 2: Loaded ${genderMap.size} gender overrides`);
  } else {
    console.log("Phase 2: No gender-overrides.json found, all characters will be 'unknown'");
  }

  // Generate a review file listing all characters for manual gender assignment
  const reviewPath = path.join(CACHE_DIR, "gender-review.json");
  const reviewEntries: { id: number; name: string; anime: string; gender: string }[] = [];
  for (const raw of allRawCharacters.values()) {
    reviewEntries.push({
      id: raw.id,
      name: raw.name,
      anime: raw.animeName,
      gender: genderMap.get(raw.id) ?? "unknown",
    });
  }
  reviewEntries.sort((a, b) => a.anime.localeCompare(b.anime) || a.name.localeCompare(b.name));
  fs.writeFileSync(reviewPath, JSON.stringify(reviewEntries, null, 2));
  console.log(`  Generated ${reviewPath} with ${reviewEntries.length} characters to review\n`);

  // ── Phase 3: Generate template files ──
  console.log("Phase 3: Generating template files...\n");

  const outputDir = path.resolve(__dirname, "../frontend/src/data/templates");
  fs.mkdirSync(outputDir, { recursive: true });

  const templateIndex: { key: string; filename: string; title: string }[] = [];

  for (const [, group] of groups) {
    // Collect characters that belong to this group's anime IDs
    const groupCharacters: TemplateCharacter[] = [];
    const seenIds = new Set<number>();

    // Re-fetch from raw to preserve correct anime association
    for (const raw of allRawCharacters.values()) {
      if (raw.animeName !== group.title) continue;
      if (seenIds.has(raw.id)) continue;
      seenIds.add(raw.id);

      const gender = genderMap.get(raw.id) ?? "unknown";
      const tags: string[] = [gender];
      if (raw.role === "Main") tags.push("main");
      if (raw.role === "Supporting") tags.push("supporting");

      groupCharacters.push({
        id: raw.id,
        name: raw.name,
        image: raw.image,
        anime: group.title,
        gender,
        tags,
      });
    }

    if (groupCharacters.length === 0) {
      console.log(`  Skipping ${group.title} (no characters)`);
      continue;
    }

    // Sort: main characters first, then supporting
    groupCharacters.sort((a, b) => {
      const aMain = a.tags.includes("main") ? 0 : 1;
      const bMain = b.tags.includes("main") ? 0 : 1;
      return aMain - bMain;
    });

    const template: TemplateFile = {
      name: group.title,
      characters: groupCharacters,
    };

    const slug = slugify(group.title);
    const filename = `${slug}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2));

    templateIndex.push({ key: slug, filename, title: group.title });
    console.log(`  ${filename} — ${groupCharacters.length} characters`);
  }

  // Generate index.ts
  const imports = templateIndex
    .map((t, i) => `import template${i} from "./${t.filename}";`)
    .join("\n");
  const entries = templateIndex
    .map((t, i) => `  "${t.key}": template${i} as CharacterTemplate,`)
    .join("\n");

  const indexContent = `import type { CharacterTemplate } from "@/types/character";
${imports}

const templates: Record<string, CharacterTemplate> = {
${entries}
};

export default templates;
`;

  fs.writeFileSync(path.join(outputDir, "index.ts"), indexContent);
  console.log(`\nGenerated index.ts with ${templateIndex.length} templates`);

  // Stats
  const genderCounts = { male: 0, female: 0, unknown: 0 };
  for (const g of genderMap.values()) genderCounts[g]++;
  console.log(`\nGender stats: ${genderCounts.male} male, ${genderCounts.female} female, ${genderCounts.unknown} unknown`);
  console.log("Done!");
}

main().catch(console.error);
