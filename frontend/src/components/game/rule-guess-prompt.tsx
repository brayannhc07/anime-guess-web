"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export function RuleGuessPrompt() {
  const { roomCode, playerId, pendingRuleGuess, players } = useGameStore();
  const { judgeRuleGuess } = useGameActions();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  if (!pendingRuleGuess || pendingRuleGuess.guesserId === playerId) return null;

  const me = players.find((p) => p.id === playerId);
  const guesser = players.find((p) => p.id === pendingRuleGuess.guesserId);

  async function handleJudge(correct: boolean) {
    setLoading(true);
    try {
      await judgeRuleGuess(roomCode, correct);
    } catch {
      toast.error(t("error.judge"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-purple-400 bg-purple-50 dark:bg-purple-950/60">
      <CardHeader>
        <CardTitle className="text-base">
          {t("ruleGuess.guessing", { name: guesser?.name ?? "Opponent" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("ruleGuess.yourRule")} <span className="font-semibold text-foreground">&quot;{me?.rule}&quot;</span>
          </p>
          <p className="text-lg font-medium">
            {t("ruleGuess.theirGuess")} <span className="text-purple-700 dark:text-purple-300">&quot;{pendingRuleGuess.guess}&quot;</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("ruleGuess.closeEnough")}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => handleJudge(true)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {t("ruleGuess.correct")}
          </Button>
          <Button
            onClick={() => handleJudge(false)}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {t("ruleGuess.wrong")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
