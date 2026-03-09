"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";

export function RuleGuessPrompt() {
  const { roomCode, playerId, pendingRuleGuess, players } = useGameStore();
  const { judgeRuleGuess } = useGameActions();
  const [loading, setLoading] = useState(false);

  if (!pendingRuleGuess || pendingRuleGuess.guesserId === playerId) return null;

  const me = players.find((p) => p.id === playerId);
  const guesser = players.find((p) => p.id === pendingRuleGuess.guesserId);

  async function handleJudge(correct: boolean) {
    setLoading(true);
    try {
      await judgeRuleGuess(roomCode, correct);
    } catch {
      alert("Failed to judge");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-purple-400 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-base text-foreground dark:text-gray-900">
          {guesser?.name ?? "Opponent"} is guessing your rule!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your rule: <span className="font-semibold text-foreground dark:text-gray-900">&quot;{me?.rule}&quot;</span>
          </p>
          <p className="text-lg font-medium text-foreground dark:text-gray-900">
            Their guess: <span className="text-purple-700">&quot;{pendingRuleGuess.guess}&quot;</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Is this guess close enough to your rule?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => handleJudge(true)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Correct
          </Button>
          <Button
            onClick={() => handleJudge(false)}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            Wrong
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
