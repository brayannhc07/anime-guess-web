import type { AnimePreset } from "@/types/room";

export const GRID_SIZE = 24;

export const ANIME_PRESETS: Record<AnimePreset, { id: number; title: string }> = {
  rezero: { id: 31240, title: "Re:Zero" },
  aot: { id: 16498, title: "Attack on Titan" },
  kaguya: { id: 37999, title: "Kaguya-sama: Love Is War" },
  frieren: { id: 52991, title: "Frieren: Beyond Journey's End" },
  konosuba: { id: 30831, title: "KonoSuba" },
};

export const ANIME_LABELS: Record<AnimePreset, string> = {
  rezero: "Re:Zero",
  aot: "Attack on Titan",
  kaguya: "Kaguya-sama",
  frieren: "Frieren",
  konosuba: "KonoSuba",
};

export const MODE_LABELS: Record<string, string> = {
  classic: "Classic",
  "rule-master": "Rule Master",
};
