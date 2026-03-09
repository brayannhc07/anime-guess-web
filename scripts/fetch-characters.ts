/**
 * Seed script: fetches characters from Jikan API for animes in kaizo_animes.json
 * and outputs template JSON files to frontend/src/data/templates/.
 *
 * Usage: npx tsx scripts/fetch-characters.ts
 *
 * Respects Jikan rate limit (3 req/sec) with delays.
 * After running, manually curate the output JSON files.
 */

import * as fs from "fs";
import * as path from "path";

interface MalEntry {
  anime_id: number;
  anime_title: string;
  anime_title_eng: string;
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
}

interface TemplateFile {
  name: string;
  characters: TemplateCharacter[];
}

const DELAY_MS = 400; // ~2.5 req/sec, safely under Jikan's 3 req/sec limit

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchCharacters(animeId: number): Promise<JikanCharacterEntry[]> {
  const url = `https://api.jikan.moe/v4/anime/${animeId}/characters`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  Failed to fetch ${url}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.data ?? [];
}

async function main() {
  const kaizaPath = path.resolve(__dirname, "../kaizo_animes.json");
  const raw = fs.readFileSync(kaizaPath, "utf-8");
  const entries: MalEntry[] = JSON.parse(raw);

  // Group entries by shortest english title (group seasons together)
  const groups = new Map<string, { ids: number[]; title: string }>();

  for (const entry of entries) {
    const title = entry.anime_title_eng || entry.anime_title;
    // Find if this title is a substring of or contains an existing group key
    let matched = false;
    for (const [key, group] of groups) {
      if (title.startsWith(key) || key.startsWith(title)) {
        group.ids.push(entry.anime_id);
        // Use the shorter title as the group name
        if (title.length < key.length) {
          groups.delete(key);
          group.title = title;
          groups.set(title, group);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      groups.set(title, { ids: [entry.anime_id], title });
    }
  }

  const outputDir = path.resolve(__dirname, "../frontend/src/data/templates");
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [, group] of groups) {
    console.log(`\nProcessing: ${group.title} (${group.ids.length} seasons)`);

    const seenIds = new Set<number>();
    const characters: TemplateCharacter[] = [];

    for (const animeId of group.ids) {
      console.log(`  Fetching anime ${animeId}...`);
      const entries = await fetchCharacters(animeId);
      await sleep(DELAY_MS);

      const mainChars = entries.filter((e) => e.role === "Main");
      for (const entry of mainChars) {
        if (seenIds.has(entry.character.mal_id)) continue;
        seenIds.add(entry.character.mal_id);
        characters.push({
          id: entry.character.mal_id,
          name: entry.character.name,
          image: entry.character.images.jpg.image_url,
          anime: group.title,
        });
      }
    }

    if (characters.length === 0) {
      console.log(`  No main characters found, skipping.`);
      continue;
    }

    const template: TemplateFile = {
      name: group.title,
      characters,
    };

    const filename = `${slugify(group.title)}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2));
    console.log(`  Wrote ${filename} (${characters.length} characters)`);
  }

  console.log("\nDone! Curate the output files manually.");
}

main().catch(console.error);
