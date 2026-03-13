import type { AnimeCharacter } from "@/types/character";

export const GENERATION_RANGES: Record<string, [number, number]> = {
  gen1: [1, 151],
  gen2: [152, 251],
  gen3: [252, 386],
  gen4: [387, 493],
  gen5: [494, 649],
  gen6: [650, 721],
  gen7: [722, 809],
  gen8: [810, 905],
  gen9: [906, 1025],
};

export const GENERATION_LABELS: Record<string, string> = {
  gen1: "Gen 1 — Kanto (151)",
  gen2: "Gen 2 — Johto (100)",
  gen3: "Gen 3 — Hoenn (135)",
  gen4: "Gen 4 — Sinnoh (107)",
  gen5: "Gen 5 — Unova (156)",
  gen6: "Gen 6 — Kalos (72)",
  gen7: "Gen 7 — Alola (88)",
  gen8: "Gen 8 — Galar (96)",
  gen9: "Gen 9 — Paldea (120)",
};

export function getGenerationSize(generation: string): number {
  const range = GENERATION_RANGES[generation];
  if (!range) return 0;
  return range[1] - range[0] + 1;
}

export function getMultiGenerationSize(generations: string[]): number {
  let total = 0;
  for (const gen of generations) total += getGenerationSize(gen);
  return total;
}

export function pickRandomPokemonIds(generation: string, count: number): number[] {
  const range = GENERATION_RANGES[generation];
  if (!range) return [];
  const [min, max] = range;

  const allIds: number[] = [];
  for (let i = min; i <= max; i++) allIds.push(i);

  // Fisher-Yates shuffle
  for (let i = allIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
  }

  return allIds.slice(0, count);
}

export function pickRandomPokemonIdsMultiGen(generations: string[], count: number): number[] {
  const allIds: number[] = [];
  for (const gen of generations) {
    const range = GENERATION_RANGES[gen];
    if (!range) continue;
    for (let i = range[0]; i <= range[1]; i++) allIds.push(i);
  }

  for (let i = allIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
  }

  return allIds.slice(0, count);
}

export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function isPokemonSprite(url: string): boolean {
  return url.startsWith("https://raw.githubusercontent.com/PokeAPI/sprites");
}

export function pokemonToAnimeCharacter(id: number, name: string): AnimeCharacter {
  return {
    id,
    name,
    image: getSpriteUrl(id),
    anime: "Pokemon",
  };
}
