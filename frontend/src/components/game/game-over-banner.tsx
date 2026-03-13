"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useGameCharacters } from "@/hooks/use-character-list";
import { getStats, resetStats } from "@/lib/game-stats";
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
    <Card className={isWinner ? "border-green-500 bg-green-50 dark:bg-green-950/60" : "border-red-500 bg-red-50 dark:bg-red-950/60"}>
      <CardContent className="py-6 text-center space-y-3">
        <h2 className="text-2xl font-bold">
          {isWinner ? "You Win!" : "You Lose!"}
        </h2>
        <p className="text-muted-foreground">
          {guesser?.name} guessed{" "}
          {guessResult?.correct ? "correctly" : "incorrectly"}.
          {mode === "classic"
            ? ` The answer was ${actualDisplay}.`
            : ` The rule ${opponent?.name} set was "${actualDisplay}".`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={handleRematch} disabled={loading}>
            {loading ? "Requesting..." : "Rematch"}
          </Button>
        </div>
        <StatsDisplay />
      </CardContent>
    </Card>
  );
}

function StatsDisplay() {
  const [, forceUpdate] = useState(0);
  const stats = getStats();
  if (stats.wins === 0 && stats.losses === 0) return null;

  const streakText =
    stats.streak > 1
      ? `${stats.streak}W streak`
      : stats.streak < -1
        ? `${Math.abs(stats.streak)}L streak`
        : null;

  return (
    <p className="text-xs text-muted-foreground">
      {stats.wins}W - {stats.losses}L
      {streakText && <span className="ml-1.5 font-medium">{streakText}</span>}
      <button
        onClick={() => { resetStats(); forceUpdate((n) => n + 1); }}
        className="ml-2 underline hover:text-foreground transition-colors"
      >
        reset
      </button>
    </p>
  );
}
