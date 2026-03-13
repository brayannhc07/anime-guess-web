"use client";

import { useState } from "react";
import { CharacterCard } from "./character-card";
import { useGameStore } from "@/stores/game-store";
import { useGameCharacters } from "@/hooks/use-character-list";
import { Input } from "@/components/ui/input";
import { GRID_SIZE } from "@/lib/constants";

interface GameBoardProps {
  selectable?: boolean;
  selectedId?: number | null;
  onSelectCharacter?: (id: number) => void;
}

export function GameBoard({ selectable, selectedId, onSelectCharacter }: GameBoardProps) {
  const { eliminated, toggleEliminated, phase } = useGameStore();
  const { data: characterList, isLoading } = useGameCharacters();
  const [filter, setFilter] = useState("");

  if (isLoading || !characterList) {
    return (
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  function handleClick(characterId: number) {
    if (selectable && onSelectCharacter) {
      onSelectCharacter(characterId);
    } else if (phase === "playing" || phase === "selection") {
      toggleEliminated(characterId);
    }
  }

  const remaining = GRID_SIZE - eliminated.size;
  const showControls = phase === "playing";
  const filterLower = filter.trim().toLowerCase();

  return (
    <div className="space-y-2">
      {showControls && (
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filter characters..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs h-8 text-sm"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {remaining}/{GRID_SIZE} remaining
          </span>
        </div>
      )}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2" role="grid" aria-label="Character grid">
        {characterList.map((character) => {
          const dimmed = filterLower.length >= 2 && !character.name.toLowerCase().includes(filterLower);
          return (
            <div key={character.id} className={dimmed ? "opacity-30 transition-opacity" : "transition-opacity"}>
              <CharacterCard
                character={character}
                eliminated={eliminated.has(character.id)}
                selected={selectedId === character.id}
                selectable={selectable}
                onClick={() => handleClick(character.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
