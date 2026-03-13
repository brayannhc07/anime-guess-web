"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

export function AnswerPrompt() {
  const { roomCode, playerId, pendingAsk, players } = useGameStore();
  const { answerCharacter } = useGameActions();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  if (!pendingAsk || pendingAsk.askerId === playerId) return null;

  const asker = players.find((p) => p.id === pendingAsk.askerId);
  const me = players.find((p) => p.id === playerId);

  async function handleAnswer(valid: boolean) {
    setLoading(true);
    try {
      await answerCharacter(roomCode, valid);
    } catch {
      alert("Failed to answer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/60">
      <CardHeader>
        <CardTitle className="text-base">
          {t("answer.asks", { name: asker?.name ?? "Opponent" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingAsk.characterImage}
            alt={pendingAsk.characterName}
            className="aspect-[3/4] w-20 object-cover rounded"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
          <p className="text-lg font-medium">
            {t("answer.doesFit", { name: pendingAsk.characterName })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("answer.yourRule")} <span className="font-semibold text-foreground">&quot;{me?.rule}&quot;</span>
          {t("answer.doesCharacterFit")}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => handleAnswer(true)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {t("answer.yes")}
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {t("answer.no")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
