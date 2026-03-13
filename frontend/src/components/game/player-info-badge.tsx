"use client";

import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/stores/game-store";
import { useGameCharacters } from "@/hooks/use-character-list";
import { isPokemonSprite } from "@/lib/pokemon";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PlayerInfoBadge() {
  const { playerId, players, mode, phase } = useGameStore();
  const { data: characterList } = useGameCharacters();

  const me = players.find((p) => p.id === playerId);
  if (!me || !me.lockedIn) return null;
  if (phase !== "playing" && phase !== "finished") return null;

  if (mode === "classic" && me.selection && characterList) {
    const character = characterList.find((c) => c.id === me.selection);
    if (!character) return null;

    const pokemon = isPokemonSprite(character.image);

    return (
      <div className="sticky bottom-4 mt-4 flex justify-end pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          <div className="rounded-lg border-2 border-yellow-400 bg-background shadow-lg p-1.5 w-16 sm:w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.image}
              alt={character.name}
              className={cn(
                "w-full rounded",
                pokemon
                  ? "aspect-square object-contain [image-rendering:pixelated]"
                  : "aspect-[3/4] object-cover"
              )}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
            <p className={cn("text-[10px] font-medium text-center truncate mt-0.5", pokemon && "capitalize")}>
              {character.name}
            </p>
          </div>
          <Badge variant="default" className="text-[10px] px-2 py-0.5 shadow-lg">
            Your pick
          </Badge>
        </div>
      </div>
    );
  }

  if (mode === "rule-master" && me.rule) {
    return (
      <div className="sticky bottom-4 mt-4 flex justify-end pointer-events-none">
        <div className="pointer-events-auto">
          <Badge variant="default" className="text-sm px-3 py-1.5 shadow-lg max-w-48">
            Rule you set: &quot;{me.rule}&quot;
          </Badge>
        </div>
      </div>
    );
  }

  return null;
}
