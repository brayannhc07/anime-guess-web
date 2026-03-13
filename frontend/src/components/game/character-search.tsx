"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useAllCharacters } from "@/hooks/use-character-list";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

export function CharacterSearch() {
  const { roomCode, playerId, currentTurn, pendingAsk, askedCharacters } = useGameStore();
  const { askCharacter } = useGameActions();
  const { data: allCharacters } = useAllCharacters();
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const { t } = useLanguage();

  const isMyTurn = currentTurn === playerId;
  const isWaitingForAnswer = pendingAsk !== null;
  const results = useMemo(() => {
    if (!allCharacters || query.trim().length < 2) return [];
    const alreadyAskedIds = new Set(
      askedCharacters.filter((c) => c.askerId === playerId).map((c) => c.id)
    );
    return allCharacters
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) &&
          !alreadyAskedIds.has(c.id)
      )
      .slice(0, 8);
  }, [allCharacters, query, askedCharacters, playerId]);

  async function handleAsk(character: { id: number; name: string; image: string }) {
    // Optimistic: immediately show as pending on the board
    const { addAskedCharacter, setPendingAsk } = useGameStore.getState();
    addAskedCharacter({ id: character.id, name: character.name, image: character.image, valid: null, askerId: playerId });
    setQuery("");
    setAsking(true);
    try {
      await askCharacter(roomCode, character.id, character.name, character.image);
    } catch {
      // Rollback: remove the optimistic entry
      const { askedCharacters, setAskedCharacters } = useGameStore.getState();
      setAskedCharacters(askedCharacters.filter((c) => !(c.id === character.id && c.askerId === playerId && c.valid === null)));
      alert("Failed to ask");
    } finally {
      setAsking(false);
    }
  }

  if (!isMyTurn || isWaitingForAnswer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Turn - Ask About a Character</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder={t("ruleMaster.searchCharacter")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={asking}
        />
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {results.map((character) => (
              <Button
                key={character.id}
                variant="outline"
                className="flex flex-col items-center h-auto py-2"
                disabled={asking}
                onClick={() => handleAsk(character)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={character.image}
                  alt={character.name}
                  className="aspect-[3/4] w-12 object-cover rounded"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
                <span className="text-xs">{character.name}</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
