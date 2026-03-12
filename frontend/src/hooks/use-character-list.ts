"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnimeCharacter } from "@/types/character";
import templates from "@/data/templates";
import { GRID_SIZE } from "@/lib/constants";
import { getSpriteUrl, pokemonToAnimeCharacter } from "@/lib/pokemon";

// --------------- Template functions (sync) ---------------

export function getTemplateList(): { key: string; name: string; count: number }[] {
  return Object.entries(templates).map(([key, t]) => ({
    key,
    name: t.name,
    count: t.characters.length,
  }));
}

export function getTemplateCharacters(key: string): AnimeCharacter[] {
  return templates[key]?.characters ?? [];
}

export type GenderFilter = "all" | "male" | "female";

export function getMultiTemplateCharacters(keys: string[], genderFilter: GenderFilter = "all"): AnimeCharacter[] {
  const seen = new Set<number>();
  const result: AnimeCharacter[] = [];
  for (const key of keys) {
    for (const c of (templates[key]?.characters ?? [])) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        if (genderFilter === "all" || c.gender === genderFilter) {
          result.push(c);
        }
      }
    }
  }
  return result;
}

export function getMultiTemplatePoolSize(keys: string[], genderFilter: GenderFilter = "all"): number {
  return getMultiTemplateCharacters(keys, genderFilter).length;
}

export function pickRandomFromTemplates(keys: string[], count: number, genderFilter: GenderFilter = "all"): AnimeCharacter[] {
  const chars = getMultiTemplateCharacters(keys, genderFilter);
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, count);
}

export function getCharactersByIds(ids: number[]): AnimeCharacter[] {
  const lookup = new Map<number, AnimeCharacter>();
  for (const t of Object.values(templates)) {
    for (const c of t.characters) {
      if (!lookup.has(c.id)) {
        lookup.set(c.id, c);
      }
    }
  }
  // Preserve the order of the input ids (which is already shuffled)
  return ids.map((id) => lookup.get(id)).filter((c): c is AnimeCharacter => c !== undefined);
}

// --------------- Search mode (async, Jikan API) ---------------

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

interface JikanAnimeResult {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

async function fetchCharactersByAnime(animeId: number): Promise<AnimeCharacter[]> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
  if (!res.ok) throw new Error(`Failed to fetch characters for anime ${animeId}`);
  const data = await res.json();
  const entries: JikanCharacterEntry[] = data.data ?? [];

  // Prioritize main characters, then fill with supporting
  const main = entries.filter((e) => e.role === "Main");
  const supporting = entries.filter((e) => e.role === "Supporting");
  const ordered = [...main, ...supporting];

  return ordered.map((entry) => ({
    id: entry.character.mal_id,
    name: entry.character.name,
    image: entry.character.images.jpg.image_url,
    anime: "",
  }));
}

async function searchAnime(query: string): Promise<JikanAnimeResult[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query.trim())}&limit=5`
  );
  if (!res.ok) throw new Error("Failed to search anime");
  const data = await res.json();
  return data.data ?? [];
}

export function useAnimeSearch(query: string) {
  return useQuery({
    queryKey: ["anime-search", query],
    queryFn: () => searchAnime(query),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

export function useAnimeCharacters(animeId: number | null) {
  return useQuery({
    queryKey: ["anime-characters", animeId],
    queryFn: () => fetchCharactersByAnime(animeId!),
    enabled: animeId !== null,
    staleTime: Infinity,
  });
}

// --------------- Pokemon functions (async, PokeAPI) ---------------

async function fetchPokemonByIds(ids: number[]): Promise<AnimeCharacter[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`);
      const data = await res.json();
      return pokemonToAnimeCharacter(id, data.name);
    })
  );
  return results;
}

async function fetchAllPokemonNames(): Promise<AnimeCharacter[]> {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  if (!res.ok) throw new Error("Failed to fetch pokemon list");
  const data = await res.json();
  return (data.results as { name: string; url: string }[]).map((p, i) =>
    pokemonToAnimeCharacter(i + 1, p.name)
  );
}

export function usePokemonByIds(ids: number[], enabled: boolean) {
  return useQuery({
    queryKey: ["pokemon-by-ids", ids],
    queryFn: () => fetchPokemonByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: Infinity,
  });
}

export function usePokemonSearch(query: string, enabled: boolean) {
  const { data: allPokemon, isLoading } = useQuery({
    queryKey: ["all-pokemon-names"],
    queryFn: fetchAllPokemonNames,
    enabled,
    staleTime: Infinity,
  });

  const filtered = query.trim().length >= 2
    ? allPokemon?.filter((p) => p.name.includes(query.trim().toLowerCase()))
    : allPokemon;

  return { data: filtered, isLoading };
}

// --------------- Unified game hook ---------------

import { useGameStore } from "@/stores/game-store";

export function useGameCharacters() {
  const { characterSource, searchAnimeId, characterIds } = useGameStore();

  const { data: searchCharacters, isLoading: searchLoading } = useAnimeCharacters(
    characterSource === "search" ? searchAnimeId : null
  );

  const { data: pokemonCharacters, isLoading: pokemonLoading } = usePokemonByIds(
    characterIds,
    characterSource === "pokemon"
  );

  if (characterSource === "template") {
    const characters = getCharactersByIds(characterIds);
    return { data: characters, isLoading: false };
  }

  if (characterSource === "pokemon") {
    return { data: pokemonCharacters, isLoading: pokemonLoading };
  }

  // Search mode: filter fetched characters to only those in characterIds
  const idSet = new Set(characterIds);
  const filtered = searchCharacters?.filter((c) => idSet.has(c.id));
  return { data: filtered, isLoading: searchLoading };
}

// --------------- All characters hook (used by CharacterSearch in rule-master) ---------------

export function useAllCharacters() {
  const { characterSource, templateKeys, searchAnimeId } = useGameStore();

  const { data: searchCharacters, isLoading: searchLoading } = useAnimeCharacters(
    characterSource === "search" ? searchAnimeId : null
  );

  const { data: allPokemon, isLoading: pokemonLoading } = useQuery({
    queryKey: ["all-pokemon-names"],
    queryFn: fetchAllPokemonNames,
    enabled: characterSource === "pokemon",
    staleTime: Infinity,
  });

  if (characterSource === "template") {
    return { data: getMultiTemplateCharacters(templateKeys), isLoading: false };
  }

  if (characterSource === "pokemon") {
    return { data: allPokemon, isLoading: pokemonLoading };
  }

  return { data: searchCharacters, isLoading: searchLoading };
}

