"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnimeCharacter } from "@/types/pokemon";
import type { AnimePreset } from "@/types/room";
import { ANIME_PRESETS, GRID_SIZE } from "@/lib/constants";

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

async function fetchCharactersByAnime(animeId: number): Promise<AnimeCharacter[]> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
  if (!res.ok) throw new Error(`Failed to fetch characters for anime ${animeId}`);
  const data = await res.json();
  const entries: JikanCharacterEntry[] = data.data ?? [];

  // Prioritize main characters, then fill with supporting
  const main = entries.filter((e) => e.role === "Main");
  const supporting = entries.filter((e) => e.role === "Supporting");
  const ordered = [...main, ...supporting].slice(0, GRID_SIZE);

  return ordered.map((entry) => ({
    id: entry.character.mal_id,
    name: entry.character.name,
    image: entry.character.images.jpg.image_url,
  }));
}

export function useCharacterList(anime: AnimePreset) {
  const animeId = ANIME_PRESETS[anime].id;
  return useQuery({
    queryKey: ["characters", animeId],
    queryFn: () => fetchCharactersByAnime(animeId),
    enabled: !!animeId,
    staleTime: Infinity,
  });
}

export function useCharacterListByIds(characterIds: number[], anime: AnimePreset) {
  const { data: allCharacters, ...rest } = useCharacterList(anime);

  const filtered = allCharacters?.filter((c) => characterIds.includes(c.id));

  return { data: filtered, ...rest };
}
