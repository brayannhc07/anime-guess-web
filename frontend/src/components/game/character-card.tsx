"use client";

import type { AnimeCharacter } from "@/types/character";
import { cn } from "@/lib/utils";
import { isPokemonSprite } from "@/lib/pokemon";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

interface CharacterCardProps {
  character: AnimeCharacter;
  eliminated: boolean;
  selected?: boolean;
  selectable?: boolean;
  onClick: () => void;
}

export function CharacterCard({ character, eliminated, selected, selectable, onClick }: CharacterCardProps) {
  const isPokemon = isPokemonSprite(character.image);

  return (
    <button
      onClick={onClick}
      aria-label={`${character.name}${eliminated ? " (eliminated)" : ""}${selected ? " (selected)" : ""}`}
      aria-pressed={selected}
      className={cn(
        "relative rounded-lg border-2 p-2 transition-all flex flex-col items-center gap-1",
        "hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        eliminated && "opacity-40 grayscale",
        selected && "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-950/60",
        selectable && !selected && "border-blue-300 cursor-pointer",
        !selectable && !eliminated && "border-border"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.image}
        alt={character.name}
        className={cn(
          "w-full rounded",
          isPokemon
            ? "aspect-square object-contain [image-rendering:pixelated]"
            : "aspect-[3/4] object-cover"
        )}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
      />
      <span className={cn("text-xs font-medium truncate w-full text-center", isPokemon && "capitalize")}>
        {character.name}
      </span>
      {eliminated && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-red-500/70">X</span>
        </div>
      )}
    </button>
  );
}
