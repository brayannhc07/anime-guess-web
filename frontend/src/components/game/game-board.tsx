"use client";

import { CharacterCard } from "./character-card";
import { useGameStore } from "@/stores/game-store";
import { useGameCharacters } from "@/hooks/use-character-list";

interface GameBoardProps {
  selectable?: boolean;
  selectedId?: number | null;
  onSelectCharacter?: (id: number) => void;
}

export function GameBoard({ selectable, selectedId, onSelectCharacter }: GameBoardProps) {
  const { eliminated, toggleEliminated, phase } = useGameStore();
  const { data: characterList, isLoading } = useGameCharacters();

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

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
      {characterList.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          eliminated={eliminated.has(character.id)}
          selected={selectedId === character.id}
          selectable={selectable}
          onClick={() => handleClick(character.id)}
        />
      ))}
    </div>
  );
}
