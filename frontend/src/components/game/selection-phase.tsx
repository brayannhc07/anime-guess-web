"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard } from "./game-board";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useLanguage } from "@/contexts/language-context";

export function SelectionPhase() {
  const { mode, roomCode, playerId, players, characterIds, setPlayers, setAskedCharacters, clearEliminated } = useGameStore();
  const { selectCharacter } = useGameActions();
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rule, setRule] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear state from previous game when entering selection
  useEffect(() => {
    setAskedCharacters([]);
    clearEliminated();
  }, [setAskedCharacters, clearEliminated]);

  const me = players.find((p) => p.id === playerId);
  const opponent = players.find((p) => p.id !== playerId);
  const isLockedIn = me?.lockedIn ?? false;

  async function handleLockIn() {
    if (mode === "classic" && !selectedId) return;
    if (mode === "rule-master" && !rule.trim()) return;

    setLoading(true);
    try {
      await selectCharacter(
        roomCode,
        mode === "classic" ? selectedId : null,
        mode === "rule-master" ? rule.trim() : null
      );
      // Store the rule/selection locally on our player object
      setPlayers(
        players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                selection: mode === "classic" ? selectedId : null,
                rule: mode === "rule-master" ? rule.trim() : null,
                lockedIn: true,
              }
            : p
        )
      );
    } catch {
      alert("Failed to lock in");
    } finally {
      setLoading(false);
    }
  }

  if (isLockedIn) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-lg font-medium">{t("selection.lockedIn")}</p>
          </CardContent>
        </Card>
        {mode === "classic" && <GameBoard />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "classic"
              ? t("selection.pickCharacter")
              : `Set a Rule for ${opponent?.name ?? "Opponent"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {mode === "classic" ? (
            <p className="text-sm text-muted-foreground">
              Click a character below or pick randomly. Your opponent will try to guess which one you picked.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Write a secret rule for your opponent to figure out. They&apos;ll ask you about
                characters and you&apos;ll answer yes/no based on whether each one fits your rule.
              </p>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                <p className="text-xs font-medium">{t("selection.tipsTitle")}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>{t("selection.tip1")}</li>
                  <li>{t("selection.tip2")}</li>
                  <li>{t("selection.tip3")}</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("selection.examples")}
                </p>
              </div>
              <Input
                placeholder={t("selection.enterRule")}
                value={rule}
                onChange={(e) => setRule(e.target.value)}
              />
            </div>
          )}
          <div className="flex gap-2 w-full">
            {mode === "classic" && (
              <Button
                variant="outline"
                onClick={() => {
                  const randomId = characterIds[Math.floor(Math.random() * characterIds.length)];
                  setSelectedId(randomId);
                }}
                disabled={loading}
                className="flex-none"
              >
                {t("selection.random")}
              </Button>
            )}
            <Button
              onClick={handleLockIn}
              disabled={
                loading ||
                (mode === "classic" && !selectedId) ||
                (mode === "rule-master" && !rule.trim())
              }
              className="flex-1"
            >
              {loading ? "Locking in..." : t("selection.lockIn")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mode === "classic" && (
        <GameBoard
          selectable
          selectedId={selectedId}
          onSelectCharacter={setSelectedId}
        />
      )}
    </div>
  );
}
