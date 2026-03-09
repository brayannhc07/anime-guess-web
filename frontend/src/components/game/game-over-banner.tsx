"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useGameCharacters } from "@/hooks/use-character-list";
import { useState } from "react";

export function GameOverBanner() {
  const { winner, playerId, guessResult, mode, roomCode, players } = useGameStore();
  const { requestRematch } = useGameActions();
  const { data: characterList } = useGameCharacters();
  const [loading, setLoading] = useState(false);

  const isWinner = winner === playerId;
  const guesser = players.find((p) => p.id === guessResult?.guesserId);
  const opponent = players.find((p) => p.id !== playerId);

  let actualDisplay: string = "";
  if (guessResult) {
    if (mode === "classic" && typeof guessResult.actualValue === "number") {
      const character = characterList?.find((c) => c.id === guessResult.actualValue);
      actualDisplay = character?.name ?? `#${guessResult.actualValue}`;
    } else {
      actualDisplay = String(guessResult.actualValue);
    }
  }

  async function handleRematch() {
    setLoading(true);
    try {
      await requestRematch(roomCode);
    } catch {
      alert("Failed to request rematch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isWinner ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
      <CardContent className="py-6 text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground dark:text-gray-800">
          {isWinner ? "You Win!" : "You Lose!"}
        </h2>
        <p className="text-muted-foreground">
          {guesser?.name} guessed{" "}
          {guessResult?.correct ? "correctly" : "incorrectly"}.
          {mode === "classic"
            ? ` The answer was ${actualDisplay}.`
            : ` The rule ${opponent?.name} set was "${actualDisplay}".`}
        </p>
        <Button onClick={handleRematch} disabled={loading}>
          {loading ? "Requesting..." : "Rematch"}
        </Button>
      </CardContent>
    </Card>
  );
}
