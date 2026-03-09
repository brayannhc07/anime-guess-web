"use client";

import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/stores/game-store";
import { useGameCharacters } from "@/hooks/use-character-list";

export function PlayerInfoBadge() {
  const { playerId, players, mode } = useGameStore();
  const { data: characterList } = useGameCharacters();

  const me = players.find((p) => p.id === playerId);
  if (!me || !me.lockedIn) return null;

  let displayText: string;
  if (mode === "classic" && me.selection && characterList) {
    const character = characterList.find((c) => c.id === me.selection);
    displayText = `Your pick: ${character?.name ?? `#${me.selection}`}`;
  } else if (mode === "rule-master" && me.rule) {
    displayText = `Rule you set: "${me.rule}"`;
  } else {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="default" className="text-sm px-3 py-1.5 shadow-lg">
        {displayText}
      </Badge>
    </div>
  );
}
