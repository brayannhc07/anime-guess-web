"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameBoard } from "./game-board";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";

export function SelectionPhase() {
  const { mode, roomCode, playerId, players, characterIds, setPlayers, setAskedCharacters, clearEliminated } = useGameStore();
  const { selectCharacter } = useGameActions();
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
            <p className="text-lg font-medium">You&apos;re locked in!</p>
            <p className="text-muted-foreground">Waiting for opponent...</p>
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
              ? "Pick Your Character"
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
                <p className="text-xs font-medium">Tips for good rules:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Be specific enough that your opponent can guess it</li>
                  <li>Make sure multiple characters can match (not just one)</li>
                  <li>Base it on visible traits, story roles, or well-known facts</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Examples: &quot;Has blue hair&quot;, &quot;Is a villain&quot;, &quot;Uses a sword&quot;,
                  &quot;Female character&quot;, &quot;From a shonen anime&quot;
                </p>
              </div>
              <Input
                placeholder="Enter a rule for your opponent..."
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
                Random
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
              {loading ? "Locking in..." : "Lock In"}
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
