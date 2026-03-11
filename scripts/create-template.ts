/**
 * Creates a character template from a MAL anime ID using the Jikan API.
 *
 * Usage: npx tsx scripts/create-template.ts <anime_id>
 *
 * Example: npx tsx scripts/create-template.ts 16498
 *          (creates a template for Attack on Titan)
 *
 * The script will:
 *   1. Fetch anime info (title) from Jikan
 *   2. Fetch all Main + Supporting characters
 *   3. Fetch gender for each character from their profile
 *   4. Write the template JSON to frontend/src/data/templates/
 *   5. Update the index.ts to include the new template
 */

import * as fs from "fs";
import * as path from "path";

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

const DELAY_MS = 500;
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 5;

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
      console.warn(`  Rate limited, waiting ${RETRY_DELAY_MS * (attempt + 1)}ms...`);
      await sleep(RETRY_DELAY_MS * (attempt + 1));
      continue;
    }
    console.error(`  Failed ${url}: ${res.status}`);
    return null;
  }
  console.error(`  Gave up after ${MAX_RETRIES} retries: ${url}`);
  return null;
}

async function fetchAnimeTitle(animeId: number): Promise<string | null> {
  console.log(`Fetching anime info for ID ${animeId}...`);
  const res = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${animeId}`);
  if (!res) return null;
  const data = await res.json();
  return data.data?.title_english || data.data?.title || null;
}

async function fetchAnimeCharacters(animeId: number): Promise<JikanCharacterEntry[]> {
  console.log(`Fetching characters for anime ID ${animeId}...`);
  const allEntries: JikanCharacterEntry[] = [];
  let page = 1;

  while (true) {
    const res = await fetchWithRetry(
      `https://api.jikan.moe/v4/anime/${animeId}/characters?page=${page}`
    );
    if (!res) break;
    const data = await res.json();
    const entries: JikanCharacterEntry[] = data.data ?? [];
    if (entries.length === 0) break;
    allEntries.push(...entries);
    if (!data.pagination?.has_next_page) break;
    page++;
    await sleep(DELAY_MS);
  }

  return allEntries;
}

function inferGenderFromAbout(about: string): "male" | "female" | "unknown" {
  // Explicit gender/sex fields
  const genderMatch = about.match(/Gender:\s*(Male|Female)/i);
  if (genderMatch) return genderMatch[1].toLowerCase() as "male" | "female";

  const sexMatch = about.match(/Sex:\s*(Male|Female)/i);
  if (sexMatch) return sexMatch[1].toLowerCase() as "male" | "female";

  // Pronoun-based heuristic: count gendered pronouns in the text
  const lower = about.toLowerCase();
  const femalePatterns = /\b(she|her|heroine|girl|woman|wife|mother|daughter|queen|princess|goddess)\b/g;
  const malePatterns = /\b(he|his|him|hero|boy|man|husband|father|son|king|prince|god)\b/g;

  const femaleCount = (lower.match(femalePatterns) || []).length;
  const maleCount = (lower.match(malePatterns) || []).length;

  // Require a meaningful margin to avoid false positives
  if (femaleCount > maleCount && femaleCount >= 2) return "female";
  if (maleCount > femaleCount && maleCount >= 2) return "male";

  return "unknown";
}

async function fetchCharacterGender(charId: number): Promise<"male" | "female" | "unknown"> {
  const res = await fetchWithRetry(`https://api.jikan.moe/v4/characters/${charId}`);
  if (!res) return "unknown";
  const data = await res.json();
  const about: string = data.data?.about ?? "";

  return inferGenderFromAbout(about);
}

function updateIndexFile(templatesDir: string) {
  const files = fs
    .readdirSync(templatesDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const imports = files
    .map((f, i) => `import template${i} from "./${f}";`)
    .join("\n");

  const entries = files
    .map((f, i) => {
      const key = f.replace(/\.json$/, "");
      return `  "${key}": template${i} as CharacterTemplate,`;
    })
    .join("\n");

  const indexContent = `import type { CharacterTemplate } from "@/types/character";
${imports}

const templates: Record<string, CharacterTemplate> = {
${entries}
};

export default templates;
`;

  fs.writeFileSync(path.join(templatesDir, "index.ts"), indexContent);
  console.log(`\nUpdated index.ts with ${files.length} templates`);
}

async function main() {
  const animeId = parseInt(process.argv[2], 10);
  if (!animeId || isNaN(animeId)) {
    console.error("Usage: npx tsx scripts/create-template.ts <anime_id>");
    console.error("Example: npx tsx scripts/create-template.ts 16498");
    process.exit(1);
  }

  // Step 1: Get anime title
  const title = await fetchAnimeTitle(animeId);
  if (!title) {
    console.error("Could not fetch anime info. Check the ID and try again.");
    process.exit(1);
  }
  console.log(`Anime: ${title}\n`);
  await sleep(DELAY_MS);

  // Step 2: Fetch characters
  const entries = await fetchAnimeCharacters(animeId);
  const relevant = entries.filter((e) => e.role === "Main" || e.role === "Supporting");
  console.log(`Found ${relevant.length} characters (Main + Supporting)\n`);

  if (relevant.length === 0) {
    console.error("No characters found for this anime.");
    process.exit(1);
  }

  // Step 3: Fetch gender for each character
  console.log("Fetching gender info...");
  const characters: TemplateCharacter[] = [];

  for (const entry of relevant) {
    await sleep(DELAY_MS);
    const gender = await fetchCharacterGender(entry.character.mal_id);
    const tags: string[] = [gender];
    if (entry.role === "Main") tags.push("main");
    if (entry.role === "Supporting") tags.push("supporting");

    characters.push({
      id: entry.character.mal_id,
      name: entry.character.name,
      image: entry.character.images.jpg.image_url,
      anime: title,
      gender,
      tags,
    });

    console.log(`  ${entry.character.name} — ${gender} (${entry.role})`);
  }

  // Sort: main first, then supporting
  characters.sort((a, b) => {
    const aMain = a.tags.includes("main") ? 0 : 1;
    const bMain = b.tags.includes("main") ? 0 : 1;
    return aMain - bMain;
  });

  // Step 4: Write template JSON
  const template: TemplateFile = { name: title, characters };
  const slug = slugify(title);
  const templatesDir = path.resolve(__dirname, "../frontend/src/data/templates");
  const outputPath = path.join(templatesDir, `${slug}.json`);

  if (fs.existsSync(outputPath)) {
    console.warn(`\nWarning: ${slug}.json already exists and will be overwritten.`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
  console.log(`\nWrote ${slug}.json — ${characters.length} characters`);

  // Step 5: Update index.ts
  updateIndexFile(templatesDir);

  // Stats
  const genderCounts = { male: 0, female: 0, unknown: 0 };
  for (const c of characters) genderCounts[c.gender]++;
  console.log(
    `\nGender stats: ${genderCounts.male} male, ${genderCounts.female} female, ${genderCounts.unknown} unknown`
  );
  console.log("Done!");
}

main().catch(console.error);
