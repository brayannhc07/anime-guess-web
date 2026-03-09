"use client";

import type { AnimeCharacter } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: AnimeCharacter;
  eliminated: boolean;
  selected?: boolean;
  selectable?: boolean;
  onClick: () => void;
}

export function CharacterCard({ character, eliminated, selected, selectable, onClick }: CharacterCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 p-2 transition-all flex flex-col items-center gap-1",
        "hover:border-primary/50 hover:shadow-md",
        eliminated && "opacity-40 grayscale",
        selected && "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50",
        selectable && !selected && "border-blue-300 cursor-pointer",
        !selectable && !eliminated && "border-border"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.image}
        alt={character.name}
        className="aspect-[3/4] w-full object-cover rounded"
        loading="lazy"
      />
      <span className="text-xs font-medium truncate w-full text-center">
        {character.name}
      </span>
      {eliminated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-red-500/70">X</span>
        </div>
      )}
    </button>
  );
}
